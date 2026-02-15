import * as SQLite from 'expo-sqlite';
import { User, Aquarium, FishReport, Notification } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('aquaguard.db');

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS aquariums (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        name TEXT NOT NULL,
        height REAL NOT NULL,
        width REAL NOT NULL,
        length REAL NOT NULL,
        fishCount INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS fish_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        aquariumId INTEGER,
        videoUri TEXT,
        fishCondition TEXT NOT NULL,
        suggestion TEXT NOT NULL,
        temperature REAL NOT NULL,
        phLevel REAL NOT NULL,
        waterStatus TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (aquariumId) REFERENCES aquariums(id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        isRead INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);

    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};

export const userService = {
  createUser: async (
    fullName: string,
    email: string,
    password: string
  ): Promise<User | null> => {
    try {
      const db = getDatabase();
      const result = await db.runAsync(
        'INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)',
        [fullName, email, password]
      );

      const user = await db.getFirstAsync<User>(
        'SELECT * FROM users WHERE id = ?',
        [result.lastInsertRowId]
      );

      return user || null;
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      return null;
    }
  },

  loginUser: async (
    email: string,
    password: string
  ): Promise<User | null> => {
    try {
      const db = getDatabase();
      const user = await db.getFirstAsync<User>(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password]
      );

      return user || null;
    } catch (error) {
      console.error('❌ Login failed:', error);
      return null;
    }
  },
};

export const aquariumService = {
  createAquarium: async (
    userId: number,
    name: string,
    height: number,
    width: number,
    length: number,
    fishCount: number
  ): Promise<Aquarium | null> => {
    try {
      const db = getDatabase();
      const result = await db.runAsync(
        'INSERT INTO aquariums (userId, name, height, width, length, fishCount) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, name, height, width, length, fishCount]
      );

      const aquarium = await db.getFirstAsync<Aquarium>(
        'SELECT * FROM aquariums WHERE id = ?',
        [result.lastInsertRowId]
      );

      return aquarium || null;
    } catch (error) {
      console.error('❌ Failed to create aquarium:', error);
      return null;
    }
  },

  getUserAquariums: async (userId: number): Promise<Aquarium[]> => {
    try {
      const db = getDatabase();
      return await db.getAllAsync<Aquarium>(
        'SELECT * FROM aquariums WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      );
    } catch (error) {
      console.error('❌ Failed to get aquariums:', error);
      return [];
    }
  },
};

export const reportService = {
  createReport: async (
    userId: number,
    aquariumId: number | null,
    videoUri: string | null,
    fishCondition: 'Normal' | 'Stressed' | 'Hungry',
    suggestion: string,
    temperature: number,
    phLevel: number,
    waterStatus: 'Safe' | 'Warning' | 'Dangerous'
  ): Promise<FishReport | null> => {
    try {
      const db = getDatabase();
      const result = await db.runAsync(
        'INSERT INTO fish_reports (userId, aquariumId, videoUri, fishCondition, suggestion, temperature, phLevel, waterStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, aquariumId, videoUri, fishCondition, suggestion, temperature, phLevel, waterStatus]
      );

      const report = await db.getFirstAsync<FishReport>(
        'SELECT * FROM fish_reports WHERE id = ?',
        [result.lastInsertRowId]
      );

      return report || null;
    } catch (error) {
      console.error('❌ Failed to create report:', error);
      return null;
    }
  },

  getUserReports: async (userId: number): Promise<FishReport[]> => {
    try {
      const db = getDatabase();
      return await db.getAllAsync<FishReport>(
        'SELECT * FROM fish_reports WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      );
    } catch (error) {
      console.error('❌ Failed to get reports:', error);
      return [];
    }
  },

  deleteReport: async (reportId: number): Promise<boolean> => {
    try {
      const db = getDatabase();
      await db.runAsync('DELETE FROM fish_reports WHERE id = ?', [reportId]);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete report:', error);
      return false;
    }
  },
};

export const notificationService = {
  createNotification: async (
    userId: number,
    message: string,
    type: 'water_quality' | 'fish_stress' | 'reminder'
  ): Promise<Notification | null> => {
    try {
      const db = getDatabase();
      const result = await db.runAsync(
        'INSERT INTO notifications (userId, message, type) VALUES (?, ?, ?)',
        [userId, message, type]
      );

      const notification = await db.getFirstAsync<Notification>(
        'SELECT * FROM notifications WHERE id = ?',
        [result.lastInsertRowId]
      );

      return notification || null;
    } catch (error) {
      console.error('❌ Failed to create notification:', error);
      return null;
    }
  },

  getUserNotifications: async (userId: number): Promise<Notification[]> => {
    try {
      const db = getDatabase();
      return await db.getAllAsync<Notification>(
        'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      );
    } catch (error) {
      console.error('❌ Failed to get notifications:', error);
      return [];
    }
  },

  markAsRead: async (notificationId: number): Promise<boolean> => {
    try {
      const db = getDatabase();
      await db.runAsync(
        'UPDATE notifications SET isRead = 1 WHERE id = ?',
        [notificationId]
      );
      return true;
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      return false;
    }
  },
};
