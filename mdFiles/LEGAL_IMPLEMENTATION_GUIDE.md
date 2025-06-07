# Legal Documents Implementation Guide

This guide explains how to integrate the Privacy Policy and Terms of Service into your Skrawl app for legal compliance and app store approval.

## Document Overview

### Files Created
- `PRIVACY_POLICY.md` - Comprehensive privacy policy covering data collection, usage, and user rights
- `TERMS_OF_SERVICE.md` - Complete terms covering user obligations, content policies, and legal protections
- `LEGAL_IMPLEMENTATION_GUIDE.md` - This implementation guide

### Key Features Covered
✅ **Database Schema**: Users table, game data, chat messages, drawings  
✅ **Authentication**: Supabase Auth, Google OAuth, email/OTP  
✅ **Account Deletion**: Complete data removal process  
✅ **Avatar System**: Custom GIF avatars and profile customization  
✅ **Multiplayer Features**: Real-time drawing, leaderboards, game sessions  
✅ **GDPR/CCPA Compliance**: User rights, data deletion, consent management  
✅ **Child Safety**: Age restrictions, parental consent, content moderation  

## Implementation Steps

### 1. Create Legal Components

Create React Native components to display the legal documents:

```typescript
// src/components/legal/PrivacyPolicyScreen.tsx
// src/components/legal/TermsOfServiceScreen.tsx
// src/components/legal/LegalConsentModal.tsx
```

### 2. Add to Navigation

Add legal screens to your navigation stack:

```typescript
// In your navigation types
export type AuthStackParamList = {
  // ... existing screens
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
};
```

### 3. Update Registration Flow

Modify your registration/onboarding to include consent checkboxes:

```typescript
// Required checkboxes for registration
const [agreedToTerms, setAgreedToTerms] = useState(false);
const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
const [isOver13, setIsOver13] = useState(false);

// Validation before account creation
const canProceed = agreedToTerms && agreedToPrivacy && isOver13;
```

### 4. Add Settings Links

Include links to legal documents in your Settings screen:

```typescript
// Settings screen legal section
<View style={styles.legalSection}>
  <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
    <Text>Privacy Policy</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => navigation.navigate('TermsOfService')}>
    <Text>Terms of Service</Text>
  </TouchableOpacity>
</View>
```

## Required UI Components

### 1. Consent Checkboxes

```typescript
interface ConsentCheckboxProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label: string;
  linkText?: string;
  onLinkPress?: () => void;
}

const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({
  checked,
  onToggle,
  label,
  linkText,
  onLinkPress
}) => (
  <View style={styles.checkboxContainer}>
    <TouchableOpacity onPress={() => onToggle(!checked)}>
      <View style={[styles.checkbox, checked && styles.checked]}>
        {checked && <Icon name="checkmark" />}
      </View>
    </TouchableOpacity>
    <Text style={styles.label}>
      {label}
      {linkText && (
        <Text style={styles.link} onPress={onLinkPress}>
          {linkText}
        </Text>
      )}
    </Text>
  </View>
);
```

### 2. Legal Document Viewer

```typescript
interface LegalDocumentProps {
  title: string;
  content: string;
  lastUpdated: string;
  version: string;
}

const LegalDocumentScreen: React.FC<LegalDocumentProps> = ({
  title,
  content,
  lastUpdated,
  version
}) => (
  <SafeAreaContainer>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.metadata}>
        Version {version} • Last Updated: {lastUpdated}
      </Text>
      <MarkdownRenderer content={content} />
    </ScrollView>
  </SafeAreaContainer>
);
```

### 3. Age Verification Modal

```typescript
const AgeVerificationModal: React.FC<{
  visible: boolean;
  onConfirm: (isOver13: boolean) => void;
}> = ({ visible, onConfirm }) => (
  <Modal visible={visible} transparent>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Age Verification</Text>
        <Text style={styles.modalText}>
          Are you 13 years of age or older?
        </Text>
        <View style={styles.buttonContainer}>
          <Button title="Yes, I'm 13+" onPress={() => onConfirm(true)} />
          <Button title="No" onPress={() => onConfirm(false)} />
        </View>
      </View>
    </View>
  </Modal>
);
```

## Registration Flow Integration

### 1. Updated Registration Screen

```typescript
const RegistrationScreen = () => {
  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isOver13, setIsOver13] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);

  const canProceed = agreedToTerms && agreedToPrivacy && isOver13;

  const handleRegistration = async () => {
    if (!canProceed) {
      Alert.alert('Please accept all required terms to continue');
      return;
    }
    
    // Proceed with registration
    await authStore.sendEmailOtp(email);
  };

  return (
    <SafeAreaContainer>
      <ScrollView>
        {/* Email input */}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
        />

        {/* Age verification */}
        <ConsentCheckbox
          checked={isOver13}
          onToggle={() => setShowAgeModal(true)}
          label="I am 13 years of age or older"
        />

        {/* Terms consent */}
        <ConsentCheckbox
          checked={agreedToTerms}
          onToggle={setAgreedToTerms}
          label="I agree to the "
          linkText="Terms of Service"
          onLinkPress={() => navigation.navigate('TermsOfService')}
        />

        {/* Privacy consent */}
        <ConsentCheckbox
          checked={agreedToPrivacy}
          onToggle={setAgreedToPrivacy}
          label="I agree to the "
          linkText="Privacy Policy"
          onLinkPress={() => navigation.navigate('PrivacyPolicy')}
        />

        {/* Registration button */}
        <Button
          title="Create Account"
          onPress={handleRegistration}
          disabled={!canProceed}
        />
      </ScrollView>

      <AgeVerificationModal
        visible={showAgeModal}
        onConfirm={(confirmed) => {
          setIsOver13(confirmed);
          setShowAgeModal(false);
          if (!confirmed) {
            Alert.alert('You must be 13 or older to use Skrawl');
          }
        }}
      />
    </SafeAreaContainer>
  );
};
```

### 2. Store Consent Data

```typescript
// Add to your auth store
interface UserConsent {
  termsVersion: string;
  privacyVersion: string;
  consentDate: string;
  isOver13: boolean;
}

// Store consent when user registers
const storeUserConsent = async (userId: string, consent: UserConsent) => {
  await supabase
    .from('user_consent')
    .insert({
      user_id: userId,
      terms_version: consent.termsVersion,
      privacy_version: consent.privacyVersion,
      consent_date: consent.consentDate,
      is_over_13: consent.isOver13
    });
};
```

## App Store Requirements

### 1. App Store Connect

**Privacy Information:**
- Data Types Collected: Email, Username, Game Data, Usage Data
- Data Use: App Functionality, Analytics, Product Personalization
- Data Sharing: None (except service providers)
- Data Retention: Until account deletion

**Age Rating:**
- Minimum Age: 13+
- Content Rating: 4+ (suitable for all ages)
- Features: Multiplayer, User-Generated Content

### 2. Google Play Console

**Data Safety Section:**
- Personal Info: Email addresses, User IDs
- App Activity: App interactions, In-app search history
- App Info: App performance, Crash logs
- Data Sharing: Only with service providers
- Data Security: Data encrypted in transit and at rest

## Legal Compliance Checklist

### GDPR Compliance
- ✅ Lawful basis for processing clearly stated
- ✅ Data subject rights explained and implemented
- ✅ Data retention periods specified
- ✅ Data deletion functionality provided
- ✅ Consent mechanisms implemented
- ✅ Data protection officer contact provided

### CCPA Compliance
- ✅ Categories of personal information disclosed
- ✅ Business purposes for collection explained
- ✅ Third-party sharing practices described
- ✅ Consumer rights clearly stated
- ✅ Non-discrimination policy included

### COPPA Compliance
- ✅ Age verification implemented
- ✅ Parental consent requirements explained
- ✅ Limited data collection for minors
- ✅ Child safety features described

## Contact Information Setup

Before going live, set up these email addresses:
- `privacy@skrawl.app` - Privacy policy questions
- `legal@skrawl.app` - Terms of service questions
- `support@skrawl.app` - General support
- `dpo@skrawl.app` - Data protection officer (GDPR)
- `copyright@skrawl.app` - DMCA takedown notices

## Version Management

### Document Updates
1. Update version number and last updated date
2. Communicate material changes to users
3. Require re-acceptance for significant changes
4. Maintain archive of previous versions

### Implementation Timeline
1. **Week 1**: Create legal components and screens
2. **Week 2**: Integrate consent flow into registration
3. **Week 3**: Add settings links and age verification
4. **Week 4**: Test compliance and prepare app store submissions

This implementation ensures your app meets legal requirements and provides a smooth user experience while maintaining compliance with privacy regulations.
