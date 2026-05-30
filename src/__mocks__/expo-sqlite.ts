// Mock implementation of expo-sqlite for testing

class MockDatabase {
  private tables: Map<string, any[]> = new Map();
  private schemas: Map<string, string> = new Map();

  async execAsync(sql: string): Promise<void> {
    // Parse CREATE TABLE statements
    const createTableMatch = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
    if (createTableMatch) {
      const tableName = createTableMatch[1];
      this.schemas.set(tableName, sql);
      if (!this.tables.has(tableName)) {
        this.tables.set(tableName, []);
      }
    }
  }

  async runAsync(sql: string, params: any[] = []): Promise<any> {
    // Handle INSERT with ON CONFLICT
    const insertMatch = sql.match(/INSERT INTO (\w+) \(([^)]+)\) VALUES \(([^)]+)\)/i);
    if (insertMatch) {
      const tableName = insertMatch[1];
      const columns = insertMatch[2].split(',').map(c => c.trim());
      const table = this.tables.get(tableName) || [];

      // Create row object
      const row: any = {};
      columns.forEach((col, idx) => {
        row[col] = params[idx];
      });

      // Add default updated_at if not provided
      if (!row.updated_at) {
        row.updated_at = Date.now();
      }

      // Check for ON CONFLICT (upsert)
      if (sql.includes('ON CONFLICT')) {
        const existingIdx = table.findIndex((r: any) => r.id === row.id);
        if (existingIdx >= 0) {
          // Update existing
          table[existingIdx] = row;
        } else {
          // Insert new
          table.push(row);
        }
      } else {
        table.push(row);
      }

      this.tables.set(tableName, table);
      return { lastInsertRowId: table.length };
    }

    // Handle DELETE
    const deleteMatch = sql.match(/DELETE FROM (\w+) WHERE (.+)/i);
    if (deleteMatch) {
      const tableName = deleteMatch[1];
      const table = this.tables.get(tableName) || [];

      // Simple WHERE id = ? handling
      if (params.length > 0) {
        const filtered = table.filter((row: any) => row.id !== params[0]);
        this.tables.set(tableName, filtered);
      }
      return { changes: table.length };
    }

    return {};
  }

  async getAllAsync(sql: string, params: any[] = []): Promise<any[]> {
    // Handle SELECT * FROM table WHERE id = ?
    const selectMatch = sql.match(/SELECT .+ FROM (\w+)(?: WHERE (.+))?/i);
    if (selectMatch) {
      const tableName = selectMatch[1];
      const table = this.tables.get(tableName) || [];

      if (params.length > 0 && sql.includes('WHERE')) {
        // Filter by id - handle both "id = ?" and other WHERE clauses
        return table.filter((row: any) => row.id === params[0]);
      }

      // Return all rows, sorted by updated_at if requested
      if (sql.includes('ORDER BY updated_at DESC')) {
        return [...table].sort((a: any, b: any) => b.updated_at - a.updated_at);
      }

      return table;
    }

    return [];
  }

  async getFirstAsync(sql: string, params: any[] = []): Promise<any | null> {
    // Handle sqlite_master query for table existence
    if (sql.includes('sqlite_master')) {
      const tableMatch = sql.match(/name='(\w+)'/);
      if (tableMatch) {
        const tableName = tableMatch[1];
        if (this.schemas.has(tableName)) {
          return { name: tableName };
        }
      }
      return null;
    }

    // Handle regular SELECT queries
    const results = await this.getAllAsync(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  async closeAsync(): Promise<void> {
    this.tables.clear();
    this.schemas.clear();
  }
}

let currentDatabase: MockDatabase | null = null;

export async function openDatabaseAsync(dbName: string): Promise<MockDatabase> {
  currentDatabase = new MockDatabase();
  return currentDatabase;
}

export type SQLiteDatabase = MockDatabase;
