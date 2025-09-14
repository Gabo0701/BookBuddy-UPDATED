// Redux Store Configuration for BookBuddy Application
import { configureStore } from "@reduxjs/toolkit";
import booksReducer from "./features/books/booksSlice";

// Configure Redux store with all application reducers
// Uses Redux Toolkit for simplified store setup and better DevTools integration
export const store = configureStore({
  reducer: {
    books: booksReducer, // Books state management (search, saved books, etc.)
  },
});