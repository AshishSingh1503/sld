import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'handwritten';
  color: string;
  folderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  notes: Note[];
}

export const authAPI = {
  register: async (email: string, password: string, name: string, age?: number) => {
    const response = await api.post('/auth/register', { email, password, name, age });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const foldersAPI = {
  getFolders: async (): Promise<Folder[]> => {
    const response = await api.get('/folders');
    return response.data;
  },

  createFolder: async (name: string, color?: string, icon?: string): Promise<Folder> => {
    const response = await api.post('/folders', { name, color, icon });
    return response.data;
  },

  updateFolder: async (id: string, updates: Partial<Pick<Folder, 'name' | 'color' | 'icon'>>): Promise<Folder> => {
    const response = await api.put(`/folders/${id}`, updates);
    return response.data;
  },

  deleteFolder: async (id: string): Promise<void> => {
    await api.delete(`/folders/${id}`);
  },
};

export const notesAPI = {
  getNotesByFolder: async (folderId: string): Promise<Note[]> => {
    const response = await api.get(`/notes/folder/${folderId}`);
    return response.data;
  },

  getNote: async (id: string): Promise<Note> => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  createNote: async (title: string, folderId: string, content?: string, type?: 'text' | 'handwritten', color?: string): Promise<Note> => {
    const response = await api.post('/notes', { title, folderId, content, type, color });
    return response.data;
  },

  updateNote: async (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'color'>>): Promise<Note> => {
    const response = await api.put(`/notes/${id}`, updates);
    return response.data;
  },

  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },

  searchNotes: async (query: string): Promise<Note[]> => {
    const response = await api.get(`/notes/search/${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default api;