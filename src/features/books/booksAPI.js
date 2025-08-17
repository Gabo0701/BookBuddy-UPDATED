export const fetchBooksFromAPI = async (query) => {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch books");
  }

  const data = await response.json();
  return data.docs.map((book) => ({
    key: book.key,
    title: book.title,
    author: book.author_name ? book.author_name.join(", ") : "Unknown Author",
    coverId: book.cover_i,
    year: book.first_publish_year,
  }));
};