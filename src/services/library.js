// Library Service Layer with Mock Data

import { api, openLibraryApi, MOCK_MODE } from './api.js';
import {
  createUser,
  createBook,
  createList,
  createListItem,
  createReadingLogEntry,
  createGoal,

  ReadStatus,
  ListType
} from '../types/library.js';

// In-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (key) => `library_${key}`;
const setCache = (key, data) => {
  cache.set(getCacheKey(key), {
    data,
    timestamp: Date.now()
  });
};

const getCache = (key) => {
  const cached = cache.get(getCacheKey(key));
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(getCacheKey(key));
    return null;
  }
  
  return cached.data;
};

// Mock Data
const mockUser = createUser({
  id: 'user_1',
  email: 'reader@bookbuddy.com',
  displayName: 'Book Lover',
  avatar: null,
  preferences: {
    theme: 'light',
    privacy: 'private',
    notifications: true
  }
});

const mockBooks = [
  createBook({
    id: 'book_1',
    key: '/works/OL45804W',
    title: 'Atomic Habits',
    authors: ['James Clear'],
    publishYear: 2018,
    pageCount: 320,
    subjects: ['Self-help', 'Psychology', 'Productivity'],
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    openLibraryId: 'OL45804W'
  }),
  createBook({
    id: 'book_2',
    key: '/works/OL15832982W',
    title: 'The 7 Habits of Highly Effective People',
    authors: ['Stephen R. Covey'],
    publishYear: 1989,
    pageCount: 381,
    subjects: ['Self-help', 'Leadership', 'Personal Development'],
    description: 'Powerful Lessons in Personal Change',
    openLibraryId: 'OL15832982W'
  }),
  createBook({
    id: 'book_3',
    key: '/works/OL17930766W',
    title: 'The Subtle Art of Not Giving a F*ck',
    authors: ['Mark Manson'],
    publishYear: 2016,
    pageCount: 224,
    subjects: ['Self-help', 'Philosophy', 'Psychology'],
    description: 'A Counterintuitive Approach to Living a Good Life',
    openLibraryId: 'OL17930766W'
  })
];

const mockLists = [
  createList({
    id: 'list_4',
    name: 'Favorites',
    type: ListType.FAVORITES,
    description: 'My favorite books',
    books: [
      createListItem({
        id: 'item_4',
        bookId: 'book_3',
        book: mockBooks[2],
        status: ReadStatus.FAVORITE,
        rating: 4,
        addedAt: new Date('2023-12-16')
      })
    ]
  })
];

const mockReadingLog = [
  createReadingLogEntry({
    id: 'log_1',
    bookId: 'book_1',
    book: mockBooks[0],
    date: new Date('2024-01-25'),
    pagesRead: 25,
    totalPages: 320,
    sessionMinutes: 45,
    notes: 'Great insights on habit formation'
  }),
  createReadingLogEntry({
    id: 'log_2',
    bookId: 'book_3',
    book: mockBooks[2],
    date: new Date('2023-12-15'),
    pagesRead: 224,
    totalPages: 224,
    rating: 4,
    sessionMinutes: 180,
    notes: 'Finished! Really enjoyed the practical philosophy approach.'
  })
];

const mockGoal = createGoal({
  id: 'goal_1',
  year: 2024,
  targetBooks: 24,
  targetPages: 6000,
  currentBooks: 1,
  currentPages: 1248
});



// Service functions
export const libraryService = {
  // User
  async getMe() {
    const cacheKey = 'user_me';
    const cached = getCache(cacheKey);
    if (cached) return cached;

    if (MOCK_MODE) {
      setCache(cacheKey, mockUser);
      return mockUser;
    }

    try {
      const response = await api.get('/v1/auth/me');
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return mockUser; // Fallback to mock
    }
  },

  async updateProfile(updates) {
    if (MOCK_MODE) {
      Object.assign(mockUser, updates);
      setCache('user_me', mockUser);
      return mockUser;
    }

    try {
      const response = await api.patch('/v1/auth/profile', updates);
      setCache('user_me', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  // Library Overview
  async getLibrary() {
    const cacheKey = 'library_overview';
    const cached = getCache(cacheKey);
    if (cached) return cached;

    if (MOCK_MODE) {
      const library = {
        lists: mockLists,
        goal: mockGoal
      };
      setCache(cacheKey, library);
      return library;
    }

    try {
      const response = await api.get('/v1/library');
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch library:', error);
      // Fallback to mock
      const library = {
        lists: mockLists,
        goal: mockGoal
      };
      return library;
    }
  },

  // Lists/Shelves
  async getLists() {
    const cacheKey = 'lists';
    const cached = getCache(cacheKey);
    if (cached) return cached;

    if (MOCK_MODE) {
      setCache(cacheKey, mockLists);
      return mockLists;
    }

    try {
      const response = await api.get('/v1/library/lists');
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch lists:', error);
      return mockLists;
    }
  },

  async createList(listData) {
    if (MOCK_MODE) {
      const newList = createList({
        ...listData,
        id: `list_${Date.now()}`,
        books: []
      });
      mockLists.push(newList);
      cache.delete(getCacheKey('lists'));
      return newList;
    }

    try {
      const response = await api.post('/v1/library/lists', listData);
      cache.delete(getCacheKey('lists'));
      return response.data;
    } catch (error) {
      console.error('Failed to create list:', error);
      throw error;
    }
  },

  async addBookToList(listId, bookData) {
    if (MOCK_MODE) {
      const list = mockLists.find(l => l.id === listId);
      if (list) {
        const newItem = createListItem({
          id: `item_${Date.now()}`,
          bookId: bookData.id,
          book: bookData,
          status: ReadStatus.SAVED
        });
        list.books.push(newItem);
        cache.delete(getCacheKey('lists'));
        cache.delete(getCacheKey('library_overview'));
      }
      return bookData;
    }

    try {
      const response = await api.post(`/v1/library/lists/${listId}/books`, bookData);
      cache.delete(getCacheKey('lists'));
      cache.delete(getCacheKey('library_overview'));
      return response.data;
    } catch (error) {
      console.error('Failed to add book to list:', error);
      throw error;
    }
  },

  // Reading Log
  async getReadingLog(limit = 50) {
    const cacheKey = `reading_log_${limit}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    if (MOCK_MODE) {
      const sortedLog = [...mockReadingLog].sort((a, b) => new Date(b.date) - new Date(a.date));
      const limitedLog = sortedLog.slice(0, limit);
      setCache(cacheKey, limitedLog);
      return limitedLog;
    }

    try {
      const response = await api.get(`/v1/library/reading-log?limit=${limit}`);
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch reading log:', error);
      return mockReadingLog;
    }
  },

  async addReadingLogEntry(entry) {
    if (MOCK_MODE) {
      const newEntry = createReadingLogEntry({
        ...entry,
        id: `log_${Date.now()}`
      });
      mockReadingLog.unshift(newEntry);
      cache.delete(getCacheKey('reading_log_50'));
      return newEntry;
    }

    try {
      const response = await api.post('/v1/library/reading-log', entry);
      cache.delete(getCacheKey('reading_log_50'));
      return response.data;
    } catch (error) {
      console.error('Failed to add reading log entry:', error);
      throw error;
    }
  },

  // Goals
  async updateGoal(goalData) {
    if (MOCK_MODE) {
      Object.assign(mockGoal, goalData);
      cache.delete(getCacheKey('library_overview'));
      return mockGoal;
    }

    try {
      const response = await api.patch('/v1/library/goal', goalData);
      cache.delete(getCacheKey('library_overview'));
      return response.data;
    } catch (error) {
      console.error('Failed to update goal:', error);
      throw error;
    }
  },


};