import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../ui';
import { applyThemeShadow } from '../../utils/styleUtils';
import { PlayerListPosition } from '../../store/layoutStore';

// Placeholder chat messages - will be replaced with real-time chat
const placeholderMessages = [
  { id: '1', sender: 'System', text: 'Game started', isSystem: true, timestamp: new Date().toISOString() },
  { id: '2', sender: 'Player 1', text: 'Hello everyone!', isSystem: false, timestamp: new Date().toISOString() },
  { id: '3', sender: 'Player 2', text: 'Hi there!', isSystem: false, timestamp: new Date().toISOString() },
  { id: '4', sender: 'System', text: 'Player 1 is drawing now', isSystem: true, timestamp: new Date().toISOString() },
  { id: '5', sender: 'Player 3', text: 'Good luck!', isSystem: false, timestamp: new Date().toISOString() },
  { id: '6', sender: 'Player 4', text: 'Is it a car?', isSystem: false, timestamp: new Date().toISOString() },
];

interface ChatSectionProps {
  /**
   * Position of the chat section (opposite of player list)
   */
  position: PlayerListPosition;

  /**
   * Messages to display
   * If not provided, uses mock data
   */
  messages?: Array<{
    id: string;
    sender: string;
    text: string;
    isSystem: boolean;
    timestamp: string;
  }>;
}

/**
 * Component that displays the chat messages
 */
const ChatSection: React.FC<ChatSectionProps> = ({
  position,
  messages = placeholderMessages,
}) => {
  const { theme, typography, spacing, borderRadius } = useTheme();

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

  const renderMessageItem = ({ item, index }: { item: typeof messages[0], index: number }) => {
    // Alternating background for player messages: Player 1 & 3 have background, Player 2 & 4 don't
    // Extract player number from sender name (e.g., "Player 1" -> 1)
    const playerNumber = item.sender.match(/Player (\d+)/)?.[1];
    const hasBackground = playerNumber ? parseInt(playerNumber) % 2 === 1 : false;

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
              color={theme.primary}
              bold
            >
              {item.sender}
            </Text>
            <Text
              variant="body"
              size={typography.fontSizes.sm}
              color={theme.text}
            >
              {' '}{item.text}
            </Text>
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
        data={messages}
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
