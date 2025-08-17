import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { fetchBooks } from "/features/books/booksSlice";

export const useFetchBooks = () => {
  const dispatch = useDispatch();

  const handleFetchBooks = useCallback((query) => {
    if (!query.trim()) return;
    dispatch(fetchBooks(query));
  }, [dispatch]);

  return handleFetchBooks;
};