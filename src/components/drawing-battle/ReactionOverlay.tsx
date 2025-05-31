import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { CustomIcon } from '../ui';
import { useTheme } from '../../theme/ThemeContext';

interface ReactionOverlayProps {
  /**
   * Callback when user likes the drawing
   */
  onLike?: () => void;

  /**
   * Callback when user dislikes the drawing
   */
  onDislike?: () => void;

  /**
   * Whether the overlay should be visible
   */
  visible?: boolean;
}

/**
 * Transparent overlay with thumbs up/down buttons for canvas reactions
 */
const ReactionOverlay: React.FC<ReactionOverlayProps> = ({
  onLike,
  onDislike,
  visible = true,
}) => {
  const { theme, spacing, borderRadius } = useTheme();
  const [likePressed, setLikePressed] = useState(false);
  const [dislikePressed, setDislikePressed] = useState(false);

  // Create styles with theme values
  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      flexDirection: 'row',
      zIndex: 1000,
    },
    reactionButton: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.round,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.xxs,
      // Semi-transparent background
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      // Subtle border for better visibility
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    likeButton: {
      // Green tint when pressed
    },
    dislikeButton: {
      // Red tint when pressed
    },
    pressedLike: {
      backgroundColor: 'rgba(76, 175, 80, 0.8)', // Green with transparency
      borderColor: 'rgba(76, 175, 80, 1)',
    },
    pressedDislike: {
      backgroundColor: 'rgba(244, 67, 54, 0.8)', // Red with transparency
      borderColor: 'rgba(244, 67, 54, 1)',
    },
  });

  const handleLike = () => {
    setLikePressed(true);
    setDislikePressed(false); // Reset dislike if like is pressed
    onLike?.();

    // Reset after animation
    setTimeout(() => {
      setLikePressed(false);
    }, 1000);
  };

  const handleDislike = () => {
    setDislikePressed(true);
    setLikePressed(false); // Reset like if dislike is pressed
    onDislike?.();

    // Reset after animation
    setTimeout(() => {
      setDislikePressed(false);
    }, 1000);
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Thumbs Up Button */}
      <TouchableOpacity
        style={[
          styles.reactionButton,
          styles.likeButton,
          likePressed && styles.pressedLike,
        ]}
        onPress={handleLike}
        activeOpacity={0.7}
      >
        <CustomIcon
          name="thumbs-up"
          size={18}
          color={likePressed ? '#FFFFFF' : 'rgba(255, 255, 255, 0.9)'}
        />
      </TouchableOpacity>

      {/* Thumbs Down Button */}
      <TouchableOpacity
        style={[
          styles.reactionButton,
          styles.dislikeButton,
          dislikePressed && styles.pressedDislike,
        ]}
        onPress={handleDislike}
        activeOpacity={0.7}
      >
        <CustomIcon
          name="thumbs-down"
          size={18}
          color={dislikePressed ? '#FFFFFF' : 'rgba(255, 255, 255, 0.9)'}
        />
      </TouchableOpacity>
    </View>
  );
};

export default ReactionOverlay;
