# Skrawl Game Database Setup

This directory contains the complete database schema for the Skrawl drawing game app.

## Quick Start (For Profile Setup)

**To fix the profile setup error immediately:**

1. Go to your Supabase dashboard → SQL Editor
2. Run **`00-quick-setup.sql`** first
3. Test your profile setup in the app

## Full Setup (For Complete Game Features)

Run these files **in order** in the Supabase SQL Editor:

### 1. `01-tables.sql` - Core Tables
- `users` - User profiles and stats
- `game_rooms` - Game sessions with room codes
- `game_participants` - Players in games
- `drawings` - Canvas drawings with ratings
- `drawing_ratings` - Like/dislike system
- `chat_messages` - In-game chat with guess tracking
- `words` - Drawing prompts by difficulty
- `leaderboard` view - Ranked player stats

### 2. `02-security.sql` - Row Level Security
- RLS policies for all tables
- User data protection
- Secure multiplayer game access
- Proper authentication checks

### 3. `03-functions.sql` - Game Logic
- Auto-updating participant counts
- Like/dislike rating system
- Timestamp triggers
- Game state management

### 4. `04-sample-data.sql` - Sample Words
- 60 drawing words (easy/medium/hard)
- Categories: animals, vehicles, objects, nature, food, events, places, concepts, science
- Ready-to-use game content

### 5. `05-indexes.sql` - Performance
- Database indexes for fast queries
- Optimized for multiplayer games
- Leaderboard performance
- Chat message retrieval

## Database Schema Overview

```
users (profiles & stats)
├── game_rooms (game sessions)
│   ├── game_participants (players)
│   ├── drawings (canvas art)
│   │   └── drawing_ratings (likes/dislikes)
│   └── chat_messages (chat & guesses)
└── words (drawing prompts)
```

## Features Included

✅ **Authentication**: User profiles with avatars  
✅ **Multiplayer**: Room-based games with codes  
✅ **Drawing**: Canvas data storage with ratings  
✅ **Chat**: In-game messaging with guess detection  
✅ **Leaderboard**: Player rankings and stats  
✅ **Security**: Row-level security policies  
✅ **Performance**: Optimized indexes  

## Usage Notes

- **Start with `00-quick-setup.sql`** to fix profile setup immediately
- Run other files when implementing game features
- All tables have proper foreign key relationships
- RLS ensures users only access their authorized data
- Sample words provide immediate game content

## Troubleshooting

**Profile Setup Error**: Run `00-quick-setup.sql`  
**Game Features**: Run files 01-05 in order  
**Performance Issues**: Ensure `05-indexes.sql` is applied  
**Security Concerns**: Verify `02-security.sql` policies are active
