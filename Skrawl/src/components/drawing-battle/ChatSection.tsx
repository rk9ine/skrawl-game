import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../ui';
import { applyThemeShadow } from '../../utils/styleUtils';
import { PlayerListPosition } from '../../store/layoutStore';
// Chat service removed - will be reimplemented with new backend

// No more mock data - ChatSection will only show real messages

interface ChatSectionProps {
  /**
   * Position of the chat section (opposite of player list)
   */
  position: PlayerListPosition;

  /**
   * Whether to use real-time chat service - REQUIRED, no more mock data
   */
  useRealTimeChat: boolean;
}

/**
 * Component that displays the chat messages
 */
const ChatSection: React.FC<ChatSectionProps> = ({
  position,
  useRealTimeChat,
}) => {
  const { theme, typography, spacing, borderRadius } = useTheme();

  // Placeholder chat messages for UI testing (real chat will be reimplemented with new backend)
  const [realTimeMessages, setRealTimeMessages] = useState<any[]>([
    { id: '1', message: 'Welcome to Drawing Battle!', playerName: 'System', timestamp: Date.now() - 60000, isOwnMessage: false },
    { id: '2', message: 'cat', playerName: 'Player1', timestamp: Date.now() - 45000, isOwnMessage: false },
    { id: '3', message: 'dog?', playerName: 'You', timestamp: Date.now() - 30000, isOwnMessage: true },
    { id: '4', message: 'Good guess!', playerName: 'Player2', timestamp: Date.now() - 15000, isOwnMessage: false },
  ]);

  // Transform real-time messages to component format
  const transformedRealTimeMessages = realTimeMessages.map(msg => ({
    id: msg.id,
    sender: msg.displayName,
    text: msg.message,
    isSystem: false, // Real-time messages are from players
    timestamp: msg.timestamp,
    isCorrectGuess: msg.isCorrectGuess,
    isOwnMessage: msg.isOwnMessage,
  }));

  // Only use real-time messages - no more mock data fallback
  const displayMessages = transformedRealTimeMessages;

  // Create styles with theme values - skribbl.io inspired (minimal spacing)
  const styles = StyleSheet.create({
    container: {
      width: '100%', // Use full width of parent container
      height: '100%', // Use full height of parent container
      borderWidth: 1,
      overflow: 'hidden',
      borderRadius: 0, // No border radius for edge-to-edge design
    },
    leftPosition: {
      marginRight: 0, // No margin for edge-to-edge design
    },
    rightPosition: {
      marginLeft: 0, // No margin for edge-to-edge design
    },
    header: {
      paddingHorizontal: spacing.xs, // Consistent padding
      paddingVertical: spacing.xxs, // Reduced vertical padding
      borderBottomWidth: 1,
      alignItems: 'center',
      height: 28, // Fixed height for consistent header size with PlayerList
    },
    messageItem: {
      paddingHorizontal: spacing.xs, // Increased padding
      paddingVertical: spacing.xs / 2, // Increased padding
    },
    messageText: {
      flexWrap: 'wrap',
    },
  });

  const renderMessageItem = ({ item, index }: { item: typeof displayMessages[0], index: number }) => {
    // Alternating background for all messages
    const hasBackground = index % 2 === 0;

    // Special styling for correct guesses and own messages
    const isCorrectGuess = (item as any).isCorrectGuess;
    const isOwnMessage = (item as any).isOwnMessage;

    return (
      <View
        style={[
          styles.messageItem,
          {
            backgroundColor: item.isSystem
              ? theme.backgroundAlt
              : hasBackground
                ? theme.backgroundAlt
                : 'transparent',
          }
        ]}
      >
        {item.isSystem ? (
          // System messages display as before
          <Text
            variant="body"
            size={typography.fontSizes.sm}
            color={theme.textSecondary}
            style={styles.messageText}
          >
            {item.text}
          </Text>
        ) : (
          // Player messages in one line: "Player 2 Hello Everyone"
          <Text
            variant="body"
            size={typography.fontSizes.sm}
            style={styles.messageText}
          >
            <Text
              variant="body"
              size={typography.fontSizes.sm}
              color={isCorrectGuess ? theme.success : theme.primary}
              bold
            >
              {item.sender}
            </Text>
            <Text
              variant="body"
              size={typography.fontSizes.sm}
              color={isCorrectGuess ? theme.success : theme.text}
              style={isCorrectGuess ? { fontWeight: 'bold' } : undefined}
            >
              {isCorrectGuess ? ' guessed correctly!' : ` ${item.text}`}
            </Text>
            {isOwnMessage && (
              <Text
                variant="body"
                size={typography.fontSizes.xs}
                color={theme.textSecondary}
              >
                {' (you)'}
              </Text>
            )}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        position === 'right' ? styles.leftPosition : styles.rightPosition,
        {
          backgroundColor: theme.surface,
          borderRadius: 0, // No border radius for edge-to-edge design
          borderColor: theme.border,
          // No shadow for skribbl.io-like flat design
        }
      ]}
    >
      <View style={[styles.header, { borderBottomColor: theme.divider }]}>
        <Text
          variant="heading" // Uses Patrick Hand font
          size={typography.fontSizes.md} // Consistent font size with PlayerList
          color={theme.textSecondary}
        >
          CHAT
        </Text>
      </View>

      <FlatList
        data={displayMessages}
        renderItem={({ item, index }) => renderMessageItem({ item, index })}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xs }}
        inverted
      />
    </View>
  );
};

export default ChatSection;
