const seriesArtFiles = import.meta.glob("../assets/series/*.{png,jpg,jpeg,webp,avif}", {
  eager: true,
  import: "default",
  query: "?url",
});

export const seriesArt = Object.fromEntries(
  Object.entries(seriesArtFiles).map(([path, url]) => [
    path.split("/").pop().replace(/\.(png|jpe?g|webp|avif)$/i, ""),
    url,
  ]),
);

export function getSeriesImage(series, coverKey = series.coverKey) {
  return seriesArt[coverKey] || seriesArt[series.coverKey] || series.posterUrl;
}
