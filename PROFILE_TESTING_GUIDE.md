# Profile Management Testing Guide

## Manual Testing Checklist

### 🔧 Setup Tests

- [ ] **Database Migration**: SQL script executes without errors
- [ ] **Environment Variables**: Supabase URL and keys are correct
- [ ] **App Startup**: No TypeScript errors, app loads successfully
- [ ] **Navigation**: Can navigate to ProfileEdit from Settings

### 👤 Authentication Flow Tests

- [ ] **New User**: Profile setup shows username change available
- [ ] **Existing User**: Profile loads with correct change status
- [ ] **Session Persistence**: Username change status persists across app restarts
- [ ] **Logout/Login**: Profile state resets correctly

### ✏️ Username Change Tests

#### Valid Username Tests
- [ ] **3-20 Characters**: Accepts usernames in valid length range
- [ ] **Alphanumeric**: Accepts letters and numbers
- [ ] **Underscores/Dashes**: Accepts valid special characters
- [ ] **Mixed Case**: Handles uppercase and lowercase correctly

#### Invalid Username Tests
- [ ] **Too Short**: Rejects usernames under 3 characters
- [ ] **Too Long**: Rejects usernames over 20 characters
- [ ] **Invalid Characters**: Rejects @, #, $, %, spaces, etc.
- [ ] **Reserved Words**: Rejects 'admin', 'moderator', 'support'
- [ ] **Empty Input**: Handles empty username gracefully

#### Edge Cases
- [ ] **Duplicate Username**: Shows "already taken" error
- [ ] **Case Sensitivity**: 'User' and 'user' treated as same
- [ ] **Whitespace**: Trims leading/trailing spaces
- [ ] **Special Patterns**: Rejects multiple consecutive underscores

### 🔒 Username Change Limitation Tests

#### First-Time Change
- [ ] **Warning Modal**: Shows clear warning about permanent change
- [ ] **Confirmation Flow**: Requires multiple confirmations
- [ ] **Success Message**: Confirms change and shows lock status
- [ ] **Status Update**: Changes remaining count decreases to 0

#### After First Change
- [ ] **Locked Status**: Shows "permanently locked" message
- [ ] **Disabled Input**: Username field is disabled or read-only
- [ ] **Clear Messaging**: Explains why username cannot be changed
- [ ] **Lock Icon**: Visual indicator of locked status

### 🎨 Avatar Change Tests

- [ ] **Unlimited Changes**: Can change avatar multiple times
- [ ] **GIF Animations**: All 11 GIF avatars work correctly
- [ ] **Icon Fallbacks**: All 13 icon avatars display properly
- [ ] **Persistence**: Avatar changes save and persist
- [ ] **Navigation**: Avatar selection screen works correctly

### 🌐 Network & Error Handling Tests

#### Network Connectivity
- [ ] **Offline Mode**: Shows appropriate error when offline
- [ ] **Slow Connection**: Handles slow network gracefully
- [ ] **Connection Loss**: Recovers when connection restored
- [ ] **Timeout Handling**: Shows timeout errors appropriately

#### Server Errors
- [ ] **Database Errors**: Handles database connection issues
- [ ] **Validation Errors**: Shows server-side validation errors
- [ ] **Rate Limiting**: Handles too many requests gracefully
- [ ] **Unexpected Errors**: Shows generic error for unknown issues

### 📱 UI/UX Tests

#### Real-time Validation
- [ ] **Typing Feedback**: Shows validation as user types
- [ ] **Debounced Requests**: Doesn't spam server with requests
- [ ] **Loading States**: Shows loading indicators appropriately
- [ ] **Error States**: Displays errors clearly

#### Accessibility
- [ ] **Screen Readers**: All text is accessible
- [ ] **Touch Targets**: Buttons are large enough to tap
- [ ] **Color Contrast**: Text is readable in both themes
- [ ] **Focus Management**: Keyboard navigation works

### 🔄 State Management Tests

- [ ] **Zustand Store**: Profile state updates correctly
- [ ] **Persistence**: State persists across app restarts
- [ ] **Sync Issues**: Handles state sync problems
- [ ] **Memory Leaks**: No memory leaks in state management

## Automated Testing

### Running the Test Suite

1. **Add Test Component** (Development only):
```tsx
// In your development screens, add:
import ProfileTestSuite from '../components/debug/ProfileTestSuite';

// Add to render:
{__DEV__ && <ProfileTestSuite />}
```

2. **Run Edge Case Tests**:
   - Tap "Run Edge Case Tests" button
   - Review all test results
   - Investigate any failures

### Test Categories

#### 1. Username Format Validation
- Tests all format rules
- Validates length limits
- Checks character restrictions

#### 2. Database Constraints
- Tests uniqueness constraints
- Validates server-side rules
- Checks RLS policies

#### 3. Network Handling
- Tests connectivity issues
- Validates error recovery
- Checks timeout handling

#### 4. Concurrent Requests
- Tests multiple simultaneous requests
- Validates race condition handling
- Checks data consistency

## Performance Testing

### Load Testing
- [ ] **Multiple Users**: Test with multiple concurrent users
- [ ] **Database Load**: Verify database performance under load
- [ ] **Memory Usage**: Monitor app memory usage
- [ ] **Response Times**: Measure validation response times

### Stress Testing
- [ ] **Rapid Requests**: Test rapid username validation requests
- [ ] **Large Datasets**: Test with many existing usernames
- [ ] **Network Interruption**: Test during network interruptions
- [ ] **Low Memory**: Test on devices with low memory

## Security Testing

### Input Validation
- [ ] **SQL Injection**: Test with SQL injection attempts
- [ ] **XSS Attempts**: Test with script injection
- [ ] **Buffer Overflow**: Test with extremely long inputs
- [ ] **Unicode Attacks**: Test with special Unicode characters

### Authorization
- [ ] **User Isolation**: Users can only change their own profiles
- [ ] **Session Validation**: Invalid sessions are rejected
- [ ] **Token Expiry**: Expired tokens are handled correctly
- [ ] **Permission Checks**: All operations check permissions

## Common Issues & Solutions

### Issue: "Function does not exist"
**Solution**: Execute all SQL migration steps in order

### Issue: Username validation not working
**Solution**: Check network connectivity and Supabase configuration

### Issue: Changes not persisting
**Solution**: Verify RLS policies and user permissions

### Issue: UI not updating after change
**Solution**: Check Zustand store state management

### Issue: Network errors in testing
**Solution**: Test with stable internet connection

## Test Data Cleanup

After testing, clean up test data:

```sql
-- Remove test usernames (be careful!)
DELETE FROM public.users 
WHERE display_name LIKE 'test_%' 
AND created_at > NOW() - INTERVAL '1 day';

-- Reset username changes for testing user
UPDATE public.users 
SET username_changes_remaining = 1,
    display_name_locked = false
WHERE id = 'your-test-user-id';
```

## Reporting Issues

When reporting issues, include:
1. **Steps to reproduce**
2. **Expected vs actual behavior**
3. **Device/platform information**
4. **Network conditions**
5. **Console logs/error messages**
6. **Screenshots/videos**

## Success Criteria

✅ **All manual tests pass**  
✅ **Automated test suite shows all green**  
✅ **No console errors during normal usage**  
✅ **Performance is acceptable (< 2s response times)**  
✅ **Security tests show no vulnerabilities**  
✅ **UI is intuitive and accessible**  

The profile management system is ready for production when all these criteria are met.
