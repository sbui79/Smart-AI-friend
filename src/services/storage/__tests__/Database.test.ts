import { Database } from '../Database';

describe('Database', () => {
  beforeEach(async () => {
    await Database.init(':memory:'); // Use in-memory DB for tests
  });

  afterEach(async () => {
    await Database.close();
  });

  describe('init', () => {
    it('should initialize database connection', async () => {
      const db = Database.getConnection();
      expect(db).toBeDefined();
    });

    it('should create creatures table', async () => {
      const db = Database.getConnection();
      const result = await db.getFirstAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='creatures'"
      );
      expect(result).toBeDefined();
      expect(result?.name).toBe('creatures');
    });
  });

  describe('executeSql', () => {
    it('should execute SQL commands', async () => {
      await Database.executeSql(
        'INSERT INTO creatures (id, data) VALUES (?, ?)',
        ['test-id', JSON.stringify({ name: 'Test' })]
      );

      const result = await Database.executeSql(
        'SELECT * FROM creatures WHERE id = ?',
        ['test-id']
      );

      expect(result.rows).toBeDefined();
      expect(result.rows.length).toBe(1);
    });
  });
});
