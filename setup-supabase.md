# Supabase Setup Guide for Skrawl

## Step 1: Get Your Supabase Credentials

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `yazfoqqewzezwjigsuqq`
3. **Go to Settings > API**
4. **Copy your credentials**:
   - Project URL: `https://yazfoqqewzezwjigsuqq.supabase.co`
   - Anon/Public Key: `eyJ...` (long string starting with eyJ)

## Step 2: Update Environment Configuration

### Option A: Automated Setup (Recommended)
```bash
npm run setup-env
```
This interactive script will guide you through setting up your `.env` file.

### Option B: Manual Setup
1. **Copy the environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Open**: `.env` file in your project root
3. **Replace**: `your_supabase_anon_key_here` with your actual anon key
4. **Save the file**

```bash
# .env file
EXPO_PUBLIC_SUPABASE_URL=https://yazfoqqewzezwjigsuqq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# ... rest of config
```

**Important**: The `.env` file is already in `.gitignore` to keep your credentials secure!

## Step 3: Set Up Database Tables

Run these SQL commands in your Supabase SQL Editor (Dashboard > SQL Editor):

### 1. Users Table (extends auth.users)
```sql
-- Create users table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_type TEXT CHECK (avatar_type IN ('emoji', 'gif', 'custom')),
  avatar_data TEXT,
  has_completed_profile_setup BOOLEAN DEFAULT FALSE,
  total_score INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 2. Create Function to Handle New User Registration
```sql
-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 4: Configure Authentication Settings

1. **Go to Authentication > Settings** in Supabase Dashboard
2. **Configure Email Templates**:
   - Enable "Confirm signup" template
   - Customize the email template for 6-digit codes
3. **Configure Auth Providers**:
   - Enable Google OAuth
   - Add your Google OAuth credentials:
     - iOS Client ID: `521406618633-qnlvheehuo39v8kojplskov57n52a3sh.apps.googleusercontent.com`
     - Android Client ID: `521406618633-3k31rl0mpfamqmacr9tgslb57nf9ucgg.apps.googleusercontent.com`
   - Set redirect URL: `skrawl://auth/callback`

## Step 5: Test the Setup

1. **Start your development server**:
   ```bash
   npm start
   ```

2. **Test email authentication**:
   - Try signing up with an email
   - Check if you receive the 6-digit verification code
   - Verify the code works

3. **Test Google authentication** (requires development build):
   - Build and install development build
   - Test Google Sign-in flow

## Step 6: Enable Realtime (for Phase 3)

1. **Go to Database > Replication** in Supabase Dashboard
2. **Enable realtime for tables** (when we create them in Phase 3):
   - `game_players`
   - `game_turns`
   - `chat_messages`
   - `game_guesses`

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**:
   - Double-check your anon key in `src/config/env.ts`
   - Make sure there are no extra spaces or characters

2. **Google Sign-in not working**:
   - Make sure you're using a development build, not Expo Go
   - Verify Google OAuth credentials in Supabase dashboard

3. **Email verification not working**:
   - Check your email spam folder
   - Verify email templates are enabled in Supabase
   - Check Supabase logs for any errors

4. **Database connection issues**:
   - Verify your project URL is correct
   - Check if RLS policies are properly configured

### Getting Help:

- Check Supabase logs in Dashboard > Logs
- Review the browser console for error messages
- Verify network connectivity to Supabase

## Next Steps

Once authentication is working:
1. ✅ Phase 1: Authentication System (Complete)
2. 🔄 Phase 2: Database Schema (Games, Players, etc.)
3. 🔄 Phase 3: Real-time Multiplayer
4. 🔄 Phase 4: Game Logic Backend

The authentication foundation is now ready for building the multiplayer game features!
