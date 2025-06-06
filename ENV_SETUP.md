# Environment Setup for Skrawl

## Quick Start

1. **Run the setup script**:
   ```bash
   npm run setup-env
   ```

2. **Follow the prompts** to enter your Supabase credentials

3. **Done!** Your `.env` file is ready and secure.

## Manual Setup

If you prefer to set up manually:

1. **Copy the template**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`** with your actual values:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://yazfoqqewzezwjigsuqq.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_key_here
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | ✅ |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google OAuth iOS client ID | ✅ |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google OAuth Android client ID | ✅ |
| `EXPO_PUBLIC_GOOGLE_REDIRECT_URL` | OAuth redirect URL | ✅ |
| `EXPO_PUBLIC_APP_ENV` | App environment (development/production) | ❌ |
| `EXPO_PUBLIC_API_TIMEOUT` | API timeout in milliseconds | ❌ |
| `EXPO_PUBLIC_REALTIME_EVENTS_PER_SECOND` | Realtime events rate limit | ❌ |

## Security Notes

- ✅ `.env` is in `.gitignore` - your credentials won't be committed
- ✅ All variables use `EXPO_PUBLIC_` prefix for Expo compatibility
- ✅ Validation checks ensure required variables are set
- ⚠️ Never commit your actual `.env` file to version control
- ⚠️ Use different keys for development/staging/production

## Getting Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `yazfoqqewzezwjigsuqq`
3. Navigate to **Settings > API**
4. Copy:
   - **URL**: `https://yazfoqqewzezwjigsuqq.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`

## Troubleshooting

### "Missing required environment variables" error
- Make sure your `.env` file exists
- Check that `EXPO_PUBLIC_SUPABASE_ANON_KEY` is not empty
- Restart your development server after changing `.env`

### "Invalid API key" error
- Double-check your anon key from Supabase dashboard
- Make sure there are no extra spaces or line breaks
- Verify the key starts with `eyJ`

### Environment variables not loading
- Ensure variables start with `EXPO_PUBLIC_`
- Restart your development server
- Clear Expo cache: `expo start --clear`

## Next Steps

After setting up your environment:

1. **Set up database tables** (see `setup-supabase.md`)
2. **Configure authentication** in Supabase Dashboard
3. **Test your setup**: `npm start`

## File Structure

```
Skrawl/
├── .env                 # Your actual credentials (gitignored)
├── .env.example         # Template file (committed)
├── src/config/env.ts    # Environment configuration loader
└── scripts/setup-env.js # Interactive setup script
```
