import { supabase } from './supabase';

// Types for game service
export interface GameRoom {
  id: string;
  room_code: string;
  host_id: string;
  game_mode: 'classic' | 'drawing_battle';
  max_players: number;
  current_players: number;
  status: 'waiting' | 'in_progress' | 'finished';
  current_round: number;
  max_rounds: number;
  round_duration: number;
  current_drawer_id?: string;
  current_word?: string;
  created_at: string;
  updated_at: string;
}

export interface GameParticipant {
  id: string;
  room_id: string;
  user_id: string;
  score: number;
  has_guessed_correctly: boolean;
  joined_at: string;
}

export interface GameWithParticipants extends GameRoom {
  participants: Array<GameParticipant & {
    display_name: string;
  }>;
}

export interface CreateGameRequest {
  gameMode: 'classic' | 'drawing_battle';
  maxPlayers: number;
  maxRounds: number;
  roundDuration: number;
  isPublic: boolean;
}

export interface Word {
  id: string;
  word: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  is_active: boolean;
}

class GameService {
  // Generate a unique 6-character room code
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Create a new game room
  async createGame(userId: string, gameData: CreateGameRequest): Promise<GameWithParticipants | null> {
    try {
      // Generate unique room code
      let roomCode = this.generateRoomCode();
      let isUnique = false;
      let attempts = 0;
      
      // Ensure room code is unique (max 5 attempts)
      while (!isUnique && attempts < 5) {
        const { data: existing } = await supabase
          .from('game_rooms')
          .select('id')
          .eq('room_code', roomCode)
          .single();
        
        if (!existing) {
          isUnique = true;
        } else {
          roomCode = this.generateRoomCode();
          attempts++;
        }
      }

      if (!isUnique) {
        throw new Error('Failed to generate unique room code');
      }

      // Create the game room
      const { data: gameRoom, error: gameError } = await supabase
        .from('game_rooms')
        .insert({
          room_code: roomCode,
          host_id: userId,
          game_mode: gameData.gameMode,
          max_players: gameData.maxPlayers,
          max_rounds: gameData.maxRounds,
          round_duration: gameData.roundDuration,
          current_players: 1, // Host is automatically added
        })
        .select()
        .single();

      if (gameError || !gameRoom) {
        throw gameError || new Error('Failed to create game room');
      }

      // Add the host as a participant
      const { data: participant, error: participantError } = await supabase
        .from('game_participants')
        .insert({
          room_id: gameRoom.id,
          user_id: userId,
        })
        .select(`
          *,
          users!inner(display_name)
        `)
        .single();

      if (participantError || !participant) {
        // Clean up the game room if participant creation fails
        await supabase.from('game_rooms').delete().eq('id', gameRoom.id);
        throw participantError || new Error('Failed to add host as participant');
      }

      // Return the complete game with participants
      return {
        ...gameRoom,
        participants: [{
          ...participant,
          display_name: (participant as any).users?.display_name || 'Host',
        }],
      } as GameWithParticipants;
    } catch (error) {
      console.error('Error creating game:', error);
      return null;
    }
  }

  // Load public games (games that are waiting for players)
  async loadPublicGames(): Promise<GameWithParticipants[]> {
    try {
      const { data: games, error } = await supabase
        .from('game_rooms')
        .select(`
          *,
          game_participants(
            *,
            users!inner(display_name)
          )
        `)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!games) {
        return [];
      }

      return games
        .filter(game => game.current_players < game.max_players)
        .map(game => ({
          ...game,
          participants: (game.game_participants || []).map((p: any) => ({
            ...p,
            display_name: p.users?.display_name || 'Unknown',
          })),
        })) as GameWithParticipants[];
    } catch (error) {
      console.error('Error loading public games:', error);
      return [];
    }
  }

  // Join a game by game ID
  async joinGame(gameId: string, userId: string): Promise<GameWithParticipants | null> {
    try {
      // First check if the game exists and has space
      const { data: gameRoom, error: gameError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', gameId)
        .eq('status', 'waiting')
        .single();

      if (gameError || !gameRoom) {
        throw new Error('Game not found or not available');
      }

      if (gameRoom.current_players >= gameRoom.max_players) {
        throw new Error('Game is full');
      }

      // Check if user is already in the game
      const { data: existingParticipant } = await supabase
        .from('game_participants')
        .select('id')
        .eq('room_id', gameId)
        .eq('user_id', userId)
        .single();

      if (existingParticipant) {
        throw new Error('User is already in this game');
      }

      // Add user as participant
      const { error: participantError } = await supabase
        .from('game_participants')
        .insert({
          room_id: gameId,
          user_id: userId,
        });

      if (participantError) {
        throw participantError;
      }

      // Update current players count
      const { error: updateError } = await supabase
        .from('game_rooms')
        .update({
          current_players: gameRoom.current_players + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gameId);

      if (updateError) {
        throw updateError;
      }

      // Return the updated game with all participants
      return await this.getGameById(gameId);
    } catch (error) {
      console.error('Error joining game:', error);
      return null;
    }
  }

  // Join a private game by room code
  async joinPrivateGame(roomCode: string, userId: string): Promise<GameWithParticipants | null> {
    try {
      // Find the game by room code
      const { data: gameRoom, error: gameError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .eq('status', 'waiting')
        .single();

      if (gameError || !gameRoom) {
        throw new Error('Game not found with this room code');
      }

      // Use the existing joinGame method
      return await this.joinGame(gameRoom.id, userId);
    } catch (error) {
      console.error('Error joining private game:', error);
      return null;
    }
  }

  // Get a game by ID with all participants
  async getGameById(gameId: string): Promise<GameWithParticipants | null> {
    try {
      const { data: game, error } = await supabase
        .from('game_rooms')
        .select(`
          *,
          game_participants(
            *,
            users!inner(display_name)
          )
        `)
        .eq('id', gameId)
        .single();

      if (error || !game) {
        return null;
      }

      return {
        ...game,
        participants: (game.game_participants || []).map((p: any) => ({
          ...p,
          display_name: p.users?.display_name || 'Unknown',
        })),
      } as GameWithParticipants;
    } catch (error) {
      console.error('Error getting game by ID:', error);
      return null;
    }
  }

  // Get a random word for drawing prompts
  async getRandomWord(difficulty?: 'easy' | 'medium' | 'hard'): Promise<string> {
    try {
      let query = supabase
        .from('words')
        .select('word')
        .eq('is_active', true);

      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      const { data: words, error } = await query;

      if (error || !words || words.length === 0) {
        // Fallback words if database query fails
        const fallbackWords = ['cat', 'dog', 'house', 'tree', 'car', 'sun', 'moon', 'star'];
        return fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
      }

      const randomIndex = Math.floor(Math.random() * words.length);
      return words[randomIndex]?.word || 'cat';
    } catch (error) {
      console.error('Error getting random word:', error);
      return 'cat'; // Ultimate fallback
    }
  }

  // Leave a game
  async leaveGame(gameId: string, userId: string): Promise<boolean> {
    try {
      // Remove participant
      const { error: participantError } = await supabase
        .from('game_participants')
        .delete()
        .eq('room_id', gameId)
        .eq('user_id', userId);

      if (participantError) {
        throw participantError;
      }

      // Update current players count
      const { data: gameRoom, error: gameError } = await supabase
        .from('game_rooms')
        .select('current_players, host_id')
        .eq('id', gameId)
        .single();

      if (gameError || !gameRoom) {
        return false;
      }

      const newPlayerCount = Math.max(0, gameRoom.current_players - 1);

      // If the host left and there are other players, assign new host
      if (gameRoom.host_id === userId && newPlayerCount > 0) {
        const { data: remainingParticipants } = await supabase
          .from('game_participants')
          .select('user_id')
          .eq('room_id', gameId)
          .limit(1);

        if (remainingParticipants && remainingParticipants.length > 0) {
          await supabase
            .from('game_rooms')
            .update({
              host_id: remainingParticipants[0].user_id,
              current_players: newPlayerCount,
              updated_at: new Date().toISOString(),
            })
            .eq('id', gameId);
        }
      } else if (newPlayerCount === 0) {
        // Delete the game if no players left
        await supabase
          .from('game_rooms')
          .delete()
          .eq('id', gameId);
      } else {
        // Just update player count
        await supabase
          .from('game_rooms')
          .update({
            current_players: newPlayerCount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', gameId);
      }

      return true;
    } catch (error) {
      console.error('Error leaving game:', error);
      return false;
    }
  }
}

export const gameService = new GameService();
