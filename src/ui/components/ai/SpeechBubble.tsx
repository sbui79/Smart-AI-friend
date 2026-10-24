import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AIResponse } from '../../../core/modules/LocalAIModule';
import { theme } from '../../theme';

interface SpeechBubbleProps {
  response: AIResponse;
  onQuickReply: (action: string) => void;
}

/**
 * SpeechBubble Component
 * What the creature says, plus suggested replies based on its needs
 */
export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ response, onQuickReply }) => {
  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{response.text}</Text>
      </View>
      {response.quickReplies.length > 0 && (
        <View style={styles.replies}>
          {response.quickReplies.map(reply => (
            <TouchableOpacity
              key={reply.action}
              style={styles.reply}
              onPress={() => onQuickReply(reply.action)}
              accessibilityRole="button"
            >
              <Text style={styles.replyText}>{reply.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  bubble: {
    alignSelf: 'flex-start',
    maxWidth: '90%',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.xl,
    borderTopLeftRadius: theme.borderRadius.sm,
  },
  text: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.base,
  },
  replies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  reply: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  replyText: {
    color: theme.colors.primaryDark,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default SpeechBubble;
