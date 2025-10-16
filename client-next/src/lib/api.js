const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add auth token if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET request
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // PUT request
  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  // DELETE request
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // === ARTICLES ===
  getArticles(searchKeyword = '', category = '', source = '') {
    const params = new URLSearchParams();
    if (searchKeyword) params.append('search', searchKeyword);
    if (category) params.append('category', category);
    if (source) params.append('source', source);
    
    return this.get(`/articles?${params.toString()}`);
  }

  getCategories() {
    return this.get('/articles/categories');
  }

  // === AUTH ===
  login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  register(email, password, name) {
    return this.post('/auth/register', { email, password, name });
  }

  logout() {
    localStorage.removeItem('token');
  }

  // === BOOKMARKS ===
  getBookmarks() {
    return this.get('/bookmarks');
  }

  addBookmark(articleId) {
    return this.post('/bookmarks', { articleId });
  }

  removeBookmark(bookmarkId) {
    return this.delete(`/bookmarks/${bookmarkId}`);
  }
}

const api = new ApiClient(API_URL);
export default api;