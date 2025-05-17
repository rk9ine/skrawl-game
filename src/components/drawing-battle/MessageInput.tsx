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
  const { theme, spacing, borderRadius } = useTheme();
  const [message, setMessage] = useState('');

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
          borderRadius: borderRadius.md,
          ...applyThemeShadow('sm')
        }
      ]}
    >
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundAlt,
            borderRadius: borderRadius.md,
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

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 12, // Reduced horizontal padding
    paddingVertical: 6, // Reduced vertical padding
    borderWidth: 1,
    marginVertical: 6, // Add margin to create space between components
    overflow: 'hidden', // Ensures content doesn't overflow rounded corners
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
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 6 : 3, // Reduced padding
  },
  input: {
    flex: 1,
    height: Platform.OS === 'ios' ? 32 : 36, // Reduced height
    paddingVertical: 0,
    fontSize: 14,
  },
  sendButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default MessageInput;
