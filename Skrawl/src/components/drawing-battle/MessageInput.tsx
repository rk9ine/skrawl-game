import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Keyboard } from 'react-native';
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

export interface MessageInputRef {
  focus: () => void;
  blur: () => void;
}

/**
 * Component for displaying current message and send button (skribbl.io style)
 */
const MessageInput = forwardRef<MessageInputRef, MessageInputProps>(({
  position,
  message,
  isRateLimited = false,
  useRealTimeChat = false,
  onSendMessage,
  onShowKeyboard,
  onMessageChange,
  onMessageClear,
}, ref) => {
  const { theme, spacing, borderRadius, typography } = useTheme();
  const { useSystemKeyboard } = useLayoutStore();
  const textInputRef = useRef<TextInput>(null);

  // Real-time chat state
  const [realTimeRateLimited, setRealTimeRateLimited] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | undefined>();

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (useSystemKeyboard && textInputRef.current) {
        textInputRef.current.focus();
      } else {
        onShowKeyboard?.();
      }
    },
    blur: () => {
      if (useSystemKeyboard && textInputRef.current) {
        textInputRef.current.blur();
      }
    },
  }), [useSystemKeyboard, onShowKeyboard]);

  // Set up real-time rate limit listeners
  useEffect(() => {
    if (!useRealTimeChat) return;

    // TODO: Implement real-time rate limiting with WebSocket service
    // For now, use the passed isRateLimited prop
    setRealTimeRateLimited(false);
    setRateLimitRemaining(undefined);

    // No cleanup needed since we're not setting up any listeners yet
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
      // TODO: Send via WebSocket service when Phase 2 chat is implemented
      console.log('💬 Real-time chat message:', trimmedMessage);
      // For now, use legacy callback
      onSendMessage?.(trimmedMessage);
      onMessageClear?.();
    } else {
      // Use legacy callback
      onSendMessage?.(trimmedMessage);
    }

    // Dismiss keyboard after sending message
    if (useSystemKeyboard && textInputRef.current) {
      textInputRef.current.blur();
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
            ref={textInputRef}
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
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;
