import * as SQLite from 'expo-sqlite';

export class Database {
  private static db: SQLite.SQLiteDatabase | null = null;

  /**
   * Initialize database connection and create tables
   */
  static async init(dbName: string = 'smart-ai-friend.db'): Promise<void> {
    this.db = await SQLite.openDatabaseAsync(dbName);

    // Create tables
    await this.createTables();
  }

  /**
   * Get database connection
   */
  static getConnection(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  /**
   * Close database connection
   */
  static async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }

  /**
   * Execute SQL query
   */
  static async executeSql(
    sql: string,
    params: any[] = []
  ): Promise<{ rows: any[] }> {
    const db = this.getConnection();

    // Check if this is a SELECT query
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const result = await db.getAllAsync(sql, params);
      return { rows: result };
    }

    // For INSERT, UPDATE, DELETE, use runAsync
    await db.runAsync(sql, params);
    return { rows: [] };
  }

  /**
   * Create database tables
   */
  private static async createTables(): Promise<void> {
    const db = this.getConnection();

    // Creatures table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS creatures (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
  }
}
