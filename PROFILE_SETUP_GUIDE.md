# Profile Management Setup Guide

## Quick Setup Steps

### 1. Database Setup
Execute the SQL commands in Supabase Dashboard > SQL Editor:

```sql
-- Copy and paste the entire content of:
-- database/06-profile-management-simple.sql
```

**Or execute step by step:**

1. **Add columns:**
```sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username_changes_remaining INTEGER DEFAULT 1;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username_change_history JSONB DEFAULT '[]';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_username_change TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS display_name_locked BOOLEAN DEFAULT FALSE;
```

2. **Create unique index:**
```sql
CREATE UNIQUE INDEX idx_users_display_name_unique 
ON public.users (LOWER(display_name)) 
WHERE display_name IS NOT NULL;
```

3. **Execute the functions** (copy from the simple SQL file)

### 2. Test the Setup

1. **Start your app:**
```bash
npm start
```

2. **Test username change flow:**
   - Login with email authentication
   - Complete profile setup
   - Go to Settings → Edit Profile
   - Try changing username (should show warning)
   - Confirm change
   - Try changing again (should be locked)

### 3. Add to Settings Screen

Add a button to navigate to ProfileEdit in your SettingsScreen:

```tsx
<TouchableOpacity onPress={() => navigation.navigate('ProfileEdit')}>
  <Text>Edit Profile</Text>
</TouchableOpacity>
```

## Features Implemented

✅ **Username Change Limitation**: Users get 1 free change, then locked  
✅ **Avatar Changes**: Unlimited avatar changes allowed  
✅ **Validation**: Real-time username availability checking  
✅ **Security**: Server-side validation and RLS policies  
✅ **UI Warnings**: Clear communication about permanent changes  
✅ **History Tracking**: Complete audit trail of username changes  

## User Experience Flow

1. **Initial Setup**: User creates profile with username
2. **Settings Access**: User can access "Edit Profile" from Settings
3. **Username Change**: 
   - Shows remaining changes (1)
   - Real-time validation as they type
   - Warning modal before confirming
   - Success message with lock status
4. **Avatar Change**: Unlimited changes via avatar selection
5. **Locked State**: Clear indication when username is permanently locked

## Database Schema

The system adds these fields to your `users` table:
- `username_changes_remaining` (INTEGER): Number of changes left
- `username_change_history` (JSONB): Array of change records
- `last_username_change` (TIMESTAMP): When last change occurred
- `display_name_locked` (BOOLEAN): Whether username is permanently locked

## Security Features

- **RLS Policies**: Users can only modify their own profiles
- **Server-side Validation**: All checks happen in PostgreSQL functions
- **Unique Constraints**: Case-insensitive username uniqueness
- **Input Validation**: Format, length, and character restrictions
- **Audit Trail**: Complete history of all username changes

## Troubleshooting

### Common Issues:

1. **"Function does not exist" error**:
   - Make sure you executed all SQL commands
   - Check function permissions are granted

2. **"Username already taken" for unique names**:
   - The check is case-insensitive
   - Try a completely different username

3. **Navigation error to ProfileEdit**:
   - Make sure you added ProfileEdit to navigation types
   - Import the screen in AppNavigator

4. **Validation not working**:
   - Check network connection to Supabase
   - Verify RLS policies allow function execution

### Testing Checklist:

- [ ] Database columns added successfully
- [ ] Functions created without errors
- [ ] App starts without TypeScript errors
- [ ] Can navigate to ProfileEdit screen
- [ ] Username validation works in real-time
- [ ] Warning modal appears for username change
- [ ] Username gets locked after first change
- [ ] Avatar changes work unlimited times
- [ ] Error handling works for invalid usernames

## Next Steps

After implementing this system:

1. **Add to Settings Screen**: Create navigation button
2. **Test Thoroughly**: Try all edge cases
3. **Add Profanity Filter**: Enhance validation function
4. **Monitor Usage**: Track username change patterns
5. **User Education**: Add help tooltips explaining the policy

This implementation provides a robust, secure, and user-friendly profile management system that maintains leaderboard integrity while giving users flexibility with avatars.
