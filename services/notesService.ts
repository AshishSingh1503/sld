import { localDB, Note, Folder } from './localDatabase';
import { authService } from './authService';

export interface NoteData {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'handwritten';
  color?: string;
  folderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderData {
  id: string;
  name: string;
  color: string;
  icon?: string;
  notes: NoteData[];
  createdAt: Date;
  updatedAt: Date;
}

class NotesService {
  /**
   * Get all folders for the current user
   */
  async getFolders(): Promise<FolderData[]> {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const folders = await localDB.getFoldersByUserId(currentUser.id);
    const folderData: FolderData[] = [];

    for (const folder of folders) {
      const notes = await localDB.getNotesByFolderId(folder.id);
      
      folderData.push({
        id: folder.id,
        name: folder.name,
        color: folder.color,
        icon: folder.icon,
        notes: notes.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          type: note.type,
          color: note.color,
          folderId: folder.id,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        })),
        createdAt: new Date(folder.createdAt),
        updatedAt: new Date(folder.createdAt),
      });
    }

    return folderData;
  }

  /**
   * Create a new folder
   */
  async createFolder(name: string, color: string = '#6C63FF', icon: string = 'folder-outline'): Promise<FolderData> {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const folder = await localDB.createFolder(currentUser.id, name, color, icon);

    return {
      id: folder.id,
      name: folder.name,
      color: folder.color,
      icon: folder.icon,
      notes: [],
      createdAt: new Date(folder.createdAt),
      updatedAt: new Date(folder.createdAt),
    };
  }

  /**
   * Update a folder
   */
  async updateFolder(folderId: string, updates: Partial<{ name: string; color: string; icon: string }>): Promise<FolderData> {
    await connectDB();
    
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const folder = await Folder.findOneAndUpdate(
      { _id: folderId, userId: currentUser.id },
      updates,
      { new: true }
    );

    if (!folder) {
      throw new Error('Folder not found');
    }

    const notes = await Note.find({ folderId: folder._id }).sort({ updatedAt: -1 });

    return {
      id: folder._id.toString(),
      name: folder.name,
      color: folder.color,
      icon: folder.icon,
      notes: notes.map(note => ({
        id: note._id.toString(),
        title: note.title,
        content: note.content,
        type: note.type,
        color: note.color,
        folderId: folder._id.toString(),
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      })),
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    };
  }

  /**
   * Delete a folder and all its notes
   */
  async deleteFolder(folderId: string): Promise<void> {
    await connectDB();
    
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Delete all notes in the folder first
    await Note.deleteMany({ folderId, userId: currentUser.id });
    
    // Delete the folder
    const result = await Folder.deleteOne({ _id: folderId, userId: currentUser.id });
    
    if (result.deletedCount === 0) {
      throw new Error('Folder not found');
    }
  }

  /**
   * Create a new note
   */
  async createNote(
    folderId: string,
    title: string,
    content: string = '',
    type: 'text' | 'handwritten' = 'handwritten',
    color: string = '#FF6B6B'
  ): Promise<NoteData> {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const note = await localDB.createNote(currentUser.id, folderId, title, content, type, color);

    return {
      id: note.id,
      title: note.title,
      content: note.content,
      type: note.type,
      color: note.color,
      folderId: note.folderId,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    };
  }

  /**
   * Update a note
   */
  async updateNote(noteId: string, updates: Partial<{ title: string; content: string; color: string }>): Promise<void> {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    await localDB.updateNote(noteId, updates);
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId: string): Promise<void> {
    await connectDB();
    
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const result = await Note.deleteOne({ _id: noteId, userId: currentUser.id });
    
    if (result.deletedCount === 0) {
      throw new Error('Note not found');
    }
  }

  /**
   * Get a specific note
   */
  async getNote(noteId: string): Promise<NoteData> {
    await connectDB();
    
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const note = await Note.findOne({ _id: noteId, userId: currentUser.id });
    
    if (!note) {
      throw new Error('Note not found');
    }

    return {
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      type: note.type,
      color: note.color,
      folderId: note.folderId.toString(),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  /**
   * Search notes by content or title
   */
  async searchNotes(query: string): Promise<NoteData[]> {
    await connectDB();
    
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const notes = await Note.find({
      userId: currentUser.id,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ]
    }).sort({ updatedAt: -1 });

    return notes.map(note => ({
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      type: note.type,
      color: note.color,
      folderId: note.folderId.toString(),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));
  }

  /**
   * Initialize default folders for new users
   */
  async initializeDefaultFolders(): Promise<void> {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Check if user already has folders
    const existingFolders = await localDB.getFoldersByUserId(currentUser.id);
    if (existingFolders.length > 0) {
      return; // User already has folders
    }

    // Create default "Recent Notes" folder
    await localDB.createFolder(currentUser.id, 'Recent Notes', '#87CEEB', 'time-outline');
  }
}

export const notesService = new NotesService();