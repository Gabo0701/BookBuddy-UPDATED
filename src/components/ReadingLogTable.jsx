import React, { useState } from 'react';
import RatingStars from './RatingStars';

const ReadingLogTable = ({ entries, onAddEntry, onUpdateEntry, onDeleteEntry, className = '' }) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newEntry, setNewEntry] = useState({
    bookTitle: '',
    pagesRead: '',
    rating: 0,
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedEntries = [...(entries || [])].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (sortField === 'book') {
      aValue = a.book?.title || '';
      bValue = b.book?.title || '';
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleAddEntry = () => {
    if (onAddEntry && newEntry.bookTitle && newEntry.pagesRead) {
      onAddEntry({
        ...newEntry,
        pagesRead: parseInt(newEntry.pagesRead),
        date: new Date(newEntry.date)
      });
      setNewEntry({
        bookTitle: '',
        pagesRead: '',
        rating: 0,
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
      setIsAddingEntry(false);
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry({
      ...entry,
      date: new Date(entry.date).toISOString().split('T')[0]
    });
  };

  const handleUpdateEntry = () => {
    if (onUpdateEntry && editingEntry && editingEntry.bookTitle && editingEntry.pagesRead) {
      onUpdateEntry(editingEntry.id, {
        ...editingEntry,
        pagesRead: parseInt(editingEntry.pagesRead),
        date: new Date(editingEntry.date)
      });
      setEditingEntry(null);
    }
  };

  const cancelEdit = () => {
    setEditingEntry(null);
  };

  const handleDeleteEntry = (entryId) => {
    setDeleteConfirm(entryId);
  };

  const confirmDelete = () => {
    if (onDeleteEntry && deleteConfirm) {
      onDeleteEntry(deleteConfirm);
    }
    setDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-left font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1"
    >
      {children}
      <svg
        className={`w-4 h-4 transition-transform ${
          sortField === field && sortDirection === 'desc' ? 'rotate-180' : ''
        } ${sortField === field ? 'text-blue-600' : 'text-gray-400'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );

  if (!entries || entries.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Reading Log</h3>
          <button
            onClick={() => setIsAddingEntry(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-sm"
          >
            Add Entry
          </button>
        </div>
        
        {isAddingEntry ? (
          <AddEntryForm
            entry={newEntry}
            onChange={setNewEntry}
            onSave={handleAddEntry}
            onCancel={() => setIsAddingEntry(false)}
          />
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📖</div>
            <p className="text-gray-500 mb-4">No reading sessions logged yet</p>
            <p className="text-sm text-gray-400">Start tracking your reading progress!</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="flex items-center justify-between p-6 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">Reading Log</h3>
        <button
          onClick={() => setIsAddingEntry(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-sm"
        >
          Add Entry
        </button>
      </div>

      {isAddingEntry && (
        <div className="px-6 pb-4">
          <AddEntryForm
            entry={newEntry}
            onChange={setNewEntry}
            onSave={handleAddEntry}
            onCancel={() => setIsAddingEntry(false)}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-t border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <SortButton field="date">Date</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="book">Book</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="pagesRead">Pages</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="rating">Rating</SortButton>
              </th>
              <th className="px-6 py-3 text-left">Notes</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded shadow-sm flex items-center justify-center">
                      <span className="text-xs text-gray-600">📚</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {entry.book?.title || entry.bookTitle}
                      </div>
                      {entry.book?.authors && (
                        <div className="text-xs text-gray-500">
                          by {entry.book.authors.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {entry.pagesRead}
                  {entry.totalPages && (
                    <span className="text-gray-500"> / {entry.totalPages}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {entry.rating > 0 && (
                    <RatingStars rating={entry.rating} size="sm" />
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                  <div className="truncate" title={entry.notes}>
                    {entry.notes}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditEntry(entry)}
                      className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded p-2 hover:bg-blue-50 transition-colors"
                      title="Edit entry"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded p-2 hover:bg-red-50 transition-colors"
                      title="Delete entry"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Reading Entry</h3>
            <EditEntryForm
              entry={editingEntry}
              onChange={setEditingEntry}
              onSave={handleUpdateEntry}
              onCancel={cancelEdit}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Reading Entry</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this reading log entry? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 font-medium text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AddEntryForm = ({ entry, onChange, onSave, onCancel }) => {
  const handleChange = (field, value) => {
    onChange({ ...entry, [field]: value });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <h4 className="font-medium text-gray-900 mb-3">Add Reading Session</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="book-title" className="block text-sm font-medium text-gray-700 mb-1">
            Book Title *
          </label>
          <input
            id="book-title"
            type="text"
            value={entry.bookTitle}
            onChange={(e) => handleChange('bookTitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Enter book title"
            required
          />
        </div>
        <div>
          <label htmlFor="pages-read" className="block text-sm font-medium text-gray-700 mb-1">
            Pages Read *
          </label>
          <input
            id="pages-read"
            type="number"
            min="1"
            value={entry.pagesRead}
            onChange={(e) => handleChange('pagesRead', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="0"
            required
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={entry.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <RatingStars
            rating={entry.rating}
            onRatingChange={(rating) => handleChange('rating', rating)}
            size="sm"
          />
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          value={entry.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Any thoughts or notes about this reading session..."
        />
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={onSave}
          disabled={!entry.bookTitle || !entry.pagesRead}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Entry
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 font-medium text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const EditEntryForm = ({ entry, onChange, onSave, onCancel }) => {
  const handleChange = (field, value) => {
    onChange({ ...entry, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="edit-book-title" className="block text-sm font-medium text-gray-700 mb-1">
            Book Title *
          </label>
          <input
            id="edit-book-title"
            type="text"
            value={entry.bookTitle}
            onChange={(e) => handleChange('bookTitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Enter book title"
            required
          />
        </div>
        <div>
          <label htmlFor="edit-pages-read" className="block text-sm font-medium text-gray-700 mb-1">
            Pages Read *
          </label>
          <input
            id="edit-pages-read"
            type="number"
            min="1"
            value={entry.pagesRead}
            onChange={(e) => handleChange('pagesRead', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="0"
            required
          />
        </div>
        <div>
          <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            id="edit-date"
            type="date"
            value={entry.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <RatingStars
            rating={entry.rating}
            onRatingChange={(rating) => handleChange('rating', rating)}
            size="sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="edit-notes"
          value={entry.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Any thoughts or notes about this reading session..."
        />
      </div>
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 font-medium text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!entry.bookTitle || !entry.pagesRead}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Update Entry
        </button>
      </div>
    </div>
  );
};

export default ReadingLogTable;