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
    useSystemKeyboard,
    setUseSystemKeyboard,
    resetLayoutPreferences
  } = useLayoutStore();

  // Create styles with theme values
  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg, // Using theme spacing.lg (24) instead of hardcoded value
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
      padding: spacing.md, // Using theme spacing.md (16) instead of hardcoded value
      borderBottomWidth: 1,
    },
    closeButton: {
      width: spacing.md * 2.5, // Using theme spacing.md (16) * 2.5 = 40 instead of hardcoded value
      height: spacing.md * 2.5, // Using theme spacing.md (16) * 2.5 = 40 instead of hardcoded value
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: spacing.md, // Using theme spacing.md (16) instead of hardcoded value
    },
    section: {
      marginBottom: spacing.lg, // Using theme spacing.lg (24) instead of hardcoded value
    },
    settingItem: {
      marginBottom: spacing.md, // Using theme spacing.md (16) instead of hardcoded value
    },
    optionsContainer: {
      flexDirection: 'row',
      marginTop: spacing.xs, // Using theme spacing.xs (8) instead of hardcoded value
    },
    optionButton: {
      flex: 1,
      height: spacing.md * 2.5, // Using theme spacing.md (16) * 2.5 = 40 instead of hardcoded value
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border, // Using theme color instead of hardcoded '#DDDDDD'
      marginHorizontal: spacing.xxs, // Using theme spacing.xxs (4) instead of hardcoded value
      borderRadius: borderRadius.md, // Using theme borderRadius.md (8) instead of hardcoded value
    },
    resetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm, // Using theme spacing.sm (12) instead of hardcoded value
      borderWidth: 1,
      borderRadius: borderRadius.md, // Using theme borderRadius.md (8) instead of hardcoded value
      marginTop: spacing.xs, // Using theme spacing.xs (8) instead of hardcoded value
    },
    footer: {
      padding: spacing.md, // Using theme spacing.md (16) instead of hardcoded value
      borderTopWidth: 1,
    },
    exitButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm, // Using theme spacing.sm (12) instead of hardcoded value
      borderRadius: borderRadius.md, // Using theme borderRadius.md (8) instead of hardcoded value
    },
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    toggleDescription: {
      flex: 1,
      marginRight: spacing.sm,
    },
  });

  const handleChatInputPositionChange = (position: ChatInputPosition) => {
    setChatInputPosition(position);
  };

  const handleSystemKeyboardToggle = (value: boolean) => {
    setUseSystemKeyboard(value);
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



                  {/* Virtual Keyboard Toggle */}
                  <View style={styles.settingItem}>
                    <Text
                      variant="body"
                      color={theme.text}
                    >
                      Keyboard Type
                    </Text>

                    <View style={styles.toggleContainer}>
                      <View style={styles.toggleDescription}>
                        <Text
                          variant="body"
                          size={typography.fontSizes.sm}
                          color={theme.textSecondary}
                        >
                          {useSystemKeyboard
                            ? 'System keyboard (native)'
                            : 'Virtual keyboard'
                          }
                        </Text>
                      </View>
                      <Switch
                        value={useSystemKeyboard}
                        onValueChange={handleSystemKeyboardToggle}
                        trackColor={{
                          false: theme.backgroundAlt,
                          true: theme.primary + '40'
                        }}
                        thumbColor={useSystemKeyboard ? theme.primary : theme.textDisabled}
                        ios_backgroundColor={theme.backgroundAlt}
                      />
                    </View>
                  </View>

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

export default SettingsModal;
