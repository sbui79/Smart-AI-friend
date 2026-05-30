import { LocalAIModule } from '../LocalAIModule';
import { CreatureEngine } from '../../engine/CreatureEngine';
import { Creature } from '../../engine/types';

describe('LocalAIModule', () => {
  describe('module metadata', () => {
    it('should have correct configuration', () => {
      expect(LocalAIModule.id).toBe('local-ai');
      expect(LocalAIModule.requiredTier).toBe('free');
      expect(LocalAIModule.parentalControl).toBe(true);
    });
  });

  describe('generateResponse', () => {
    it('should generate greeting when creature is happy', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      // Default creature is happy with full stats

      const response = LocalAIModule.actions!.generateResponse(creature, 'greeting');

      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
      expect(response.text.length).toBeGreaterThan(0);
    });

    it('should generate hungry response when hunger is low', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const hungryCreature = CreatureEngine.updateStats(creature, {
        'physical.hunger': 15,
      });

      const response = LocalAIModule.actions!.generateResponse(hungryCreature, 'status');

      expect(response.text.toLowerCase()).toContain('hungry');
    });

    it('should generate tired response when energy is low', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const tiredCreature = CreatureEngine.updateStats(creature, {
        'physical.energy': 15,
      });

      const response = LocalAIModule.actions!.generateResponse(tiredCreature, 'status');

      expect(response.text.toLowerCase()).toContain('tired');
    });

    it('should include quick reply options', () => {
      const creature = CreatureEngine.createCreature('TestPet');

      const response = LocalAIModule.actions!.generateResponse(creature, 'greeting');

      expect(response.quickReplies).toBeDefined();
      expect(response.quickReplies.length).toBeGreaterThan(0);
      expect(response.quickReplies.length).toBeLessThanOrEqual(4);
    });
  });

  describe('getContextualQuickReplies', () => {
    it('should suggest feed when hungry', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const hungryCreature = CreatureEngine.updateStats(creature, {
        'physical.hunger': 20,
      });

      const replies = LocalAIModule.actions!.getContextualQuickReplies(hungryCreature);

      const feedReply = replies.find(r => r.action === 'feed');
      expect(feedReply).toBeDefined();
    });

    it('should suggest clean when dirty', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const dirtyCreature = CreatureEngine.updateStats(creature, {
        'physical.cleanliness': 20,
      });

      const replies = LocalAIModule.actions!.getContextualQuickReplies(dirtyCreature);

      const cleanReply = replies.find(r => r.action === 'clean');
      expect(cleanReply).toBeDefined();
    });

    it('should limit to 4 quick replies', () => {
      const creature = CreatureEngine.createCreature('TestPet');

      const replies = LocalAIModule.actions!.getContextualQuickReplies(creature);

      expect(replies.length).toBeLessThanOrEqual(4);
    });
  });

  describe('lifecycle hooks', () => {
    it('should not throw when calling lifecycle hooks', () => {
      expect(() => LocalAIModule.onLoad()).not.toThrow();
      expect(() => LocalAIModule.onUnload()).not.toThrow();
    });
  });
});
