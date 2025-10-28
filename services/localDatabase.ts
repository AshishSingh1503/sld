import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

const db = SQLite.openDatabase('sld_app.db');

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  age?: number;
  createdAt: string;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  folderId: string;
  title: string;
  content: string;
  type: 'text' | 'handwritten';
  color: string;
  createdAt: string;
  updatedAt: string;
}

class LocalDatabase {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // Users table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            passwordHash TEXT NOT NULL,
            age INTEGER,
            createdAt TEXT NOT NULL
          )
        `);

        // Folders table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS folders (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            name TEXT NOT NULL,
            color TEXT NOT NULL,
            icon TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users (id)
          )
        `);

        // Notes table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            folderId TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            type TEXT NOT NULL,
            color TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users (id),
            FOREIGN KEY (folderId) REFERENCES folders (id)
          )
        `);
      }, reject, () => {
        this.initialized = true;
        resolve();
      });
    });
  }

  async hashPassword(password: string): Promise<string> {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password + 'salt'
    );
  }

  async createUser(email: string, password: string, name: string, age?: number): Promise<User> {
    await this.init();
    const id = await Crypto.randomUUID();
    const passwordHash = await this.hashPassword(password);
    const createdAt = new Date().toISOString();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO users (id, email, name, passwordHash, age, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
          [id, email.toLowerCase(), name, passwordHash, age || null, createdAt],
          () => resolve({ id, email, name, passwordHash, age, createdAt }),
          (_, error) => reject(error)
        );
      });
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM users WHERE email = ?',
          [email.toLowerCase()],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0) as User);
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async getUserById(id: string): Promise<User | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM users WHERE id = ?',
          [id],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0) as User);
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async createFolder(userId: string, name: string, color: string, icon: string): Promise<Folder> {
    await this.init();
    const id = await Crypto.randomUUID();
    const createdAt = new Date().toISOString();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO folders (id, userId, name, color, icon, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
          [id, userId, name, color, icon, createdAt],
          () => resolve({ id, userId, name, color, icon, createdAt }),
          (_, error) => reject(error)
        );
      });
    });
  }

  async getFoldersByUserId(userId: string): Promise<Folder[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM folders WHERE userId = ? ORDER BY createdAt DESC',
          [userId],
          (_, { rows }) => {
            const folders: Folder[] = [];
            for (let i = 0; i < rows.length; i++) {
              folders.push(rows.item(i) as Folder);
            }
            resolve(folders);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async createNote(userId: string, folderId: string, title: string, content: string, type: 'text' | 'handwritten', color: string): Promise<Note> {
    await this.init();
    const id = await Crypto.randomUUID();
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO notes (id, userId, folderId, title, content, type, color, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, userId, folderId, title, content, type, color, now, now],
          () => resolve({ id, userId, folderId, title, content, type, color, createdAt: now, updatedAt: now }),
          (_, error) => reject(error)
        );
      });
    });
  }

  async getNotesByFolderId(folderId: string): Promise<Note[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM notes WHERE folderId = ? ORDER BY updatedAt DESC',
          [folderId],
          (_, { rows }) => {
            const notes: Note[] = [];
            for (let i = 0; i < rows.length; i++) {
              notes.push(rows.item(i) as Note);
            }
            resolve(notes);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async updateNote(id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'color'>>): Promise<void> {
    await this.init();
    const updatedAt = new Date().toISOString();
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), updatedAt, id];

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE notes SET ${fields}, updatedAt = ? WHERE id = ?`,
          values,
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }

  async deleteNote(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM notes WHERE id = ?',
          [id],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }

  async deleteFolder(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // Delete all notes in the folder first
        tx.executeSql('DELETE FROM notes WHERE folderId = ?', [id]);
        // Delete the folder
        tx.executeSql(
          'DELETE FROM folders WHERE id = ?',
          [id],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }
}

export const localDB = new LocalDatabase();