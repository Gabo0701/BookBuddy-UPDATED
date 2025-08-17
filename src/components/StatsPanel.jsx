import React from 'react';

const StatsPanel = ({ stats, className = '' }) => {
  if (!stats) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, color = 'text-blue-600' }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <span className={`text-lg ${color}`} role="img" aria-label={title}>
          {icon}
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {subtitle && (
        <div className="text-sm text-gray-500">{subtitle}</div>
      )}
    </div>
  );

  const TopItem = ({ items, title, icon }) => (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900 flex items-center gap-2">
        <span role="img" aria-label={title}>{icon}</span>
        {title}
      </h4>
      {items && items.length > 0 ? (
        <div className="space-y-2">
          {items.slice(0, 3).map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-700 truncate">{item.name}</span>
              <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No data yet</p>
      )}
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Stats & Insights</h3>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Books This Year"
          value={stats.booksThisYear || 0}
          subtitle={`${stats.totalBooks || 0} total`}
          icon="📚"
          color="text-blue-600"
        />
        <StatCard
          title="Pages This Year"
          value={(stats.pagesThisYear || 0).toLocaleString()}
          subtitle={`${(stats.totalPages || 0).toLocaleString()} total`}
          icon="📄"
          color="text-green-600"
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
          subtitle="out of 5.0"
          icon="⭐"
          color="text-yellow-600"
        />
        <StatCard
          title="Reading Streak"
          value={stats.readingStreak || 0}
          subtitle="days"
          icon="🔥"
          color="text-orange-600"
        />
      </div>

      {/* Top Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopItem
          title="Top Genres"
          icon="🏷️"
          items={stats.topGenres}
        />
        <TopItem
          title="Top Authors"
          icon="✍️"
          items={stats.topAuthors}
        />
      </div>

      {/* Additional Insights */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600 mb-1">Books per Month</div>
            <div className="text-lg font-semibold text-gray-900">
              {stats.booksThisYear ? (stats.booksThisYear / (new Date().getMonth() + 1)).toFixed(1) : '0.0'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Pages per Day</div>
            <div className="text-lg font-semibold text-gray-900">
              {stats.pagesThisYear ? Math.round(stats.pagesThisYear / new Date().getDate()) : 0}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
            <div className="text-lg font-semibold text-gray-900">
              {stats.totalBooks > 0 ? Math.round((stats.booksThisYear / stats.totalBooks) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      {stats.readingStreak > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-800">
            <span className="text-lg">🎉</span>
            <span className="font-medium">
              {stats.readingStreak >= 30 
                ? "Amazing! You're on fire with your reading streak!" 
                : stats.readingStreak >= 7
                ? "Great job maintaining your reading habit!"
                : "Keep up the good work!"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;