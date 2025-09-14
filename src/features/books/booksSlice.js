// Redux Books Slice - State Management for Book Search and Display
// Handles book search results from OpenLibrary API using Redux Toolkit

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Async thunk for fetching books from OpenLibrary API
 * Searches for books based on user query and returns results
 * 
 * @param {string} query - Search query for books (title, author, etc.)
 * @returns {Promise<Array>} Array of book documents from OpenLibrary
 */
export const fetchBooksByQuery = createAsyncThunk(
  "books/fetchBooksByQuery",
  async (query) => {
    // Fetch books from OpenLibrary search API
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    // Return the docs array containing book information
    return data.docs;
  }
);

/**
 * Books slice for Redux state management
 * Manages book search results, loading states, and errors
 */
const booksSlice = createSlice({
  name: "books",
  
  // Initial state for books feature
  initialState: {
    books: [],           // Array of book search results
    status: "idle",      // Loading status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,         // Error message if API call fails
  },
  
  // Synchronous reducers for direct state updates
  reducers: {
    /**
     * Set books array directly (for manual updates)
     * @param {Object} state - Current state
     * @param {Object} action - Action with books payload
     */
    setBooks: (state, action) => {
      state.books = action.payload;
    },
    
    /**
     * Clear all books from state (reset search results)
     * @param {Object} state - Current state
     */
    clearBooks: (state) => {
      state.books = [];
    },
  },
  
  // Handle async thunk actions (fetchBooksByQuery)
  extraReducers: (builder) => {
    builder
      // Handle pending state (API call in progress)
      .addCase(fetchBooksByQuery.pending, (state) => {
        state.status = "loading";
      })
      
      // Handle successful API response
      .addCase(fetchBooksByQuery.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.books = action.payload;  // Store fetched books
      })
      
      // Handle API call failure
      .addCase(fetchBooksByQuery.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;  // Store error message
      });
  },
});

// Export action creators for use in components
export const { setBooks, clearBooks } = booksSlice.actions;

// Export reducer for store configuration
export default booksSlice.reducer;