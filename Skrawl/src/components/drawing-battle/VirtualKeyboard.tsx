import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../ui/Text';

interface VirtualKeyboardProps {
  /**
   * Whether the keyboard is visible
   */
  visible: boolean;

  /**
   * Current message being typed (for header display)
   */
  currentMessage: string;

  /**
   * Callback when a key is pressed
   */
  onKeyPress: (key: string) => void;

  /**
   * Callback when backspace is pressed
   */
  onBackspace: () => void;

  /**
   * Callback when space is pressed
   */
  onSpace: () => void;

  /**
   * Callback when enter/send is pressed
   */
  onEnter: () => void;

  /**
   * Callback when keyboard should be hidden
   */
  onHide: () => void;
}

// Enhanced emoji categories for competitive drawing games
const EMOJI_CATEGORIES = {
  faces: ['😂', '🤣', '😭', '😤', '🤬', '😱', '🤯', '🥶', '🥵', '😵', '🤮', '🤢', '🤧', '😷', '🤒', '🤕', '🤠', '🥳', '🤡', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎭', '😈', '👿', '🤓', '🧐', '🤪'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🦍', '🦧', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜'],
  competitive: ['🏆', '🥇', '🥈', '🥉', '🎯', '🎮', '🕹️', '🎲', '🃏', '🎪', '🎨', '🖌️', '✏️', '🖍️', '🖊️', '✒️', '🔥', '💯', '⚡', '💥', '💢', '💪', '👊', '✊', '🤜', '🤛', '👏', '🙌', '🤝', '🤞', '🤟'],
  reactions: ['😍', '🥰', '😘', '🤩', '😎', '🤨', '🧐', '🙄', '😏', '😒', '😑', '😐', '🤐', '🤫', '🤭', '🤔', '🤗', '🤤', '😴', '😪', '🥱', '😵‍💫', '🤠', '🥸', '😇', '🤓', '🤖', '👹', '👺', '🤡']
};

// Standard mobile keyboard layout
const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

/**
 * Enhanced virtual keyboard component with theme integration
 */
const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  visible,
  currentMessage,
  onKeyPress,
  onBackspace,
  onSpace,
  onEnter,
  onHide,
}) => {
  const { theme, spacing, borderRadius, typography } = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  // Emoji picker state - toggles between keyboard and emoji modes
  const [isEmojiMode, setIsEmojiMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof EMOJI_CATEGORIES>('faces');

  // Reset emoji mode when keyboard becomes visible
  useEffect(() => {
    if (visible) {
      setIsEmojiMode(false);
    }
  }, [visible]);

  // Animate keyboard in/out
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  // Mobile keyboard styles with proper layout
  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'flex-end',
      zIndex: 1000,
    },
    keyboardContainer: {
      backgroundColor: `${theme.surface}E6`, // 90% opacity for semi-transparency
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.sm,
      paddingBottom: spacing.lg,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      shadowColor: theme.shadow,
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 8,
      minHeight: 250, // Ensure minimum height for visibility
    },
    keyboardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs, // Reduced margin
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
    },
    headerContent: {
      flex: 1,
      marginRight: spacing.xs,
    },
    headerLabel: {
      fontSize: typography.fontSizes.xs,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    headerMessage: {
      fontSize: typography.fontSizes.md,
      color: theme.text,
      fontWeight: '600',
      minHeight: 20,
    },
    closeButton: {
      width: 28, // Smaller close button
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.backgroundAlt,
      justifyContent: 'center',
      alignItems: 'center',
    },
    keyboardRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.xxs,
    },
    // Standard row (10 keys)
    standardRow: {
      paddingHorizontal: 0,
    },
    // Middle row (9 keys) - slightly indented
    middleRow: {
      paddingHorizontal: spacing.md,
    },
    // Bottom row (7 keys) - more indented
    bottomRow: {
      paddingHorizontal: spacing.lg,
    },
    key: {
      backgroundColor: theme.primary,
      marginHorizontal: 3,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      borderRadius: borderRadius.sm,
      minWidth: 32,
      minHeight: 42,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 3,
    },
    keyPressed: {
      backgroundColor: theme.primaryLight,
      transform: [{ scale: 0.95 }],
    },
    keyText: {
      color: '#FFFFFF',
      fontSize: typography.fontSizes.md,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    specialKey: {
      backgroundColor: theme.primaryDark,
      flex: 1.5, // Slightly wider than regular keys
      minWidth: 48,
    },
    spaceKey: {
      backgroundColor: theme.primaryDark,
      flex: 4, // Much wider space bar like mobile keyboards
      marginHorizontal: spacing.xs,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    punctuationKey: {
      backgroundColor: theme.primaryDark,
      flex: 1,
      minWidth: 32,
    },
    // Emoji picker styles - uses full keyboard space
    emojiPickerContainer: {
      flex: 1,
      padding: spacing.sm,
    },
    emojiCategoryTabs: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    categoryTab: {
      paddingVertical: spacing.xxs,
      paddingHorizontal: spacing.xs,
      borderRadius: borderRadius.sm,
      backgroundColor: theme.backgroundAlt,
    },
    activeCategoryTab: {
      backgroundColor: theme.primary,
    },
    categoryTabText: {
      fontSize: typography.fontSizes.xs,
      color: theme.textSecondary,
    },
    activeCategoryTabText: {
      color: '#FFFFFF',
    },
    emojiGrid: {
      flex: 1,
    },
    emojiRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: spacing.xs,
    },
    emojiButton: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.sm,
    },
    emojiText: {
      fontSize: 24,
    },
  });

  if (!visible) {
    return null;
  }

  // Debug: Log keyboard state
  console.log('VirtualKeyboard render:', { visible, isEmojiMode, currentMessage });

  // Handle emoji mode toggle
  const handleEmojiKeyPress = () => {
    setIsEmojiMode(!isEmojiMode);
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    onKeyPress(emoji);
    setIsEmojiMode(false); // Return to keyboard mode after selection
  };

  // Handle category selection
  const handleCategorySelect = (category: keyof typeof EMOJI_CATEGORIES) => {
    setSelectedCategory(category);
  };

  const renderKey = (key: string, isSpecial = false, customStyle = {}) => (
    <TouchableOpacity
      key={key}
      style={[
        styles.key,
        isSpecial && styles.specialKey,
        customStyle,
      ]}
      onPress={() => onKeyPress(key)}
      activeOpacity={0.7}
    >
      <Text style={styles.keyText}>{key}</Text>
    </TouchableOpacity>
  );

  const renderSpecialKey = (icon: string, onPress: () => void, customStyle = {}) => (
    <TouchableOpacity
      style={[styles.key, styles.specialKey, customStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon as any} size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );

  // Render emoji picker (replaces entire keyboard)
  const renderEmojiPicker = () => {
    const categoryKeys = Object.keys(EMOJI_CATEGORIES) as (keyof typeof EMOJI_CATEGORIES)[];
    const categoryIcons = {
      faces: '🤡',
      animals: '🐶',
      competitive: '🏆',
      reactions: '🤔'
    };

    // Create rows of emojis (8 per row)
    const emojis = EMOJI_CATEGORIES[selectedCategory];
    const emojiRows = [];
    for (let i = 0; i < emojis.length; i += 8) {
      emojiRows.push(emojis.slice(i, i + 8));
    }

    return (
      <View style={styles.emojiPickerContainer}>
        {/* Header with back button */}
        <View style={styles.keyboardHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.headerLabel}>Choose emoji:</Text>
            <Text style={styles.headerMessage}>
              {currentMessage || 'Tap an emoji to add it'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsEmojiMode(false)}
            activeOpacity={0.7}
          >
            <Ionicons name="keypad-outline" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Category tabs */}
        <View style={styles.emojiCategoryTabs}>
          {categoryKeys.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.activeCategoryTab
              ]}
              onPress={() => handleCategorySelect(category)}
              activeOpacity={0.7}
            >
              <Text style={styles.emojiText}>
                {categoryIcons[category]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emoji grid */}
        <ScrollView style={styles.emojiGrid} showsVerticalScrollIndicator={false}>
          {emojiRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.emojiRow}>
              {row.map((emoji, emojiIndex) => (
                <TouchableOpacity
                  key={emojiIndex}
                  style={styles.emojiButton}
                  onPress={() => handleEmojiSelect(emoji)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0], // Increase slide distance to ensure visibility
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={onHide}
        activeOpacity={1}
      />

      <Animated.View style={[styles.keyboardContainer, { transform: [{ translateY }] }]}>
        {isEmojiMode ? (
          // Show emoji picker (replaces entire keyboard)
          renderEmojiPicker()
        ) : (
          // Show regular keyboard
          <>
            {/* Enhanced Header with real-time typing display */}
            <View style={styles.keyboardHeader}>
              <View style={styles.headerContent}>
                <Text style={styles.headerLabel}>Your guess:</Text>
                <Text style={styles.headerMessage}>
                  {currentMessage || 'Start typing...'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onHide}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* First row - QWERTYUIOP */}
            <View style={[styles.keyboardRow, styles.standardRow]}>
              {KEYBOARD_ROWS[0].map((key) => renderKey(key))}
            </View>

            {/* Second row - ASDFGHJKL */}
            <View style={[styles.keyboardRow, styles.middleRow]}>
              {KEYBOARD_ROWS[1].map((key) => renderKey(key))}
            </View>

            {/* Third row - Emoji + ZXCVBNM + Backspace */}
            <View style={[styles.keyboardRow, styles.bottomRow]}>
              {renderSpecialKey('happy-outline', handleEmojiKeyPress, styles.specialKey)}
              {KEYBOARD_ROWS[2].map((key) => renderKey(key))}
              {renderSpecialKey('backspace', onBackspace, styles.specialKey)}
            </View>

            {/* Fourth row - Punctuation and Space */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.key, styles.punctuationKey]}
                onPress={() => onKeyPress('.')}
                activeOpacity={0.7}
              >
                <Text style={styles.keyText}>.</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.key, styles.spaceKey]}
                onPress={onSpace}
                activeOpacity={0.7}
              >
                <Text style={[styles.keyText, { fontSize: typography.fontSizes.sm }]}>space</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.key, styles.punctuationKey]}
                onPress={() => onKeyPress('-')}
                activeOpacity={0.7}
              >
                <Text style={styles.keyText}>-</Text>
              </TouchableOpacity>

              {renderSpecialKey('return-down-back', onEnter, styles.specialKey)}
            </View>
          </>
        )}
      </Animated.View>
    </Animated.View>
  );
};

export default VirtualKeyboard;
