import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { ChatInputPosition } from '../../store/layoutStore';
import { Text } from '../ui/Text';

interface MessageInputProps {
  /**
   * Position of the message input
   */
  position: ChatInputPosition;

  /**
   * Current message being typed
   */
  message: string;

  /**
   * Callback when a message is sent
   */
  onSendMessage?: (message: string) => void;

  /**
   * Callback to show virtual keyboard
   */
  onShowKeyboard?: () => void;
}

/**
 * Component for displaying current message and send button (skribbl.io style)
 */
const MessageInput: React.FC<MessageInputProps> = ({
  position,
  message,
  onSendMessage,
  onShowKeyboard,
}) => {
  const { theme, spacing, borderRadius, typography } = useTheme();

  // Create styles with theme values - skribbl.io inspired (minimal spacing)
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: 0, // No horizontal padding
      paddingVertical: 0, // No vertical padding
      borderWidth: 1,
      marginVertical: 0, // No vertical margin
      overflow: 'hidden', // Ensures content doesn't overflow
    },
    topPosition: {
      marginTop: 0, // No margin at top when positioned at top
    },
    bottomPosition: {
      marginBottom: 0, // No margin at bottom when positioned at bottom
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xxs, // Minimal horizontal padding
      paddingVertical: spacing.xxs / 2, // Minimal vertical padding
    },
    messageDisplay: {
      flex: 1,
      height: spacing.md + spacing.xxs, // Consistent height
      justifyContent: 'center',
      paddingHorizontal: spacing.xs,
      minHeight: 32,
    },
    messageText: {
      fontSize: typography.fontSizes.sm,
    },
    placeholderText: {
      fontSize: typography.fontSizes.sm,
    },
    sendButton: {
      width: spacing.md + spacing.xxs, // Reduced size
      height: spacing.md + spacing.xxs, // Reduced size
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.xxs, // Minimal margin
    },
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage?.(message.trim());
    }
  };

  const handleMessageDisplayPress = () => {
    onShowKeyboard?.();
  };

  return (
    <View
      style={[
        styles.container,
        position === 'top' ? styles.topPosition : styles.bottomPosition,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderRadius: 0, // No border radius for edge-to-edge design
          // No shadow for skribbl.io-like flat design
        }
      ]}
    >
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundAlt,
            borderRadius: borderRadius.xs, // Minimal border radius
          }
        ]}
      >
        <TouchableOpacity
          style={styles.messageDisplay}
          onPress={handleMessageDisplayPress}
          activeOpacity={0.7}
        >
          {message ? (
            <Text
              variant="body"
              size={typography.fontSizes.sm}
              color={theme.text}
              style={styles.messageText}
            >
              {message}
            </Text>
          ) : (
            <Text
              variant="body"
              size={typography.fontSizes.sm}
              color={theme.textDisabled}
              style={styles.placeholderText}
            >
              Type a message...
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: message.trim() ? theme.primary : theme.textDisabled,
              borderRadius: borderRadius.round,
            }
          ]}
          onPress={handleSendMessage}
          disabled={!message.trim()}
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MessageInput;
