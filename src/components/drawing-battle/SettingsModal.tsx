import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Switch,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../ui';
import { useLayoutStore, PlayerListPosition, ChatInputPosition } from '../../store/layoutStore';
import { applyThemeShadow } from '../../utils/styleUtils';

interface SettingsModalProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;

  /**
   * Callback when the modal is closed
   */
  onClose: () => void;

  /**
   * Callback when the exit button is pressed
   */
  onExit: () => void;
}

/**
 * Modal for game settings and layout customization
 */
const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onExit,
}) => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const {
    chatInputPosition,
    setChatInputPosition,
    resetLayoutPreferences
  } = useLayoutStore();

  const handleChatInputPositionChange = (position: ChatInputPosition) => {
    setChatInputPosition(position);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: theme.surface,
                  borderRadius: borderRadius.lg,
                  ...applyThemeShadow('lg')
                }
              ]}
            >
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: theme.divider }]}>
                <Text
                  variant="heading"
                  size={typography.fontSizes.xl}
                  color={theme.text}
                >
                  Settings
                </Text>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView style={styles.content}>
                {/* Layout Settings Section */}
                <View style={styles.section}>
                  <Text
                    variant="subtitle"
                    size={typography.fontSizes.md}
                    color={theme.text}
                    style={{ marginBottom: spacing.sm }}
                  >
                    Layout Settings
                  </Text>



                  {/* Chat Input Position */}
                  <View style={styles.settingItem}>
                    <Text
                      variant="body"
                      color={theme.text}
                    >
                      Chat Input Position
                    </Text>

                    <View style={styles.optionsContainer}>
                      <TouchableOpacity
                        style={[
                          styles.optionButton,
                          chatInputPosition === 'top' && {
                            backgroundColor: theme.primary + '20',
                            borderColor: theme.primary,
                          }
                        ]}
                        onPress={() => handleChatInputPositionChange('top')}
                      >
                        <Text
                          variant="body"
                          size={typography.fontSizes.sm}
                          color={chatInputPosition === 'top' ? theme.primary : theme.text}
                        >
                          Top
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.optionButton,
                          chatInputPosition === 'bottom' && {
                            backgroundColor: theme.primary + '20',
                            borderColor: theme.primary,
                          }
                        ]}
                        onPress={() => handleChatInputPositionChange('bottom')}
                      >
                        <Text
                          variant="body"
                          size={typography.fontSizes.sm}
                          color={chatInputPosition === 'bottom' ? theme.primary : theme.text}
                        >
                          Bottom
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Reset Layout */}
                  <TouchableOpacity
                    style={[
                      styles.resetButton,
                      {
                        backgroundColor: theme.backgroundAlt,
                        borderColor: theme.border,
                      }
                    ]}
                    onPress={resetLayoutPreferences}
                  >
                    <Ionicons name="refresh" size={16} color={theme.textSecondary} />
                    <Text
                      variant="body"
                      size={typography.fontSizes.sm}
                      color={theme.textSecondary}
                      style={{ marginLeft: 8 }}
                    >
                      Reset to Default Layout
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* Footer */}
              <View style={[styles.footer, { borderTopColor: theme.divider }]}>
                <TouchableOpacity
                  style={[
                    styles.exitButton,
                    {
                      backgroundColor: theme.error,
                    }
                  ]}
                  onPress={onExit}
                >
                  <Ionicons name="exit-outline" size={20} color="#FFFFFF" />
                  <Text
                    variant="body"
                    bold
                    color="#FFFFFF"
                    style={{ marginLeft: 8 }}
                  >
                    Exit Game
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  settingItem: {
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  optionButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
});

export default SettingsModal;
