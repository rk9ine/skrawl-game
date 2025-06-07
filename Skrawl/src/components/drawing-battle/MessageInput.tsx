import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { ChatInputPosition, useLayoutStore } from '../../store/layoutStore';
import { Text } from '../ui/Text';
// Chat service removed - will be reimplemented with new backend

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
   * Whether rate limiting is active
   */
  isRateLimited?: boolean;

  /**
   * Whether to use real-time chat service
   * If true, messages will be sent via chat service
   */
  useRealTimeChat?: boolean;

  /**
   * Callback when a message is sent (for non-real-time mode)
   */
  onSendMessage?: (message: string) => void;

  /**
   * Callback to show virtual keyboard
   */
  onShowKeyboard?: () => void;

  /**
   * Callback when message changes (for system keyboard)
   */
  onMessageChange?: (message: string) => void;

  /**
   * Callback when message is cleared (for real-time mode)
   */
  onMessageClear?: () => void;
}

/**
 * Component for displaying current message and send button (skribbl.io style)
 */
const MessageInput: React.FC<MessageInputProps> = ({
  position,
  message,
  isRateLimited = false,
  useRealTimeChat = false,
  onSendMessage,
  onShowKeyboard,
  onMessageChange,
  onMessageClear,
}) => {
  const { theme, spacing, borderRadius, typography } = useTheme();
  const { useSystemKeyboard } = useLayoutStore();

  // Real-time chat state
  const [realTimeRateLimited, setRealTimeRateLimited] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | undefined>();

  // Set up real-time rate limit listeners
  useEffect(() => {
    if (!useRealTimeChat) return;

    const unsubscribeRateLimit = chatService.onRateLimitChange((isLimited, remainingTime) => {
      setRealTimeRateLimited(isLimited);
      setRateLimitRemaining(remainingTime);
    });

    // Check initial rate limit status
    const { isLimited, remainingTime } = chatService.getRateLimitStatus();
    setRealTimeRateLimited(isLimited);
    setRateLimitRemaining(remainingTime);

    return () => {
      unsubscribeRateLimit();
    };
  }, [useRealTimeChat]);

  // Determine effective rate limit status
  const effectiveRateLimited = useRealTimeChat ? realTimeRateLimited : isRateLimited;

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
      height: spacing.md + spacing.xxs, // Fixed height
      maxHeight: spacing.md + spacing.xxs, // Prevent expansion
      justifyContent: 'center',
      paddingHorizontal: spacing.xs,
      minHeight: 32,
      overflow: 'hidden', // Prevent content overflow
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

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    if (useRealTimeChat) {
      // Send via real-time chat service
      const success = await chatService.sendMessage(trimmedMessage, true);
      if (success) {
        // Clear message on successful send
        onMessageClear?.();
      }
    } else {
      // Use legacy callback
      onSendMessage?.(trimmedMessage);
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
        {useSystemKeyboard ? (
          // System keyboard mode - show TextInput
          <TextInput
            style={[styles.messageDisplay, {
              color: theme.text,
              fontSize: typography.fontSizes.sm,
              paddingHorizontal: spacing.xs,
              paddingVertical: 0, // Remove vertical padding to prevent expansion
              textAlignVertical: 'center', // Android fix
              includeFontPadding: false, // Android: remove extra font padding
              textAlign: 'left', // Ensure consistent text alignment
            }]}
            placeholder="Type a message..."
            placeholderTextColor={theme.textDisabled}
            value={message}
            onChangeText={onMessageChange}
            returnKeyType="send"
            onSubmitEditing={() => handleSendMessage()}
            multiline={false}
            scrollEnabled={false}
            editable={true}
            autoCorrect={true}
            autoCapitalize="sentences"
            maxLength={50}
            numberOfLines={1}
            blurOnSubmit={true}
            disableFullscreenUI={true} // Android: prevent fullscreen mode
          />
        ) : (
          // Virtual keyboard mode - show display area
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
        )}

        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: effectiveRateLimited
                ? theme.error
                : message.trim()
                  ? theme.primary
                  : theme.textDisabled,
              borderRadius: borderRadius.round,
            }
          ]}
          onPress={handleSendMessage}
          disabled={!message.trim() || effectiveRateLimited}
        >
          <Ionicons
            name={effectiveRateLimited ? "time-outline" : "send"}
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MessageInput;
