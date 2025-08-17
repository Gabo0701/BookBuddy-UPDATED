import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { libraryService } from '../services/library';


import { ListGrid } from '../components/ListCard';
import ReadingLogTable from '../components/ReadingLogTable';
import StatsPanel from '../components/StatsPanel';
import BookList from '../components/BookList';
import './UserPage.css';

const UserPage = () => {
  const { user: authUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [library, setLibrary] = useState(null);
  const [readingLog, setReadingLog] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    loadUserData();

    // Listen for localStorage changes (when books are saved/removed)
    const handleStorageChange = (e) => {
      if (e.key === 'savedBooks' || e.key === 'favoriteBooks') {
        loadUserData(); // Reload data when saved books or favorites change
      }
    };

    // Listen for custom events from BookCard component
    const handleBookSaved = () => {
      loadUserData();
    };

    const handleFavoriteChanged = () => {
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookSaved', handleBookSaved);
    window.addEventListener('bookRemoved', handleBookSaved);
    window.addEventListener('favoriteAdded', handleFavoriteChanged);
    window.addEventListener('favoriteRemoved', handleFavoriteChanged);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookSaved', handleBookSaved);
      window.removeEventListener('bookRemoved', handleBookSaved);
      window.removeEventListener('favoriteAdded', handleFavoriteChanged);
      window.removeEventListener('favoriteRemoved', handleFavoriteChanged);
    };
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load saved books, favorites, and reading log from localStorage
      const savedBooks = JSON.parse(localStorage.getItem('savedBooks')) || [];
      const favoriteBooks = JSON.parse(localStorage.getItem('favoriteBooks')) || [];
      const readingLogEntries = JSON.parse(localStorage.getItem('readingLog')) || [];
      
      const [userData, libraryData, logData, recData] = await Promise.all([
        libraryService.getMe(),
        libraryService.getLibrary(),
        libraryService.getReadingLog(10),
        libraryService.getRecommendations()
      ]);

      // Integrate saved books into library data - Always ensure saved books list exists
      if (libraryData) {
        const savedList = libraryData.lists.find(list => list.name === 'Saved Books');
        if (savedList) {
          // Update existing saved books list
          savedList.books = savedBooks.map(book => ({
            id: `saved_${book.key}`,
            bookId: book.key,
            book: {
              id: book.key,
              key: book.key,
              title: book.title,
              authors: book.author ? [book.author] : [],
              subjects: book.subject || [],
              description: book.subtitle || '',
              openLibraryId: book.key?.replace('/works/', '')
            },
            status: 'to-read',
            addedAt: new Date()
          }));
        } else {
          // Create saved books list if it doesn't exist (even if empty)
          libraryData.lists.push({
            id: 'saved_books',
            name: 'Saved Books',
            type: 'custom',
            description: 'Books saved from search',
            books: savedBooks.map(book => ({
              id: `saved_${book.key}`,
              bookId: book.key,
              book: {
                id: book.key,
                key: book.key,
                title: book.title,
                authors: book.author ? [book.author] : [],
                subjects: book.subject || [],
                description: book.subtitle || '',
                openLibraryId: book.key?.replace('/works/', '')
              },
              status: 'saved',
              addedAt: new Date()
            }))
          });
        }
      }

      // Integrate favorites into library data - Always ensure favorites list exists
      if (libraryData) {
        const favoritesListIndex = libraryData.lists.findIndex(list => list.name === 'Favorites');
        if (favoritesListIndex !== -1) {
          // Update existing favorites list
          libraryData.lists[favoritesListIndex].books = favoriteBooks.map(book => ({
            id: `favorite_${book.key}`,
            bookId: book.key,
            book: {
              id: book.key,
              key: book.key,
              title: book.title,
              authors: book.author ? [book.author] : [],
              subjects: book.subject || [],
              description: book.subtitle || '',
              openLibraryId: book.key?.replace('/works/', '')
            },
            status: 'favorite',
            addedAt: new Date()
          }));
        } else {
          // Create favorites list if it doesn't exist (even if empty)
          libraryData.lists.push({
            id: 'favorites',
            name: 'Favorites',
            type: 'favorites',
            description: 'Your favorite books',
            books: favoriteBooks.map(book => ({
              id: `favorite_${book.key}`,
              bookId: book.key,
              book: {
                id: book.key,
                key: book.key,
                title: book.title,
                authors: book.author ? [book.author] : [],
                subjects: book.subject || [],
                description: book.subtitle || '',
                openLibraryId: book.key?.replace('/works/', '')
              },
              status: 'favorite',
              addedAt: new Date()
            }))
          });
        }
      }

      setUser(userData);
      setLibrary(libraryData);
      setReadingLog(readingLogEntries); // Use localStorage data instead of API data
      setRecommendations(recData);
    } catch (err) {
      console.error('Failed to load user data:', err);
      setError('Failed to load your library. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (book, listType) => {
    try {
      console.log('Deleting book:', book.title, 'from', listType);
      
      // Remove from appropriate list based on listType
      setLibrary(prev => {
        if (!prev) return prev;
        
        const updatedLibrary = { ...prev };
        
        switch (listType) {
          case 'saved':
            // Remove from saved books localStorage
            const savedBooks = JSON.parse(localStorage.getItem('savedBooks')) || [];
            const updatedSavedBooks = savedBooks.filter(saved => saved.key !== book.key);
            localStorage.setItem('savedBooks', JSON.stringify(updatedSavedBooks));
            
            // Update lists
            updatedLibrary.lists = prev.lists?.map(list => {
              if (list.name === 'Saved Books') {
                return {
                  ...list,
                  books: list.books?.filter(item => 
                    item.book?.key !== book.key && item.book?.id !== book.id
                  ) || []
                };
              }
              return list;
            }) || [];
            
            // Dispatch event for BookCard components to update their saved state
            window.dispatchEvent(new CustomEvent('bookRemoved', { detail: book }));
            break;
            
          case 'favorites':
            console.log('Deleting from favorites:', book.title);
            // Remove from favorites localStorage
            const favorites = JSON.parse(localStorage.getItem('favoriteBooks')) || [];
            console.log('Current favorites:', favorites);
            const updatedFavorites = favorites.filter(fav => fav.key !== book.key);
            console.log('Updated favorites:', updatedFavorites);
            localStorage.setItem('favoriteBooks', JSON.stringify(updatedFavorites));
            
            // Update lists
            updatedLibrary.lists = prev.lists?.map(list => {
              if (list.type === 'favorites' || list.name === 'Favorites') {
                console.log('Updating favorites list:', list.name);
                return {
                  ...list,
                  books: list.books?.filter(item => 
                    item.book?.key !== book.key && item.book?.id !== book.id
                  ) || []
                };
              }
              return list;
            }) || [];
            
            // Dispatch event for BookCard components to update their favorite state
            window.dispatchEvent(new CustomEvent('favoriteRemoved', { detail: book }));
            break;
            
          default:
            // Handle custom lists
            updatedLibrary.lists = prev.lists?.map(list => ({
              ...list,
              books: list.books?.filter(item => 
                item.book?.key !== book.key && item.book?.id !== book.id
              ) || []
            })) || [];
        }
        
        return updatedLibrary;
      });
      
      // Dispatch event for other components to listen
      window.dispatchEvent(new CustomEvent('bookDeleted', { 
        detail: { book, listType } 
      }));
      
    } catch (err) {
      console.error('Failed to delete book:', err);
    }
  };

  const handleAddReadingLogEntry = async (entryData) => {
    try {
      // Create new entry with unique ID
      const newEntry = {
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...entryData,
        createdAt: new Date().toISOString()
      };
      
      // Update local state
      const updatedLog = [newEntry, ...readingLog];
      setReadingLog(updatedLog);
      
      // Save to localStorage
      localStorage.setItem('readingLog', JSON.stringify(updatedLog));
      
      console.log('Added reading log entry:', newEntry);
    } catch (err) {
      console.error('Failed to add reading log entry:', err);
    }
  };

  const handleUpdateReadingLogEntry = async (entryId, updatedData) => {
    try {
      // Update local state
      const updatedLog = readingLog.map(entry => 
        entry.id === entryId ? { ...entry, ...updatedData } : entry
      );
      setReadingLog(updatedLog);
      
      // Save to localStorage
      localStorage.setItem('readingLog', JSON.stringify(updatedLog));
      
      console.log('Updated reading log entry:', entryId, updatedData);
    } catch (err) {
      console.error('Failed to update reading log entry:', err);
      // Reload data on error
      loadUserData();
    }
  };

  const handleDeleteReadingLogEntry = async (entryId) => {
    try {
      // Remove from local state
      const updatedLog = readingLog.filter(entry => entry.id !== entryId);
      setReadingLog(updatedLog);
      
      // Save to localStorage
      localStorage.setItem('readingLog', JSON.stringify(updatedLog));
      
      console.log('Deleted reading log entry:', entryId);
    } catch (err) {
      console.error('Failed to delete reading log entry:', err);
      // Reload data on error
      loadUserData();
    }
  };

  // Handler functions for buttons
  const handleAddBook = () => {
    navigate('/search');
  };

  const handleViewAllLists = () => {
    navigate('/library');
  };

  const handleCreateList = async (listData) => {
    try {
      // Create new list locally (in a real app, this would call an API)
      const newList = {
        id: `list_${Date.now()}`,
        name: listData.name,
        description: listData.description,
        type: 'custom',
        books: [],
        createdAt: new Date()
      };
      
      setLibrary(prev => ({
        ...prev,
        lists: [...(prev?.lists || []), newList]
      }));
      
      setShowNewListModal(false);
      console.log('Created new list:', newList);
    } catch (err) {
      console.error('Failed to create list:', err);
    }
  };

  const handleImportBooks = async (csvData) => {
    try {
      // Simple CSV parsing (in a real app, you'd use a proper CSV parser)
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const books = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          const book = {};
          
          headers.forEach((header, i) => {
            if (values[i]) {
              book[header] = values[i];
            }
          });
          
          return {
            id: `imported_${Date.now()}_${index}`,
            bookId: `imported_${Date.now()}_${index}`,
            book: {
              id: `imported_${Date.now()}_${index}`,
              title: book.title || 'Unknown Title',
              authors: book.author ? [book.author] : ['Unknown Author'],
              subjects: book.genre ? [book.genre] : [],
              description: book.description || ''
            },
            status: book.status || 'to-read',
            addedAt: new Date()
          };
        });

      // Add to "Imported Books" list
      const importedList = {
        id: 'imported_books',
        name: 'Imported Books',
        type: 'custom',
        description: 'Books imported from CSV',
        books: books
      };

      setLibrary(prev => ({
        ...prev,
        lists: [...(prev?.lists || []), importedList]
      }));

      setShowImportModal(false);
      console.log('Imported books:', books);
    } catch (err) {
      console.error('Failed to import books:', err);
      alert('Failed to import CSV. Please check the format.');
    }
  };

  // Demo function to add sample data for testing
  const addSampleData = () => {
    const sampleBooks = [
      {
        key: '/works/OL45804W',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        subject: ['Fiction', 'Classic Literature'],
        subtitle: 'A classic American novel',
        coverId: '8225261'
      },
      {
        key: '/works/OL1168007W', 
        title: '1984',
        author: 'George Orwell',
        subject: ['Dystopian', 'Science Fiction'],
        subtitle: 'A dystopian social science fiction novel',
        coverId: '8231674'
      },
      {
        key: '/works/OL262758W',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        subject: ['Fiction', 'Classic Literature'],
        subtitle: 'A classic of modern American literature',
        coverId: '8231674'
      },
      {
        key: '/works/OL27448W',
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        subject: ['Fiction', 'Coming of Age'],
        subtitle: 'A controversial coming-of-age story',
        coverId: '8231674'
      },
      {
        key: '/works/OL455014W',
        title: 'Harry Potter and the Philosopher\'s Stone',
        author: 'J.K. Rowling',
        subject: ['Fantasy', 'Young Adult'],
        subtitle: 'The first Harry Potter book',
        coverId: '8231674'
      }
    ];

    // Add all books to saved books (so we can test saved books deletion)
    localStorage.setItem('savedBooks', JSON.stringify(sampleBooks));
    
    // Add first two books to favorites
    localStorage.setItem('favoriteBooks', JSON.stringify([sampleBooks[0], sampleBooks[1]]));
    
    // Add sample reading log entries
    const sampleReadingLog = [
      {
        id: 'entry_1',
        bookTitle: 'The Great Gatsby',
        pagesRead: 50,
        rating: 5,
        notes: 'Amazing opening chapters! The writing is beautiful.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'entry_2',
        bookTitle: '1984',
        pagesRead: 75,
        rating: 4,
        notes: 'Dystopian world is fascinating and terrifying.',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'entry_3',
        bookTitle: 'To Kill a Mockingbird',
        pagesRead: 30,
        rating: 5,
        notes: 'Scout is such an interesting narrator.',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem('readingLog', JSON.stringify(sampleReadingLog));

    // Update reading log state immediately
    setReadingLog(sampleReadingLog);

    // Reload data to sync everything
    setTimeout(() => {
      loadUserData();
    }, 100);

    alert('Sample data added! You can now test delete and favorites functionality.');
  };

  // Function to clear all data for testing empty states
  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
    }
  };

  const clearAllData = () => {
    localStorage.removeItem('savedBooks');
    localStorage.removeItem('favoriteBooks');
    localStorage.removeItem('readingLog');
    
    setLibrary(prev => ({
      ...prev,
      lists: prev?.lists?.map(list => {
        if (list.name === 'Saved Books' || list.type === 'favorites') {
          return { ...list, books: [] };
        }
        return list;
      }) || []
    }));
    
    setReadingLog([]);

    // Reload data to sync everything
    setTimeout(() => {
      loadUserData();
    }, 100);

    alert('All data cleared! You can now see the empty states.');
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="user-page">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadUserData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user?.displayName || authUser?.email?.split('@')[0] || 'Reader';

  return (
    <div className="user-page">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {displayName}! 👋
              </h1>
              <p className="text-gray-600">
                Ready to dive into your next great read?
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-3 flex-wrap">
              <button 
                onClick={handleAddBook}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-sm"
              >
                Add Book
              </button>
              <button 
                onClick={addSampleData}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 font-medium text-sm"
              >
                🧪 Add Demo Data
              </button>
              <button 
                onClick={handleClearAllData}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 font-medium text-sm"
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Lists/Shelves */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">My Lists</h2>
                <button 
                  onClick={handleViewAllLists}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-1"
                >
                  View All
                </button>
              </div>
              <ListGrid lists={library?.lists?.filter(list => 
                list.name !== 'Saved Books' && 
                list.type !== 'favorites' && 
                list.name !== 'Favorites'
              ) || []} />
            </div>

            {/* Books with Delete/Favorite Functionality */}
            <div className="space-y-6">
              {/* Saved Books List - Always show */}
              <BookList
                books={library?.lists?.find(list => list.name === 'Saved Books')?.books || []}
                title="💾 Saved Books"
                listType="saved"
                onDeleteBook={handleDeleteBook}
                onToggleFavorite={(book, isFavorite) => console.log('Toggle favorite:', book.title, isFavorite)}
                emptyMessage="You don't have any saved books yet. Search for books and click the heart to save them!"
                emptyIcon="💾"
              />

              {/* Favorites List - Always show */}
              <BookList
                books={library?.lists?.find(list => list.type === 'favorites')?.books || []}
                title="⭐ Favorite Books"
                listType="favorites"
                onDeleteBook={handleDeleteBook}
                onToggleFavorite={(book, isFavorite) => console.log('Toggle favorite:', book.title, isFavorite)}
                emptyMessage="You don't have any favorite books yet. Click the star on any book to add it to favorites!"
                emptyIcon="⭐"
              />

            </div>

            {/* Reading Log */}
            <ReadingLogTable
              entries={readingLog}
              onAddEntry={handleAddReadingLogEntry}
              onUpdateEntry={handleUpdateReadingLogEntry}
              onDeleteEntry={handleDeleteReadingLogEntry}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Stats & Insights */}
            <StatsPanel stats={library?.stats} />

            {/* Recommendations */}
            <RecommendationsCard recommendations={recommendations} navigate={navigate} />

            {/* Profile Card */}
            <ProfileCard user={user} />
          </div>
        </div>
      </div>


    </div>
  );
};

// Recommendations Component
const RecommendationsCard = ({ recommendations, navigate, className = '' }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
        <div className="text-center py-4">
          <div className="text-gray-400 text-2xl mb-2">🔍</div>
          <p className="text-gray-500 text-sm">Add more books to get personalized recommendations</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
        <button 
          onClick={() => navigate('/search')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-1"
        >
          See More
        </button>
      </div>
      
      <div className="space-y-3">
        {recommendations.slice(0, 3).map((book) => (
          <div key={book.id} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
            <div className="w-12 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded shadow-sm flex items-center justify-center flex-shrink-0">
              <span className="text-lg text-indigo-600">📖</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm truncate">
                {book.title}
              </h4>
              <p className="text-xs text-gray-600 mb-1">
                by {book.authors?.join(', ') || 'Unknown Author'}
              </p>
              {book.subjects && book.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {book.subjects.slice(0, 2).map((subject, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Profile Card Component
const ProfileCard = ({ user, className = '' }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-1"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
            <span className="text-2xl text-blue-600">
              {user?.displayName?.[0]?.toUpperCase() || '👤'}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              {user?.displayName || 'Book Lover'}
            </h4>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Theme</span>
            <button className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none">
              {user?.preferences?.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Privacy</span>
            <span className="text-sm text-gray-900">
              {user?.preferences?.privacy === 'public' ? '🌍 Public' : '🔒 Private'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-gray-100">
          <button className="w-full text-left text-sm text-gray-600 hover:text-gray-900 py-2 px-3 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
            📤 Export Library (JSON)
          </button>
          <button className="w-full text-left text-sm text-red-600 hover:text-red-700 py-2 px-3 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1">
            🗑️ Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

// New List Modal Component
const NewListModal = ({ onClose, onCreateList }) => {
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (listName.trim()) {
      onCreateList({
        name: listName.trim(),
        description: listDescription.trim()
      });
      setListName('');
      setListDescription('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create New List</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              List Name *
            </label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter list name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter list description (optional)"
              rows="3"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
            >
              Create List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Import CSV Modal Component
const ImportCSVModal = ({ onClose, onImport }) => {
  const [csvData, setCsvData] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (csvData.trim()) {
      onImport(csvData.trim());
      setCsvData('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target.result);
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target.result);
      };
      reader.readAsText(file);
    } else {
      alert('Please drop a valid CSV file');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Import Books from CSV</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">CSV Format:</h4>
          <p className="text-sm text-blue-700 mb-2">
            Your CSV should have headers like: title, author, genre, description, status
          </p>
          <p className="text-xs text-blue-600">
            Example: "The Great Gatsby,F. Scott Fitzgerald,Fiction,A classic novel,to-read"
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-700"
              >
                Click to upload or drag and drop your CSV file here
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Or paste CSV data directly:
            </label>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Paste your CSV data here..."
              rows="8"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!csvData.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import Books
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="user-page">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default UserPage;