import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  ScrollView,
  TextInput,
  Alert,
  Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../ui';
import { applyThemeShadow } from '../../utils/styleUtils';

interface PrivateModeOverlayProps {
  /**
   * Whether the overlay is visible
   */
  visible: boolean;

  /**
   * Callback when the overlay should be dismissed
   */
  onDismiss: () => void;

  /**
   * Callback when game is started
   */
  onStartGame: (config: GameConfig) => void;
}

interface GameConfig {
  roomCode: string;
  playerLimit: number;
  gameDuration: number;
  customWords: string[];
}

/**
 * Animated overlay panel for Private Mode game configuration
 */
const PrivateModeOverlay: React.FC<PrivateModeOverlayProps> = ({
  visible,
  onDismiss,
  onStartGame,
}) => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();

  // Animation values - start from above the safe area
  const [slideAnim] = useState(new Animated.Value(-100 - insets.top));
  const [backdropAnim] = useState(new Animated.Value(0));

  // Game configuration state
  const [roomCode, setRoomCode] = useState('');
  const [playerLimit, setPlayerLimit] = useState(4);
  const [gameDuration, setGameDuration] = useState(60);
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState('');

  // Generate room code on mount
  useEffect(() => {
    if (!roomCode) {
      generateRoomCode();
    }
  }, []);

  // Handle animation
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100 - insets.top,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
  };

  const copyRoomCode = async () => {
    try {
      await Clipboard.setString(roomCode);
      Alert.alert('Copied!', 'Room code copied to clipboard');
    } catch (error) {
      console.error('Failed to copy room code:', error);
    }
  };

  const addCustomWord = () => {
    if (newWord.trim() && !customWords.includes(newWord.trim())) {
      setCustomWords([...customWords, newWord.trim()]);
      setNewWord('');
    }
  };

  const removeCustomWord = (word: string) => {
    setCustomWords(customWords.filter(w => w !== word));
  };

  const handleStartGame = () => {
    const config: GameConfig = {
      roomCode,
      playerLimit,
      gameDuration,
      customWords,
    };
    onStartGame(config);
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onDismiss}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: theme.overlay,
              opacity: backdropAnim,
            }
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Overlay Panel */}
      <Animated.View
        style={[
          styles.overlayPanel,
          {
            backgroundColor: theme.surface,
            borderBottomLeftRadius: borderRadius.lg,
            borderBottomRightRadius: borderRadius.lg,
            ...applyThemeShadow('lg'),
            top: insets.top, // Respect safe area top inset
            transform: [{ translateY: slideAnim }],
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
            Private Game Setup
          </Text>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onDismiss}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Room Code Section */}
          <View style={styles.section}>
            <Text
              variant="subtitle"
              size={typography.fontSizes.lg}
              color={theme.text}
              style={styles.sectionTitle}
            >
              Room Code
            </Text>

            <View style={styles.roomCodeContainer}>
              <View
                style={[
                  styles.roomCodeDisplay,
                  {
                    backgroundColor: theme.backgroundAlt,
                    borderRadius: borderRadius.md,
                  }
                ]}
              >
                <Text
                  variant="heading"
                  size={typography.fontSizes.xxl}
                  color={theme.primary}
                  style={styles.roomCodeText}
                >
                  {roomCode}
                </Text>
              </View>

              <View style={styles.roomCodeActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: theme.primary,
                      borderRadius: borderRadius.md,
                    }
                  ]}
                  onPress={copyRoomCode}
                >
                  <Ionicons name="copy" size={20} color="#FFFFFF" />
                  <Text
                    variant="body"
                    size={typography.fontSizes.sm}
                    color="#FFFFFF"
                    style={styles.actionButtonText}
                  >
                    Copy
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: theme.secondary,
                      borderRadius: borderRadius.md,
                    }
                  ]}
                  onPress={generateRoomCode}
                >
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  <Text
                    variant="body"
                    size={typography.fontSizes.sm}
                    color="#FFFFFF"
                    style={styles.actionButtonText}
                  >
                    New
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Player Limit Section */}
          <View style={styles.section}>
            <Text
              variant="subtitle"
              size={typography.fontSizes.lg}
              color={theme.text}
              style={styles.sectionTitle}
            >
              Player Limit
            </Text>

            <View style={styles.optionRow}>
              {[2, 4, 6, 8].map((limit) => (
                <TouchableOpacity
                  key={limit}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: playerLimit === limit ? theme.primary : theme.backgroundAlt,
                      borderRadius: borderRadius.md,
                    }
                  ]}
                  onPress={() => setPlayerLimit(limit)}
                >
                  <Text
                    variant="body"
                    size={typography.fontSizes.md}
                    color={playerLimit === limit ? '#FFFFFF' : theme.text}
                  >
                    {limit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Game Duration Section */}
          <View style={styles.section}>
            <Text
              variant="subtitle"
              size={typography.fontSizes.lg}
              color={theme.text}
              style={styles.sectionTitle}
            >
              Round Duration
            </Text>

            <View style={styles.optionRow}>
              {[30, 60, 90, 120].map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: gameDuration === duration ? theme.primary : theme.backgroundAlt,
                      borderRadius: borderRadius.md,
                    }
                  ]}
                  onPress={() => setGameDuration(duration)}
                >
                  <Text
                    variant="body"
                    size={typography.fontSizes.md}
                    color={gameDuration === duration ? '#FFFFFF' : theme.text}
                  >
                    {duration}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Words Section */}
          <View style={styles.section}>
            <Text
              variant="subtitle"
              size={typography.fontSizes.lg}
              color={theme.text}
              style={styles.sectionTitle}
            >
              Custom Words (Optional)
            </Text>

            <View style={styles.customWordsContainer}>
              <View style={styles.addWordContainer}>
                <TextInput
                  style={[
                    styles.wordInput,
                    {
                      backgroundColor: theme.backgroundAlt,
                      borderColor: theme.border,
                      borderRadius: borderRadius.md,
                      color: theme.text,
                      fontFamily: typography.fontFamily.primary,
                    }
                  ]}
                  placeholder="Add a word..."
                  placeholderTextColor={theme.textSecondary}
                  value={newWord}
                  onChangeText={setNewWord}
                  onSubmitEditing={addCustomWord}
                  maxLength={20}
                />
                <TouchableOpacity
                  style={[
                    styles.addWordButton,
                    {
                      backgroundColor: theme.primary,
                      borderRadius: borderRadius.md,
                    }
                  ]}
                  onPress={addCustomWord}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {customWords.length > 0 && (
                <View style={styles.wordsContainer}>
                  {customWords.map((word, index) => (
                    <View
                      key={index}
                      style={[
                        styles.wordChip,
                        {
                          backgroundColor: theme.backgroundAlt,
                          borderRadius: borderRadius.sm,
                        }
                      ]}
                    >
                      <Text
                        variant="body"
                        size={typography.fontSizes.sm}
                        color={theme.text}
                      >
                        {word}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeWordButton}
                        onPress={() => removeCustomWord(word)}
                      >
                        <Ionicons name="close" size={16} color={theme.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Start Game Button */}
        <View style={[styles.footer, { borderTopColor: theme.divider }]}>
          <TouchableOpacity
            style={[
              styles.startButton,
              {
                backgroundColor: theme.success,
                borderRadius: borderRadius.md,
                ...applyThemeShadow('md'),
              }
            ]}
            onPress={handleStartGame}
          >
            <Ionicons name="play" size={24} color="#FFFFFF" />
            <Text
              variant="heading"
              size={typography.fontSizes.lg}
              color="#FFFFFF"
              style={styles.startButtonText}
            >
              Start Private Game
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    maxHeight: 400,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  roomCodeContainer: {
    alignItems: 'center',
  },
  roomCodeDisplay: {
    padding: 16,
    marginBottom: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  roomCodeText: {
    letterSpacing: 2,
  },
  roomCodeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  actionButtonText: {
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  startButtonText: {
    fontWeight: '600',
  },
  customWordsContainer: {
    gap: 12,
  },
  addWordContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  wordInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  addWordButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  removeWordButton: {
    padding: 2,
  },
});

export default PrivateModeOverlay;
