'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Heart, Bookmark } from 'lucide-react';

export default function InfoHub() {
  const [articles, setArticles] = useState({
    healthywomen: [],
    healthcom: [],
    guardian: [],
    bbc: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [showBookmarked, setShowBookmarked] = useState(false);

  const categories = [
    'Mental Health',
    'Nutrition',
    'Heart Disease',
    'Diabetes',
    'Fitness',
    'Cancer',
    "Women's Health",
    'Public Health',
    'Infectious Diseases'
  ];

  useEffect(() => {
    fetchArticles();
    fetchBookmarks();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/articles?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.data);
        setMetadata(data.metadata);
      } else {
        throw new Error(data.error || 'Failed to fetch articles');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/bookmarks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        const bookmarkIds = new Set(data.bookmarks.map(b => b.article_id));
        setBookmarks(bookmarkIds);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    }
  };

  const toggleBookmark = async (article) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to bookmark articles');
        return;
      }

      const isBookmarked = bookmarks.has(article.id);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      if (isBookmarked) {
        // Remove bookmark
        const deleteUrl = `${apiUrl}/api/bookmarks/${encodeURIComponent(article.id)}`;
        console.log('DELETE URL:', deleteUrl);
        
        const response = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        console.log('DELETE Response:', response.status, data);

        if (response.ok) {
          setBookmarks(prev => {
            const newSet = new Set(prev);
            newSet.delete(article.id);
            console.log('Updated bookmarks after delete:', Array.from(newSet));
            return newSet;
          });
          // Refetch bookmarks to sync with database
          await fetchBookmarks();
        } else {
          throw new Error(data.message || 'Failed to remove bookmark');
        }
      } else {
        // Add bookmark
        console.log('Adding bookmark with data:', {
          articleId: article.id,
          articleData: article
        });
        
        const response = await fetch(`${apiUrl}/api/bookmarks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            articleId: article.id,
            articleData: article
          })
        });

        const data = await response.json();
        console.log('POST Response:', response.status, data);

        if (response.ok) {
          setBookmarks(prev => new Set([...prev, article.id]));
          // Refetch bookmarks to sync with database
          await fetchBookmarks();
        } else {
          throw new Error(data.message || 'Failed to add bookmark');
        }
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      alert('Failed to update bookmark: ' + err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setShowBookmarked(false);
  };

  const getAllArticles = () => {
    const allArticles = Object.entries(articles).flatMap(([source, sourceArticles]) => 
      sourceArticles.map(article => ({ ...article, sourceKey: source }))
    );

    if (showBookmarked) {
      return allArticles.filter(article => bookmarks.has(article.id));
    }

    return allArticles;
  };

  const displayedArticles = getAllArticles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
              Health Infohub
            </h1>
            <p className="text-xl text-blue-100 mb-2">
              Curated Health Articles For <span className="underline font-bold">YOU</span> From Trusted Sources
            </p>
            
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="mb-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  placeholder="Search health articles..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all font-semibold flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Filters:</span>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowBookmarked(!showBookmarked)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                showBookmarked
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              {showBookmarked ? 'Show All' : 'Bookmarked Only'}
            </button>

            {(searchQuery || selectedCategory || showBookmarked) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Clear Filters
              </button>
            )}

            <div className="ml-auto text-sm text-gray-600 font-medium">
              {displayedArticles.length} articles found
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            <p className="font-semibold">Error loading articles</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div>
            {displayedArticles.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayedArticles.map((article) => (
                  <ArticleCard 
                    key={article.id} 
                    article={article}
                    isBookmarked={bookmarks.has(article.id)}
                    onToggleBookmark={() => toggleBookmark(article)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {showBookmarked ? 'No bookmarked articles' : 'No articles found'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {showBookmarked 
                    ? 'Start bookmarking articles to save them for later'
                    : 'Try adjusting your search or filters'}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const ArticleCard = ({ article, isBookmarked, onToggleBookmark }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      {article.featuredImage && (
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-white bg-opacity-90 text-xs font-semibold text-gray-700 rounded-full">
              {article.category}
            </span>
          </div>
          <button
            onClick={onToggleBookmark}
            className={`absolute top-3 left-3 p-2 rounded-full transition-all ${
              isBookmarked
                ? 'bg-blue-600 text-white'
                : 'bg-white bg-opacity-90 text-gray-600 hover:bg-opacity-100'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          {article.title}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
          {article.summary}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          {article.author && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {article.author}
            </span>
          )}
          <span className={article.author ? '' : 'ml-auto'}>{formatDate(article.publishDate)}</span>
        </div>

        
          <a href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Read Full Article →
        </a>
      </div>
    </div>
  );
};