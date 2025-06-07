import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import Text from './Text';
import CustomIcon from './CustomIcon';
import { applyThemeShadow } from '../../utils/styleUtils';

interface DeleteAccountModalProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;

  /**
   * Callback when the modal is closed
   */
  onClose: () => void;

  /**
   * Callback when account deletion is confirmed
   */
  onConfirmDelete: () => Promise<void>;

  /**
   * User's display name for confirmation
   */
  displayName: string;

  /**
   * Loading state during deletion
   */
  isDeleting: boolean;
}

/**
 * Modal component for account deletion with multiple confirmation steps
 */
const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
  onConfirmDelete,
  displayName,
  isDeleting,
}) => {
  const { theme, typography, spacing, borderRadius } = useTheme();
  const [step, setStep] = useState<'warning' | 'confirmation' | 'final'>('warning');
  const [confirmationText, setConfirmationText] = useState('');

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      setStep('warning');
      setConfirmationText('');
    }
  }, [visible]);

  const handleNextStep = () => {
    if (step === 'warning') {
      setStep('confirmation');
    } else if (step === 'confirmation') {
      if (confirmationText === displayName) {
        setStep('final');
      } else {
        Alert.alert(
          'Incorrect Username',
          `Please type "${displayName}" exactly as shown to confirm deletion.`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleFinalConfirmation = () => {
    Alert.alert(
      'Final Confirmation',
      'This action cannot be undone. Your account and all data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: onConfirmDelete,
        },
      ]
    );
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  const isConfirmationValid = confirmationText === displayName;

  // Create styles with theme values
  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
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
      padding: spacing.md,
      borderBottomWidth: 1,
    },
    closeButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
    },
    content: {
      padding: spacing.lg,
    },
    warningIcon: {
      alignSelf: 'center',
      marginBottom: spacing.md,
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    warningList: {
      marginVertical: spacing.md,
    },
    warningItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 8,
      marginRight: spacing.sm,
    },
    confirmationInput: {
      borderWidth: 1,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginVertical: spacing.md,
      fontSize: typography.fontSizes.md,
      fontFamily: typography.fontFamily.primary,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.lg,
      gap: spacing.md,
    },
    button: {
      flex: 1,
      height: 48,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    buttonText: {
      fontSize: typography.fontSizes.md,
      fontFamily: typography.fontFamily.primaryBold,
    },
  });

  const renderWarningStep = () => (
    <>
      <View style={[styles.warningIcon, { backgroundColor: '#FF4444' + '20' }]}>
        <CustomIcon name="warning" size={32} color="#FF4444" />
      </View>

      <Text
        variant="heading"
        size={typography.fontSizes.xl}
        style={{ textAlign: 'center', marginBottom: spacing.md, color: '#FF4444' }}
      >
        Delete Account
      </Text>

      <Text
        variant="body"
        size={typography.fontSizes.md}
        style={{ textAlign: 'center', marginBottom: spacing.md }}
      >
        This action will permanently delete your profile and all associated data. This cannot be undone.
      </Text>

      <View style={styles.warningList}>
        <Text
          variant="title"
          size={typography.fontSizes.md}
          style={{ marginBottom: spacing.sm }}
        >
          The following will be permanently deleted:
        </Text>

        {[
          'Your profile and username',
          'Avatar and customization data',
          'Game history and statistics',
          'Leaderboard rankings',
          'All account preferences',
        ].map((item, index) => (
          <View key={index} style={styles.warningItem}>
            <View style={[styles.bullet, { backgroundColor: '#FF4444' }]} />
            <Text variant="body" size={typography.fontSizes.sm}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </>
  );

  const renderConfirmationStep = () => (
    <>
      <Text
        variant="heading"
        size={typography.fontSizes.xl}
        style={{ textAlign: 'center', marginBottom: spacing.md, color: '#FF4444' }}
      >
        Confirm Deletion
      </Text>

      <Text
        variant="body"
        size={typography.fontSizes.md}
        style={{ textAlign: 'center', marginBottom: spacing.md }}
      >
        To confirm deletion, please type your username exactly as shown:
      </Text>

      <Text
        variant="title"
        size={typography.fontSizes.lg}
        style={{
          textAlign: 'center',
          marginBottom: spacing.sm,
          padding: spacing.sm,
          backgroundColor: theme.backgroundAlt,
          borderRadius: borderRadius.md,
        }}
      >
        {displayName}
      </Text>

      <TextInput
        style={[
          styles.confirmationInput,
          {
            borderColor: isConfirmationValid ? theme.success : theme.border,
            backgroundColor: theme.background,
            color: theme.text,
          },
        ]}
        value={confirmationText}
        onChangeText={setConfirmationText}
        placeholder="Type your username here"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text
        variant="body"
        size={typography.fontSizes.sm}
        style={{ textAlign: 'center', color: theme.textSecondary }}
      >
        Username is case-sensitive and must match exactly
      </Text>
    </>
  );

  const renderFinalStep = () => (
    <>
      <View style={[styles.warningIcon, { backgroundColor: '#FF4444' + '20' }]}>
        <CustomIcon name="warning" size={32} color="#FF4444" />
      </View>

      <Text
        variant="heading"
        size={typography.fontSizes.xl}
        style={{ textAlign: 'center', marginBottom: spacing.md, color: '#FF4444' }}
      >
        Final Warning
      </Text>

      <Text
        variant="body"
        size={typography.fontSizes.md}
        style={{ textAlign: 'center', marginBottom: spacing.md }}
      >
        You are about to permanently delete your account "{displayName}".
      </Text>

      <Text
        variant="body"
        size={typography.fontSizes.md}
        bold={true}
        style={{ textAlign: 'center', color: '#FF4444' }}
      >
        This action cannot be undone!
      </Text>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: theme.surface,
                  borderRadius: borderRadius.lg,
                  ...applyThemeShadow('lg'),
                },
              ]}
            >
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: theme.divider }]}>
                <Text variant="title" size={typography.fontSizes.lg}>
                  Step {step === 'warning' ? '1' : step === 'confirmation' ? '2' : '3'} of 3
                </Text>

                {!isDeleting && (
                  <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: theme.backgroundAlt }]}
                    onPress={handleClose}
                  >
                    <CustomIcon name="close" size={20} color={theme.text} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Content */}
              <View style={styles.content}>
                {step === 'warning' && renderWarningStep()}
                {step === 'confirmation' && renderConfirmationStep()}
                {step === 'final' && renderFinalStep()}

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  {step !== 'final' && (
                    <TouchableOpacity
                      style={[
                        styles.button,
                        {
                          backgroundColor: theme.backgroundAlt,
                          borderWidth: 1,
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={handleClose}
                      disabled={isDeleting}
                    >
                      <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.button,
                      {
                        backgroundColor: step === 'final' ? '#FF4444' : theme.primary,
                        opacity: (step === 'confirmation' && !isConfirmationValid) || isDeleting ? 0.5 : 1,
                      },
                    ]}
                    onPress={step === 'final' ? handleFinalConfirmation : handleNextStep}
                    disabled={(step === 'confirmation' && !isConfirmationValid) || isDeleting}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                        {step === 'warning' ? 'Continue' : step === 'confirmation' ? 'Confirm' : 'Delete Forever'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DeleteAccountModal;
