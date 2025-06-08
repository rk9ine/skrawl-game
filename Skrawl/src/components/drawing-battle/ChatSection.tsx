import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../ui';
import { applyThemeShadow } from '../../utils/styleUtils';
import { PlayerListPosition } from '../../store/layoutStore';
import { useGameStore } from '../../store/gameStore';
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
  const { chatMessages } = useGameStore();
  const flatListRef = useRef<FlatList>(null);

  // Transform chat messages from game store to component format with validation
  const transformedMessages = chatMessages
    .filter(msg => msg && msg.message && msg.playerName) // Filter out invalid messages
    .map((msg, index) => ({
      // Use message ID if available, otherwise create a unique key
      id: msg.id || `${msg.playerId || 'unknown'}_${msg.timestamp || Date.now()}_${index}`,
      sender: msg.playerName || 'Unknown',
      text: msg.message || '',
      isSystem: msg.type === 'system',
      timestamp: msg.timestamp || Date.now(),
      isCorrectGuess: msg.isCorrectGuess || false,
      isOwnMessage: false, // TODO: Determine if message is from current user
    }))
    .sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp (oldest first)

  // Industry standard: No placeholder messages - clean slate for each session
  // Messages are in chronological order (oldest to newest)
  const displayMessages = transformedMessages;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (displayMessages.length > 0 && flatListRef.current) {
      // Small delay to ensure the FlatList has rendered the new item
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [displayMessages.length]);

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
        ref={flatListRef}
        data={displayMessages}
        renderItem={({ item, index }) => renderMessageItem({ item, index })}
        keyExtractor={(item, index) => item.id || `fallback_${index}_${Date.now()}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: spacing.xs,
          flexGrow: 1,
          justifyContent: displayMessages.length === 0 ? 'center' : 'flex-end'
        }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        onContentSizeChange={() => {
          // Auto-scroll to bottom when content size changes (new messages)
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
        onLayout={() => {
          // Auto-scroll to bottom when component first renders
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />
    </View>
  );
};

export default ChatSection;
