import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  
  logout: () => api.post('/auth/logout'),
  
  getProfile: () => api.get('/auth/profile'),
  
  updateProfile: (name: string) =>
    api.patch('/auth/profile', { name }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Subject API
export const subjectAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id: string) => api.get(`/subjects/${id}`),
  create: (data: { name: string; code: string; type: string; description?: string }) =>
    api.post('/subjects', data),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.patch(`/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/subjects/${id}`),
  getStats: (id: string) => api.get(`/subjects/${id}/stats`),
};

// Board API
export const boardAPI = {
  getAll: () => api.get('/boards'),
  getById: (id: string) => api.get(`/boards/${id}`),
  create: (data: { name: string; code: string; description?: string }) =>
    api.post('/boards', data),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.patch(`/boards/${id}`, data),
  delete: (id: string) => api.delete(`/boards/${id}`),
};

// Book API
export const bookAPI = {
  getAll: (params?: { subjectId?: string; boardId?: string; class?: number }) =>
    api.get('/books', { params }),
  getById: (id: string) => api.get(`/books/${id}`),
  create: (data: { subjectId: string; boardId: string; class: number }) =>
    api.post('/books', data),
  delete: (id: string) => api.delete(`/books/${id}`),
  getStats: (id: string) => api.get(`/books/${id}/stats`),
};

// Chapter API
export const chapterAPI = {
  getAll: (params?: { bookId?: string; subjectId?: string }) =>
    api.get('/chapters', { params }),
  getById: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/chapters/${id}`, { params }),
  create: (data: { bookId: string; name: string; number: number }) =>
    api.post('/chapters', data),
  update: (id: string, data: { name?: string; number?: number }) =>
    api.patch(`/chapters/${id}`, data),
  delete: (id: string) => api.delete(`/chapters/${id}`),
  getStats: (id: string) => api.get(`/chapters/${id}/stats`),
};

// MCQ API
export const mcqAPI = {
  getAll: (params?: { chapterId?: string; subjectId?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/mcqs', { params }),
  getById: (id: string) => api.get(`/mcqs/${id}`),
  create: (data: {
    chapterId: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    explanation?: string;
  }) => api.post('/mcqs', data),
  update: (id: string, data: Partial<{
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    explanation: string;
  }>) => api.patch(`/mcqs/${id}`, data),
  delete: (id: string) => api.delete(`/mcqs/${id}`),
  bulkDelete: (ids: string[]) => api.post('/mcqs/bulk-delete', { ids }),
  getCounts: (chapterId: string) => api.get(`/mcqs/${chapterId}/counts`),
  downloadTemplate: () => api.get('/mcqs/template/download', { responseType: 'blob' }),
  previewCSV: (chapterId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chapterId', chapterId);
    return api.post('/mcqs/upload/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  confirmCSV: (chapterId: string, validRows: any[]) =>
    api.post('/mcqs/upload/confirm', { chapterId, validRows }),
};

// Test API
export const testAPI = {
  startPractice: (chapterId: string) =>
    api.post('/tests/practice/start', { chapterId }),
  startPastPaper: (pastPaperId: string) =>
    api.post('/tests/past-paper/start', { pastPaperId }),
  saveAnswer: (sessionId: string, mcqId: string, answer: string) =>
    api.post('/tests/answer', { sessionId, mcqId, answer }),
  submitTest: (sessionId: string) =>
    api.post('/tests/submit', { sessionId }),
  autoSubmit: (sessionId: string) =>
    api.post('/tests/auto-submit', { sessionId }),
  getResult: (sessionId: string) => api.get(`/tests/result/${sessionId}`),
  getHistory: (params?: { page?: number; limit?: number }) =>
    api.get('/tests/history', { params }),
  getPastPapers: (params?: { year?: number; page?: number; limit?: number }) =>
    api.get('/tests/past-papers', { params }),
  getPastPaperById: (id: string) => api.get(`/tests/past-papers/${id}`),
};

// Leaderboard API
export const leaderboardAPI = {
  getLeaderboard: (params?: { month?: number; year?: number; page?: number; limit?: number }) =>
    api.get('/leaderboard', { params }),
  getMyRank: (params?: { month?: number; year?: number }) =>
    api.get('/leaderboard/my-rank', { params }),
  getTopPerformers: (params?: { month?: number; year?: number }) =>
    api.get('/leaderboard/top-performers', { params }),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get('/admin/users', { params }),
  getUserById: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: { isPremium?: boolean; role?: string }) =>
    api.patch(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  createPastPaper: (data: { title: string; year: number; mcqIds: string[] }) =>
    api.post('/admin/past-papers', data),
  updatePastPaper: (id: string, data: Partial<{ title: string; year: number; mcqIds: string[]; isActive: boolean }>) =>
    api.patch(`/admin/past-papers/${id}`, data),
  deletePastPaper: (id: string) => api.delete(`/admin/past-papers/${id}`),
  manualReset: (data?: { month?: number; year?: number }) =>
    api.post('/admin/reset', data),
  getResetStatus: () => api.get('/admin/reset-status'),
  getHallOfFame: (params?: { month?: number; year?: number; page?: number; limit?: number }) =>
    api.get('/admin/hall-of-fame', { params }),
};

// Premium API
export const premiumAPI = {
  getStatus: () => api.get('/premium/status'),
  getFeatures: () => api.get('/premium/features'),
  initiatePurchase: () => api.post('/premium/purchase'),
  confirmPurchase: (paymentId: string, status: string) =>
    api.post('/premium/confirm', { paymentId, status }),
};

export default api;
