import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { saveBook } from '../api/books';
import './SearchPage.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const query = useQuery();
  const category = query.get('category') || '';
  const q = query.get('q') || '';
  const [term, setTerm] = useState(category || q);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!term) {
      setBooks([]);
      return;
    }
    setLoading(true);
    const url = category
      ? `https://openlibrary.org/subjects/${category.toLowerCase()}.json?limit=20`
      : `https://openlibrary.org/search.json?q=${encodeURIComponent(term)}&limit=20`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const list = category
          ? data.works.map((w) => ({
              key: w.key,
              title: w.title,
              cover_id: w.cover_id,
              author: w.authors?.[0]?.name || 'Unknown'
            }))
          : data.docs.map((w) => ({
              key: w.key,
              title: w.title,
              cover_id: w.cover_i,
              author: w.author_name?.[0] || 'Unknown'
            }));
        setBooks(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [term, category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="search-page">
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          id="saved-library-search"
          name="savedLibrarySearch"
          placeholder="Search books…"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading…</p>}
      {!loading && books.length === 0 && <p>No results found.</p>}

      <div className="search-results">
        {books.map(({ key, title, cover_id, author }) => (
          <div key={key} className="search-card">
            <Link to={`/learn-more?bookKey=${encodeURIComponent(key)}`}>
              <img
                src={
                  cover_id
                    ? `https://covers.openlibrary.org/b/id/${cover_id}-M.jpg`
                    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='200' viewBox='0 0 150 200'%3E%3Crect width='150' height='200' fill='%23f0f0f0'/%3E%3Ctext x='75' y='100' text-anchor='middle' dy='.3em' font-family='Arial' font-size='14' fill='%23666'%3ENo Cover%3C/text%3E%3C/svg%3E"
                }
                alt={title}
              />
              <p className="card-title">{title}</p>
              <p className="card-author">{author}</p>
            </Link>
            {user && (
              <button
                className="save-btn"
                onClick={async () => {
                  try {
                    const newBook = await saveBook({ title, author });
                    alert(`✅ Saved “${newBook.title}”`);
                  } catch (err) {
                    console.error(err);
                    alert('❌ Could not save book');
                  }
                }}
              >
                Save to Library
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}