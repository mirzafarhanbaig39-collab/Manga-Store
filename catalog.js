export const genres = [
  "Action", "Adventure", "Fantasy", "Romance", "Horror", "Thriller",
  "Comedy", "Mystery", "Sci-Fi", "Sports", "Slice of Life", "Supernatural",
];

export const series = [
  { title: "The Last Ronin", genre: "Action · Fantasy", note: "A lone wanderer carries the final ember.", theme: "ember", mark: "刃" },
  { title: "Paper Moons", genre: "Romance · Slice of Life", note: "Two letters. One summer that changed everything.", theme: "moon", mark: "月" },
  { title: "Neon District", genre: "Sci-Fi · Thriller", note: "In a city that never sleeps, secrets glow.", theme: "neon", mark: "夜" },
  { title: "Wild Current", genre: "Adventure · Supernatural", note: "Follow the river beyond the edge of the map.", theme: "tide", mark: "流" },
];

export const manga = [
  { id: "m01", title: "The Last Ronin", volume: 1, author: "A. Kisaragi", genre: "Action", price: 499, originalPrice: 599, rating: 4.9, reviews: 284, popular: 98, tag: "Bestseller", theme: "ember", mark: "刃", description: "A striking first volume about a wandering swordswoman, a vanished kingdom and the promise she refuses to break." },
  { id: "m02", title: "Paper Moons", volume: 1, author: "M. Hoshino", genre: "Romance", price: 399, originalPrice: 499, rating: 4.7, reviews: 163, popular: 82, tag: "New arrival", theme: "moon", mark: "月", description: "A tender coming-of-age story told through handwritten letters and one unforgettable summer." },
  { id: "m03", title: "Neon District", volume: 1, author: "R. Mori", genre: "Sci-Fi", price: 549, originalPrice: 649, rating: 4.8, reviews: 209, popular: 94, tag: "Trending", theme: "neon", mark: "夜", description: "A courier discovers a signal hidden beneath the lights of a city built on secrets." },
  { id: "m04", title: "Wild Current", volume: 1, author: "S. Aoki", genre: "Adventure", price: 449, originalPrice: null, rating: 4.6, reviews: 118, popular: 79, tag: "", theme: "tide", mark: "流", description: "An illustrated journey into a wilderness where every bend in the river changes the rules." },
  { id: "m05", title: "Crimson Archive", volume: 1, author: "Y. Tendo", genre: "Mystery", price: 499, originalPrice: null, rating: 4.8, reviews: 176, popular: 87, tag: "", theme: "archive", mark: "謎", description: "A young archivist finds a clue in a library book that was never supposed to exist." },
  { id: "m06", title: "Cloudbreak Academy", volume: 1, author: "K. Fujita", genre: "Fantasy", price: 599, originalPrice: 699, rating: 4.7, reviews: 142, popular: 84, tag: "Special offer", theme: "cloud", mark: "雲", description: "Students at a school above the clouds learn that magic always asks for something in return." },
  { id: "m07", title: "Midnight Market", volume: 1, author: "N. Sato", genre: "Horror", price: 449, originalPrice: null, rating: 4.5, reviews: 94, popular: 73, tag: "", theme: "market", mark: "宵", description: "At a night market that appears only in the rain, every bargain has a shadow." },
  { id: "m08", title: "Side Street Stars", volume: 1, author: "E. Tanaka", genre: "Comedy", price: 399, originalPrice: null, rating: 4.6, reviews: 121, popular: 76, tag: "", theme: "stars", mark: "星", description: "Four very different neighbours accidentally start the loudest little band in town." },
  { id: "m09", title: "The Quiet Set", volume: 1, author: "T. Watanabe", genre: "Sports", price: 499, originalPrice: null, rating: 4.8, reviews: 201, popular: 91, tag: "Bestseller", theme: "court", mark: "勝", description: "A thoughtful underdog story about teamwork, second chances and the last point." },
  { id: "m10", title: "Afterimage", volume: 1, author: "H. Kuroda", genre: "Thriller", price: 549, originalPrice: null, rating: 4.4, reviews: 87, popular: 70, tag: "", theme: "afterimage", mark: "影", description: "A photographer begins capturing a second version of the world in every frame." },
  { id: "m11", title: "Garden of Small Things", volume: 1, author: "P. Natsume", genre: "Slice of Life", price: 449, originalPrice: null, rating: 4.9, reviews: 153, popular: 89, tag: "Collector's pick", theme: "garden", mark: "花", description: "Quiet days, a rooftop garden and the small rituals that make a place feel like home." },
  { id: "m12", title: "Echoes Below", volume: 1, author: "D. Amaya", genre: "Supernatural", price: 599, originalPrice: 749, rating: 4.7, reviews: 132, popular: 86, tag: "Limited edition", theme: "echo", mark: "響", description: "A mountain town hears a familiar voice coming from somewhere beneath the earth." },
];

export const merchandise = [
  { id: "g01", title: "Redline Vinyl Figure", category: "Anime Figures", price: 1899, rating: 4.8, theme: "merch-figure", mark: "壱" },
  { id: "g02", title: "After Hours Graphic Tee", category: "Anime T-Shirts", price: 999, rating: 4.6, theme: "merch-tee", mark: "夜" },
  { id: "g03", title: "Moonlit City Art Print", category: "Posters", price: 699, rating: 4.9, theme: "merch-print", mark: "月" },
  { id: "g04", title: "Mystery Story Box", category: "Mystery Boxes", price: 1499, rating: 4.7, theme: "merch-box", mark: "?" },
  { id: "g05", title: "Soft Signal Hoodie", category: "Hoodies", price: 1799, rating: 4.7, theme: "cloud", mark: "雲" },
  { id: "g06", title: "Tiny World Keychain Set", category: "Keychains", price: 399, rating: 4.5, theme: "stars", mark: "星" },
  { id: "g07", title: "Neon District Phone Case", category: "Phone Cases", price: 599, rating: 4.6, theme: "neon", mark: "夜" },
  { id: "g08", title: "Collector's Desk Totem", category: "Collectibles", price: 1299, rating: 4.8, theme: "echo", mark: "響" },
];

export const allProducts = [...manga, ...merchandise];
