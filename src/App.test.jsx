import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";
import { StoreProvider } from "./context/StoreContext.jsx";
import { anilistFixture, mockAniListFetch } from "./test/anilistMock.js";

function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <StoreProvider><App /></StoreProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.stubGlobal("fetch", mockAniListFetch());
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe("MANGAVERSE discovery platform", () => {
  it("loads real catalogue-shaped series into independent manga and anime carousels", async () => {
    renderApp();
    expect(await screen.findByRole("heading", { name: "Trending anime" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Popular manga" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Popular manga carousel" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View details for One Piece" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scroll Popular manga right" })).toBeInTheDocument();
    expect(await screen.findByText("Live catalogue from AniList")).toBeInTheDocument();
  });

  it("filters manga by AniList genre and supports title sorting", async () => {
    const user = userEvent.setup();
    renderApp("/manga");
    const filter = screen.getByRole("combobox", { name: "Filter series by genre" });
    await user.selectOptions(filter, "Fantasy");
    expect(screen.getByRole("link", { name: "View details for Black Clover" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View details for One Piece" })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox", { name: "Sort series" }), "title");
    expect(screen.getByText("1 titles")).toBeInTheDocument();
  });

  it("searches AniList titles and supports searching local catalogue genres", async () => {
    const user = userEvent.setup();
    renderApp();
    const input = screen.getByRole("textbox", { name: "Search anime, manga and genres" });
    await user.type(input, "One Piece");
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("heading", { name: "Find a story." })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "View details for One Piece" })).toBeInTheDocument();
  });

  it("saves a series to local favorites and removes it from the favorites page", async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText("Live catalogue from AniList");
    await user.click((await screen.findAllByRole("button", { name: "Add One Piece to favorites" }))[0]);
    expect(JSON.parse(window.localStorage.getItem("mangaverse-anilist-favorites-v1"))[0].id).toBe(1);
    await user.click(screen.getByRole("link", { name: "Favorites" }));
    expect(screen.getByRole("heading", { name: "My favorites." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View details for One Piece" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove One Piece from favorites" }));
    expect(screen.getByRole("heading", { name: "No favorites saved yet." })).toBeInTheDocument();
  });

  it("adds a discovery series to the demo bag and supports quantity changes and removal", async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText("Live catalogue from AniList");
    await user.click(await screen.findByRole("button", { name: "Add demo One Piece to bag" }));
    expect(await screen.findByRole("button", { name: "Open bag, 1 items" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open bag, 1 items" }));
    const drawer = screen.getByRole("dialog", { name: /the bag/i });
    expect(within(drawer).getAllByText("One Piece")).not.toHaveLength(0);
    await user.click(within(drawer).getByRole("button", { name: "Increase One Piece quantity" }));
    expect(screen.getByRole("button", { name: "Open bag, 2 items" })).toBeInTheDocument();
    await user.click(within(drawer).getByRole("button", { name: "Remove One Piece" }));
    expect(within(drawer).getByText("Your bag is taking a breather.")).toBeInTheDocument();
  });

  it("opens AniList-backed series details and displays catalogue facts and relations", async () => {
    const user = userEvent.setup();
    renderApp("/series/1");
    expect(await screen.findByRole("heading", { name: "One Piece" })).toBeInTheDocument();
    expect(screen.getByText("130 chapters")).toBeInTheDocument();
    expect(await screen.findByRole("region", { name: "Related series carousel" })).toBeInTheDocument();
  });

  it("can feature and unfeature titles without removing them from the catalogue", async () => {
    const user = userEvent.setup();
    renderApp("/manage");
    expect(await screen.findByRole("heading", { name: "Curate the spotlight." })).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: /feature/i })[0]);
    const settings = JSON.parse(window.localStorage.getItem("mangaverse-series-management-v1"));
    expect(settings.featuredIds).toContain(4);
    expect(screen.getByRole("heading", { name: /featured series · 1/i })).toBeInTheDocument();
    expect(anilistFixture.trendingAnime.some((item) => item.id === 4)).toBe(true);
  });

  it("uses cached catalogue data when AniList cannot be reached", async () => {
    const { fetchAniListCatalog } = await import("./services/anilist.js");
    const mockedFetch = mockAniListFetch();
    await fetchAniListCatalog({ fetchImpl: mockedFetch });
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 503 })));
    renderApp();
    expect(await screen.findByText("Showing saved catalogue data")).toBeInTheDocument();
    expect(await screen.findByText(/HTTP 503/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View details for One Piece" })).toBeInTheDocument();
  });

  it("keeps the standalone demo store out of navigation and routes", async () => {
    renderApp("/store");
    expect(await screen.findByRole("heading", { name: /enter the world of manga/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /demo store/i })).not.toBeInTheDocument();
  });

  it("validates the newsletter address and confirms a valid subscription", async () => {
    const user = userEvent.setup();
    renderApp();
    const email = screen.getByRole("textbox", { name: "YOUR EMAIL ADDRESS" });
    await user.type(email, "reader@example.com");
    await user.click(screen.getByRole("button", { name: /join the list/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/you're on the list/i);
  });
});
