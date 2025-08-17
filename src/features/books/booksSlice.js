import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchBooksByQuery = createAsyncThunk(
  "books/fetchBooksByQuery",
  async (query) => {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.docs;
  }
);

const booksSlice = createSlice({
  name: "books",
  initialState: {
    books: [],
    status: "idle",
    error: null,
  },
  reducers: {
    setBooks: (state, action) => {
      state.books = action.payload;
    },
    clearBooks: (state) => {
      state.books = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooksByQuery.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBooksByQuery.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.books = action.payload;
      })
      .addCase(fetchBooksByQuery.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { setBooks, clearBooks } = booksSlice.actions;

export default booksSlice.reducer;