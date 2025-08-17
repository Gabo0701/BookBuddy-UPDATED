import React from 'react';
import { Link } from 'react-router-dom';

const ListCard = ({ list, className = '' }) => {
  if (!list) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const bookCount = list.books?.length || 0;
  const lastAdded = list.books?.length > 0 
    ? list.books.reduce((latest, book) => 
        new Date(book.addedAt) > new Date(latest.addedAt) ? book : latest
      )
    : null;

  const getListIcon = (type) => {
    switch (type) {
      case 'to-read':
        return '📚';
      case 'currently-reading':
        return '📖';
      case 'finished':
        return '✅';
      case 'favorites':
        return '⭐';
      default:
        return '📋';
    }
  };

  const getListColor = (type) => {
    switch (type) {
      case 'to-read':
        return 'border-blue-200 bg-blue-50';
      case 'currently-reading':
        return 'border-orange-200 bg-orange-50';
      case 'finished':
        return 'border-green-200 bg-green-50';
      case 'favorites':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Link
      to={`/library/lists/${list.id}`}
      className={`block bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg" role="img" aria-label={`${list.type} list`}>
            {getListIcon(list.type)}
          </span>
          <h3 className="font-semibold text-gray-900 truncate">
            {list.name}
          </h3>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getListColor(list.type)}`}>
          {bookCount}
        </span>
      </div>

      {list.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {list.description}
        </p>
      )}

      <div className="space-y-2">
        {/* Book Count */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Books:</span>
          <span className="font-medium text-gray-900">{bookCount}</span>
        </div>

        {/* Last Added */}
        {lastAdded && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Last added:</span>
            <span className="text-gray-700 truncate max-w-32" title={lastAdded.book?.title}>
              {lastAdded.book?.title}
            </span>
          </div>
        )}

        {/* Recent Books Preview - Text Only */}
        {list.books && list.books.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-1">Recent books:</div>
            <div className="space-y-1">
              {list.books.slice(0, 2).map((item) => (
                <div key={item.id} className="text-xs text-gray-700 truncate" title={item.book?.title}>
                  • {item.book?.title}
                </div>
              ))}
              {list.books.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{list.books.length - 2} more books
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {bookCount === 0 && (
        <div className="text-center py-4 text-gray-400">
          <div className="text-2xl mb-1">📚</div>
          <p className="text-sm">No books yet</p>
        </div>
      )}
    </Link>
  );
};

const ListGrid = ({ lists, className = '' }) => {
  if (!lists || lists.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📚</div>
          <p className="text-gray-500 mb-4">No lists created yet</p>
          <Link 
            to="/search"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium"
          >
            Create Your First List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {lists.map((list) => (
        <ListCard key={list.id} list={list} />
      ))}
    </div>
  );
};

export { ListCard, ListGrid };