import { Creature } from '../../core/engine/types';
import { Database } from './Database';

export class CreatureRepository {
  /**
   * Save or update a creature
   */
  static async save(creature: Creature): Promise<void> {
    const db = Database.getConnection();
    const data = JSON.stringify(creature);
    const updatedAt = Date.now();

    await db.runAsync(
      `INSERT INTO creatures (id, data, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET data = ?, updated_at = ?`,
      [creature.id, data, updatedAt, data, updatedAt]
    );
  }

  /**
   * Find creature by ID
   */
  static async findById(id: string): Promise<Creature | null> {
    const db = Database.getConnection();
    const result = await db.getFirstAsync<{ id: string; data: string }>(
      'SELECT id, data FROM creatures WHERE id = ?',
      [id]
    );

    if (!result) {
      return null;
    }

    return this.deserializeCreature(result.data);
  }

  /**
   * Get all creatures
   */
  static async getAll(): Promise<Creature[]> {
    const db = Database.getConnection();
    const results = await db.getAllAsync<{ id: string; data: string }>(
      'SELECT id, data FROM creatures ORDER BY updated_at DESC'
    );

    return results.map(row => this.deserializeCreature(row.data));
  }

  /**
   * Delete creature by ID
   */
  static async delete(id: string): Promise<void> {
    const db = Database.getConnection();
    await db.runAsync('DELETE FROM creatures WHERE id = ?', [id]);
  }

  /**
   * Deserialize creature data from JSON, restoring Date objects
   */
  private static deserializeCreature(json: string): Creature {
    const data = JSON.parse(json);

    // Restore Date objects
    return {
      ...data,
      lastInteractionDate: new Date(data.lastInteractionDate),
      stageStartDate: new Date(data.stageStartDate),
      careHistory: data.careHistory.map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp),
      })),
    };
  }
}
