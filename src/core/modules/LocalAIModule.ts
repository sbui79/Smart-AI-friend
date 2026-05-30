import { ModuleDefinition } from './types';
import { Creature } from '../engine/types';
import { CreatureEngine } from '../engine/CreatureEngine';

/**
 * AI Response structure
 */
export interface AIResponse {
  text: string;
  quickReplies: QuickReply[];
}

export interface QuickReply {
  label: string;
  action: string;
}

/**
 * Local AI Module - Provides template-based AI responses
 * Simple local-only AI for Phase 1 (cloud AI comes in Phase 3)
 */
export const LocalAIModule: ModuleDefinition = {
  id: 'local-ai',
  version: '1.0.0',
  requiredTier: 'free',
  requiredAgeGroup: ['5-10', '10-15', '15+'],
  parentalControl: true, // Parents can disable AI chat
  requires: [],
  enhances: [],

  onLoad: () => {
    // Module loaded
  },

  onUnload: () => {
    // Module unloaded
  },

  actions: {
    /**
     * Generate a response based on creature state and context
     */
    generateResponse: (creature: Creature, context: string): AIResponse => {
      let text = '';

      // Generate response based on context and creature state
      if (context === 'greeting') {
        text = generateGreeting(creature);
      } else if (context === 'status') {
        text = generateStatusResponse(creature);
      } else if (context === 'afterAction') {
        text = generateAfterActionResponse(creature);
      } else {
        text = generateDefaultResponse(creature);
      }

      // Get contextual quick replies
      const quickReplies = LocalAIModule.actions!.getContextualQuickReplies(creature);

      return { text, quickReplies };
    },

    /**
     * Get contextual quick reply options based on creature needs
     */
    getContextualQuickReplies: (creature: Creature): QuickReply[] => {
      const replies: QuickReply[] = [];

      // Check critical needs first
      if (creature.physical.hunger < 30) {
        replies.push({ label: 'Feed me!', action: 'feed' });
      }
      if (creature.physical.cleanliness < 30) {
        replies.push({ label: 'Clean me', action: 'clean' });
      }
      if (creature.mental.happiness < 50) {
        replies.push({ label: 'Play with me', action: 'play' });
      }
      if (creature.physical.energy > 60 && replies.length < 3) {
        replies.push({ label: 'Train', action: 'train' });
      }

      // Always include pet as a fallback
      if (replies.length < 4) {
        replies.push({ label: 'Pet', action: 'pet' });
      }

      // Always include gift option if room
      if (replies.length < 4) {
        replies.push({ label: 'Give gift', action: 'gift' });
      }

      // Limit to 4 replies
      return replies.slice(0, 4);
    },
  },
};

/**
 * Generate greeting based on creature mood
 */
function generateGreeting(creature: Creature): string {
  const greetings = {
    happy: [
      "Hi! I'm so happy to see you!",
      "Hello! I've been waiting for you!",
      "Hey there! Ready to have fun?",
    ],
    excited: [
      "WOW! You're here! This is amazing!",
      "I'm SO excited to see you!",
      "YES! Let's do something fun!",
    ],
    sad: [
      "Oh... hi. I'm not feeling great.",
      "You're here... that's nice.",
      "Hi. I've been feeling down.",
    ],
    tired: [
      "Hi... *yawn* ... I'm pretty tired.",
      "Hey there... sorry, I'm exhausted.",
      "Hello... I could use some rest.",
    ],
    sick: [
      "I'm not feeling well...",
      "Hi... I feel sick.",
      "I don't feel good...",
    ],
    neutral: [
      "Hi there!",
      "Hello!",
      "Hey!",
    ],
  };

  const moodGreetings = greetings[creature.mood];
  return moodGreetings[Math.floor(Math.random() * moodGreetings.length)];
}

/**
 * Generate status response based on critical needs
 */
function generateStatusResponse(creature: Creature): string {
  if (CreatureEngine.isCritical(creature)) {
    if (creature.physical.hunger < 20) {
      return "I'm really hungry! Can you feed me?";
    }
    if (creature.physical.energy < 20) {
      return "I'm so tired... I need to rest.";
    }
    if (creature.physical.cleanliness < 20) {
      return "I'm so dirty... can you clean me?";
    }
    if (creature.mental.happiness < 20) {
      return "I'm feeling sad... can we do something fun?";
    }
  }

  if (CreatureEngine.isHealthy(creature)) {
    return "I'm doing great! What should we do?";
  }

  return "I'm okay. How are you?";
}

/**
 * Generate response after an action
 */
function generateAfterActionResponse(creature: Creature): string {
  const responses = {
    happy: ["That was fun!", "Thanks!", "I love spending time with you!"],
    excited: ["WOW! That was amazing!", "MORE! Let's do it again!", "This is the best!"],
    sad: ["Thanks... I guess.", "That helped a little.", "I appreciate it."],
    tired: ["Thanks... *yawn*", "That was nice... but I'm sleepy.", "I'm exhausted."],
    sick: ["Thanks for trying... I still don't feel well.", "I appreciate it.", "That didn't help much."],
    neutral: ["Thanks!", "That was nice.", "I appreciate it."],
  };

  const moodResponses = responses[creature.mood];
  return moodResponses[Math.floor(Math.random() * moodResponses.length)];
}

/**
 * Generate default response
 */
function generateDefaultResponse(creature: Creature): string {
  return "I'm here! What would you like to do?";
}
