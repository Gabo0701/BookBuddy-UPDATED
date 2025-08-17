// Library Types for BookBuddy

export const ReadStatus = {
  SAVED: 'saved',
  FAVORITE: 'favorite'
};

export const ListType = {
  SAVED: 'saved',
  FAVORITES: 'favorites',
  CUSTOM: 'custom'
};

// User type
export const createUser = (data = {}) => ({
  id: '',
  email: '',
  displayName: '',
  avatar: null,
  preferences: {
    theme: 'light',
    privacy: 'private',
    notifications: true
  },
  createdAt: new Date(),
  ...data
});

// Book type
export const createBook = (data = {}) => ({
  id: '',
  key: '',
  title: '',
  authors: [],
  isbn: '',
  publishYear: null,
  pageCount: null,
  subjects: [],
  description: '',
  coverUrl: '',
  openLibraryId: '',
  ...data
});

// Reading Log Entry
export const createReadingLogEntry = (data = {}) => ({
  id: '',
  bookId: '',
  book: null,
  date: new Date(),
  pagesRead: 0,
  totalPages: 0,
  rating: null,
  notes: '',
  sessionMinutes: 0,
  ...data
});

// List/Shelf
export const createList = (data = {}) => ({
  id: '',
  name: '',
  type: ListType.CUSTOM,
  description: '',
  isPublic: false,
  books: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...data
});

// List Item (book in a list)
export const createListItem = (data = {}) => ({
  id: '',
  bookId: '',
  book: null,
  status: ReadStatus.SAVED,
  rating: null,
  notes: '',
  addedAt: new Date(),
  ...data
});

// Reading Goal
export const createGoal = (data = {}) => ({
  id: '',
  year: new Date().getFullYear(),
  targetBooks: 12,
  targetPages: 0,
  currentBooks: 0,
  currentPages: 0,
  isActive: true,
  createdAt: new Date(),
  ...data
});

// Stats
export const createStats = (data = {}) => ({
  totalBooks: 0,
  totalPages: 0,
  booksThisYear: 0,
  pagesThisYear: 0,
  averageRating: 0,
  topGenres: [],
  topAuthors: [],
  readingStreak: 0,
  ...data
});