<<<<<<< HEAD
// lib/database.ts
import * as SQLite from "expo-sqlite";
import { User, Aquarium, FishReport, Notification } from "../types";

let db: SQLite.SQLiteDatabase | null = null;

// ✅ prevents race condition (multiple initDatabase calls at once)
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const toNumber = (v: any, fieldName: string) => {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid number for ${fieldName}. Got: ${String(v)}`);
  }
  return n;
};

const requireText = (v: any, fieldName: string) => {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`Missing ${fieldName}`);
  return s;
};

const requireId = (v: any, fieldName: string) => {
  const n = toNumber(v, fieldName);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`Invalid ${fieldName}. Got: ${String(v)}`);
  }
  return n;
};

// ✅ Always use this to get db safely
const getDb = async () => {
  if (db) return db;
  await initDatabase(); // auto init if needed
  if (!db) throw new Error("Database failed to initialize.");
  return db;
};

export const initDatabase = async () => {
  // ✅ if init is already running, wait for it
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // ✅ open once
      const opened = await SQLite.openDatabaseAsync("aquaguard.db");
      db = opened;

      // ✅ run statements one by one
      await opened.execAsync("PRAGMA foreign_keys = ON;");

      await opened.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fullName TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await opened.execAsync(`
        CREATE TABLE IF NOT EXISTS aquariums (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          name TEXT NOT NULL,
          height REAL NOT NULL,
          width REAL NOT NULL,
          length REAL NOT NULL,
          fishCount INTEGER NOT NULL,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      await opened.execAsync(`
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
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (aquariumId) REFERENCES aquariums(id) ON DELETE SET NULL
        );
      `);

      await opened.execAsync(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL,
          isRead INTEGER DEFAULT 0,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      console.log("✅ Database initialized successfully");
      return opened;
    } catch (error: any) {
      // ✅ important: allow retry if init failed
      initPromise = null;
      db = null;

      console.error("❌ Database initialization failed:", error?.message ?? error);
      throw error;
    }
  })();

  return initPromise;
};

// ✅ keep this for any existing callers, but make it safe
export const getDatabase = () => {
  if (!db) {
    throw new Error(
      "Database not initialized yet. Call await initDatabase() before using services."
    );
=======
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
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
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
<<<<<<< HEAD
      const db = await getDb();
      const fullNameSafe = requireText(fullName, "fullName");
      const emailSafe = requireText(email, "email");
      const passwordSafe = requireText(password, "password");

      const result = await db.runAsync(
        "INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)",
        [fullNameSafe, emailSafe, passwordSafe]
      );

      const user = await db.getFirstAsync<User>(
        "SELECT * FROM users WHERE id = ?",
=======
      const db = getDatabase();
      const result = await db.runAsync(
        'INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)',
        [fullName, email, password]
      );

      const user = await db.getFirstAsync<User>(
        'SELECT * FROM users WHERE id = ?',
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
        [result.lastInsertRowId]
      );

      return user || null;
<<<<<<< HEAD
    } catch (error: any) {
      console.error("❌ Failed to create user:", error?.message ?? error);
=======
    } catch (error) {
      console.error('❌ Failed to create user:', error);
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
      return null;
    }
  },

<<<<<<< HEAD
  loginUser: async (email: string, password: string): Promise<User | null> => {
    try {
      const db = await getDb();
      const emailSafe = requireText(email, "email");
      const passwordSafe = requireText(password, "password");

      const user = await db.getFirstAsync<User>(
        "SELECT * FROM users WHERE email = ? AND password = ?",
        [emailSafe, passwordSafe]
      );

      return user || null;
    } catch (error: any) {
      console.error("❌ Login failed:", error?.message ?? error);
      return null;
    }
  },

  getUserById: async (userId: number): Promise<User | null> => {
    try {
      const db = await getDb();
      const userIdSafe = requireId(userId, "userId");

      const user = await db.getFirstAsync<User>(
        "SELECT * FROM users WHERE id = ?",
        [userIdSafe]
      );

      return user || null;
    } catch (error: any) {
      console.error("❌ Failed to get user:", error?.message ?? error);
      return null;
    }
  },

  updateUserProfile: async (
    userId: number,
    fullName: string,
    email: string
  ): Promise<User | null> => {
    try {
      const db = await getDb();
      const userIdSafe = requireId(userId, "userId");
      const fullNameSafe = requireText(fullName, "fullName");
      const emailSafe = requireText(email, "email");

      const existing = await db.getFirstAsync<User>(
        "SELECT * FROM users WHERE email = ? AND id != ?",
        [emailSafe, userIdSafe]
      );
      if (existing) throw new Error("Email already used by another account");

      await db.runAsync(
        "UPDATE users SET fullName = ?, email = ? WHERE id = ?",
        [fullNameSafe, emailSafe, userIdSafe]
      );

      const updated = await db.getFirstAsync<User>(
        "SELECT * FROM users WHERE id = ?",
        [userIdSafe]
      );

      return updated || null;
    } catch (error: any) {
      console.error("❌ Failed to update profile:", error?.message ?? error);
      throw error;
    }
  },

  changePassword: async (
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      const db = await getDb();
      const userIdSafe = requireId(userId, "userId");
      const currentSafe = requireText(currentPassword, "currentPassword");
      const newSafe = requireText(newPassword, "newPassword");

      const user = await db.getFirstAsync<User>(
        "SELECT * FROM users WHERE id = ? AND password = ?",
        [userIdSafe, currentSafe]
      );
      if (!user) throw new Error("Current password is incorrect");

      await db.runAsync("UPDATE users SET password = ? WHERE id = ?", [
        newSafe,
        userIdSafe,
      ]);

      return true;
    } catch (error: any) {
      console.error("❌ Failed to change password:", error?.message ?? error);
      throw error;
=======
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
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
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
<<<<<<< HEAD
      const db = await getDb();

      const userIdSafe = requireId(userId, "userId");
      const nameSafe = requireText(name, "aquarium name");
      const heightSafe = toNumber(height, "height");
      const widthSafe = toNumber(width, "width");
      const lengthSafe = toNumber(length, "length");
      const fishCountSafe = requireId(fishCount, "fishCount");

      const result = await db.runAsync(
        `INSERT INTO aquariums (userId, name, height, width, length, fishCount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userIdSafe, nameSafe, heightSafe, widthSafe, lengthSafe, fishCountSafe]
      );

      const aquarium = await db.getFirstAsync<Aquarium>(
        "SELECT * FROM aquariums WHERE id = ?",
=======
      const db = getDatabase();
      const result = await db.runAsync(
        'INSERT INTO aquariums (userId, name, height, width, length, fishCount) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, name, height, width, length, fishCount]
      );

      const aquarium = await db.getFirstAsync<Aquarium>(
        'SELECT * FROM aquariums WHERE id = ?',
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
        [result.lastInsertRowId]
      );

      return aquarium || null;
<<<<<<< HEAD
    } catch (error: any) {
      console.error("❌ Failed to create aquarium:", error?.message ?? error, {
        userId,
        name,
        height,
        width,
        length,
        fishCount,
      });
=======
    } catch (error) {
      console.error('❌ Failed to create aquarium:', error);
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
      return null;
    }
  },

  getUserAquariums: async (userId: number): Promise<Aquarium[]> => {
    try {
<<<<<<< HEAD
      const db = await getDb();
      const userIdSafe = requireId(userId, "userId");

      return await db.getAllAsync<Aquarium>(
        "SELECT * FROM aquariums WHERE userId = ? ORDER BY datetime(createdAt) DESC, id DESC",
        [userIdSafe]
      );
    } catch (error: any) {
      console.error("❌ Failed to get aquariums:", error?.message ?? error);
=======
      const db = getDatabase();
      return await db.getAllAsync<Aquarium>(
        'SELECT * FROM aquariums WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      );
    } catch (error) {
      console.error('❌ Failed to get aquariums:', error);
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
      return [];
    }
  },
};

export const reportService = {
  createReport: async (
    userId: number,
    aquariumId: number | null,
    videoUri: string | null,
<<<<<<< HEAD
    fishCondition: "Normal" | "Stressed" | "Hungry",
    suggestion: string,
    temperature: number,
    phLevel: number,
    waterStatus: "Safe" | "Warning" | "Dangerous"
  ): Promise<FishReport | null> => {
    try {
      const db = await getDb();

      const userIdSafe = requireId(userId, "userId");
      const aquariumIdSafe =
        aquariumId == null ? null : requireId(aquariumId, "aquariumId");
      const videoUriSafe = videoUri == null ? null : String(videoUri);
      const fishConditionSafe = requireText(fishCondition, "fishCondition");
      const suggestionSafe = requireText(suggestion, "suggestion");
      const temperatureSafe = toNumber(temperature, "temperature");
      const phLevelSafe = toNumber(phLevel, "phLevel");
      const waterStatusSafe = requireText(waterStatus, "waterStatus");

      const result = await db.runAsync(
        `INSERT INTO fish_reports
         (userId, aquariumId, videoUri, fishCondition, suggestion, temperature, phLevel, waterStatus)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userIdSafe,
          aquariumIdSafe,
          videoUriSafe,
          fishConditionSafe,
          suggestionSafe,
          temperatureSafe,
          phLevelSafe,
          waterStatusSafe,
        ]
      );

      const report = await db.getFirstAsync<FishReport>(
        "SELECT * FROM fish_reports WHERE id = ?",
=======
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
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
        [result.lastInsertRowId]
      );

      return report || null;
<<<<<<< HEAD
    } catch (error: any) {
      console.error("❌ Failed to create report:", error?.message ?? error);
=======
    } catch (error) {
      console.error('❌ Failed to create report:', error);
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
      return null;
    }
  },

  getUserReports: async (userId: number): Promise<FishReport[]> => {
    try {
<<<<<<< HEAD
      const db = await getDb();
      const userIdSafe = requireId(userId, "userId");

      const reports = await db.getAllAsync<FishReport>(
        `
        SELECT *
        FROM fish_reports
        WHERE userId = ?
        ORDER BY datetime(createdAt) DESC, id DESC
        `,
        [userIdSafe]
      );

      return reports || [];
    } catch (error: any) {
      console.error("❌ Failed to get reports:", error?.message ?? error);
=======
      const db = getDatabase();
      return await db.getAllAsync<FishReport>(
        'SELECT * FROM fish_reports WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      );
    } catch (error) {
      console.error('❌ Failed to get reports:', error);
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
      return [];
    }
  },

  deleteReport: async (reportId: number): Promise<boolean> => {
    try {
<<<<<<< HEAD
      const db = await getDb();
      const reportIdSafe = requireId(reportId, "reportId");
      await db.runAsync("DELETE FROM fish_reports WHERE id = ?", [reportIdSafe]);
      return true;
    } catch (error: any) {
      console.error("❌ Failed to delete report:", error?.message ?? error);
=======
      const db = getDatabase();
      await db.runAsync('DELETE FROM fish_reports WHERE id = ?', [reportId]);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete report:', error);
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
      return false;
    }
  },
};

export const notificationService = {
  createNotification: async (
    userId: number,
    message: string,
<<<<<<< HEAD
    type: "water_quality" | "fish_stress" | "reminder"
  ): Promise<Notification | null> => {
    try {
      const db = await getDb();
      const userIdSafe = requireId(userId, "userId");
      const messageSafe = requireText(message, "message");
      const typeSafe = requireText(type, "type");

      const result = await db.runAsync(
        "INSERT INTO notifications (userId, message, type) VALUES (?, ?, ?)",
        [userIdSafe, messageSafe, typeSafe]
      );

      const notification = await db.getFirstAsync<Notification>(
        "SELECT * FROM notifications WHERE id = ?",
=======
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
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
        [result.lastInsertRowId]
      );

      return notification || null;
<<<<<<< HEAD
    } catch (error: any) {
      console.error("❌ Failed to create notification:", error?.message ?? error);
=======
    } catch (error) {
      console.error('❌ Failed to create notification:', error);
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
      return null;
    }
  },

  getUserNotifications: async (userId: number): Promise<Notification[]> => {
    try {
<<<<<<< HEAD
      const db = await getDb();
      const userIdSafe = requireId(userId, "userId");

      // ✅ newest first (stable order)
      return await db.getAllAsync<Notification>(
        `
        SELECT *
        FROM notifications
        WHERE userId = ?
        ORDER BY datetime(createdAt) DESC, id DESC
        `,
        [userIdSafe]
      );
    } catch (error: any) {
      console.error("❌ Failed to get notifications:", error?.message ?? error);
=======
      const db = getDatabase();
      return await db.getAllAsync<Notification>(
        'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      );
    } catch (error) {
      console.error('❌ Failed to get notifications:', error);
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
      return [];
    }
  },

<<<<<<< HEAD
  deleteNotification: async (notificationId: number): Promise<boolean> => {
    try {
      const db = await getDb();
      const notificationIdSafe = requireId(notificationId, "notificationId");

      await db.runAsync("DELETE FROM notifications WHERE id = ?", [
        notificationIdSafe,
      ]);

      return true;
    } catch (error: any) {
      console.error("❌ Failed to delete notification:", error?.message ?? error);
      return false;
    }
  },

  markAsRead: async (notificationId: number): Promise<boolean> => {
    try {
      const db = await getDb();
      const notificationIdSafe = requireId(notificationId, "notificationId");

      await db.runAsync("UPDATE notifications SET isRead = 1 WHERE id = ?", [
        notificationIdSafe,
      ]);

      return true;
    } catch (error: any) {
      console.error(
        "❌ Failed to mark notification as read:",
        error?.message ?? error
      );
      return false;
    }
  },
};
=======
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
>>>>>>> 3b9265f1c86c1c593e308c43190dba1360def82e
