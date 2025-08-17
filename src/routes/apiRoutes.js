export const BASE_URL = "https://openlibrary.org/search.json?q=";

export const buildSearchURL = (query) => {
  return `${BASE_URL}${encodeURIComponent(query)}`;
};