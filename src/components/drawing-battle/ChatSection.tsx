import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../ui';
import { applyThemeShadow } from '../../utils/styleUtils';
import { PlayerListPosition } from '../../store/layoutStore';

// Mock chat messages for placeholder
const mockMessages = [
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
  messages = mockMessages,
}) => {
  const { theme, typography, spacing, borderRadius } = useTheme();

  const renderMessageItem = ({ item }: { item: typeof messages[0] }) => (
    <View
      style={[
        styles.messageItem,
        {
          backgroundColor: item.isSystem ? theme.backgroundAlt : 'transparent',
        }
      ]}
    >
      {!item.isSystem && (
        <Text
          variant="body"
          size={typography.fontSizes.xs}
          color={theme.primary}
          bold
          style={styles.messageSender}
        >
          {item.sender}
        </Text>
      )}

      <Text
        variant="body"
        size={typography.fontSizes.sm}
        color={item.isSystem ? theme.textSecondary : theme.text}
        style={styles.messageText}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        position === 'right' ? styles.leftPosition : styles.rightPosition,
        {
          backgroundColor: theme.surface,
          borderRadius: borderRadius.md,
          borderColor: theme.border,
          ...applyThemeShadow('sm')
        }
      ]}
    >
      <View style={[styles.header, { borderBottomColor: theme.divider }]}>
        <Text
          variant="subtitle"
          size={typography.fontSizes.sm}
          color={theme.textSecondary}
        >
          CHAT
        </Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xs }}
        inverted
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%', // Use full width of parent container
    height: '100%', // Use full height of parent container
    borderWidth: 1,
    overflow: 'hidden',
  },
  leftPosition: {
    marginRight: 0, // Removed margin to align perfectly with the right edge
  },
  rightPosition: {
    marginLeft: 8,
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  messageItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  messageSender: {
    marginBottom: 2,
  },
  messageText: {
    flexWrap: 'wrap',
  },
});

export default ChatSection;
