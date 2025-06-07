import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../ui';
import { applyThemeShadow } from '../../utils/styleUtils';
// Game logic service removed - will be reimplemented with new backend
type WordChoice = {
  id: string;
  word: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface WordSelectionModalProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;

  /**
   * Callback when a word is selected
   */
  onWordSelected: (word: string) => void;

  /**
   * Callback when modal is dismissed
   */
  onDismiss: () => void;

  /**
   * Difficulty preference for word selection
   */
  difficulty?: 'easy' | 'medium' | 'hard';

  /**
   * Time limit for word selection (in seconds)
   */
  timeLimit?: number;
}

/**
 * Modal component for word selection by the drawer
 */
const WordSelectionModal: React.FC<WordSelectionModalProps> = ({
  visible,
  onWordSelected,
  onDismiss,
  difficulty,
  timeLimit = 15,
}) => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  
  // State
  const [wordChoices, setWordChoices] = useState<WordChoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  // Load word choices when modal becomes visible
  useEffect(() => {
    if (visible) {
      loadWordChoices();
      setTimeRemaining(timeLimit);
      setSelectedWord(null);
      
      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animation values
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  // Countdown timer
  useEffect(() => {
    if (!visible || timeRemaining <= 0) return;

    const timer = setTimeout(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          // Auto-select first word if time runs out
          if (wordChoices.length > 0 && !selectedWord) {
            handleWordSelect(wordChoices[0].word);
          }
        }
        return newTime;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [visible, timeRemaining, wordChoices, selectedWord]);

  const loadWordChoices = async () => {
    setIsLoading(true);
    try {
      // Game logic service removed - will be reimplemented with new backend
      // Using fallback words for now
      setWordChoices([
        { id: '1', word: 'Cat', difficulty: 'easy' },
        { id: '2', word: 'House', difficulty: 'easy' },
        { id: '3', word: 'Tree', difficulty: 'easy' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordSelect = (word: string) => {
    if (selectedWord) return; // Prevent double selection
    
    setSelectedWord(word);
    
    // Exit animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onWordSelected(word);
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.success;
      case 'medium': return theme.warning;
      case 'hard': return theme.error;
      default: return theme.primary;
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'leaf-outline';
      case 'medium': return 'flash-outline';
      case 'hard': return 'flame-outline';
      default: return 'help-outline';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            opacity: fadeAnim,
          }
        ]}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.background,
              borderRadius: borderRadius.xl,
              ...applyThemeShadow('lg'),
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg }]}>
            <Text
              variant="heading"
              size={typography.fontSizes.xl}
              style={{ textAlign: 'center' }}
            >
              Choose Your Word
            </Text>
            
            {/* Timer */}
            <View style={[styles.timerContainer, { backgroundColor: theme.backgroundAlt, borderRadius: borderRadius.md }]}>
              <Ionicons 
                name="time-outline" 
                size={20} 
                color={timeRemaining <= 5 ? theme.error : theme.primary} 
              />
              <Text
                variant="body"
                size={typography.fontSizes.lg}
                color={timeRemaining <= 5 ? theme.error : theme.primary}
                bold
                style={{ marginLeft: spacing.xs }}
              >
                {timeRemaining}s
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={[styles.content, { padding: spacing.lg }]}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text
                  variant="body"
                  size={typography.fontSizes.md}
                  color={theme.textSecondary}
                  style={{ textAlign: 'center' }}
                >
                  Loading words...
                </Text>
              </View>
            ) : (
              <View style={styles.wordsContainer}>
                {wordChoices.map((choice, index) => (
                  <TouchableOpacity
                    key={choice.id}
                    style={[
                      styles.wordCard,
                      {
                        backgroundColor: theme.backgroundAlt,
                        borderRadius: borderRadius.lg,
                        borderWidth: 2,
                        borderColor: 'transparent',
                        ...applyThemeShadow('sm'),
                        marginBottom: index < wordChoices.length - 1 ? spacing.md : 0,
                      }
                    ]}
                    onPress={() => handleWordSelect(choice.word)}
                    disabled={!!selectedWord}
                  >
                    <View style={styles.wordCardContent}>
                      <View style={styles.wordInfo}>
                        <Text
                          variant="heading"
                          size={typography.fontSizes.xl}
                          style={{ marginBottom: spacing.xs }}
                        >
                          {choice.word}
                        </Text>
                        
                        <View style={styles.difficultyBadge}>
                          <Ionicons
                            name={getDifficultyIcon(choice.difficulty) as any}
                            size={16}
                            color={getDifficultyColor(choice.difficulty)}
                          />
                          <Text
                            variant="body"
                            size={typography.fontSizes.sm}
                            color={getDifficultyColor(choice.difficulty)}
                            bold
                            style={{ marginLeft: spacing.xs, textTransform: 'capitalize' }}
                          >
                            {choice.difficulty}
                          </Text>
                        </View>
                      </View>
                      
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={theme.textSecondary}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={[styles.footer, { padding: spacing.lg }]}>
            <Text
              variant="body"
              size={typography.fontSizes.sm}
              color={theme.textSecondary}
              style={{ textAlign: 'center' }}
            >
              {timeRemaining <= 5 
                ? 'Hurry up! Time is running out!'
                : 'Choose wisely - other players will try to guess your drawing!'
              }
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: Math.min(screenWidth - 40, 400),
    maxHeight: screenHeight * 0.8,
  },
  header: {
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  wordsContainer: {
    flex: 1,
  },
  wordCard: {
    padding: 20,
  },
  wordCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordInfo: {
    flex: 1,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default WordSelectionModal;
