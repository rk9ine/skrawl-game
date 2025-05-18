import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { applyThemeShadow } from '../../utils/styleUtils';
import { ChatInputPosition } from '../../store/layoutStore';

interface MessageInputProps {
  /**
   * Position of the message input
   */
  position: ChatInputPosition;

  /**
   * Callback when a message is sent
   */
  onSendMessage?: (message: string) => void;
}

/**
 * Component for inputting and sending chat messages
 */
const MessageInput: React.FC<MessageInputProps> = ({
  position,
  onSendMessage,
}) => {
  const { theme, spacing, borderRadius, typography } = useTheme();
  const [message, setMessage] = useState('');

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
      paddingVertical: Platform.OS === 'ios' ? spacing.xxs / 2 : 0, // Minimal vertical padding
    },
    input: {
      flex: 1,
      height: Platform.OS === 'ios' ? spacing.md + spacing.xxs : spacing.md + spacing.xxs, // Reduced height
      paddingVertical: 0,
      fontSize: typography.fontSizes.sm, // Using theme typography
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
      setMessage('');
    }
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
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Type a message..."
          placeholderTextColor={theme.textDisabled}
          value={message}
          onChangeText={setMessage}
          returnKeyType="send"
          onSubmitEditing={handleSendMessage}
        />

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
