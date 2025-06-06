// Database types for Supabase integration
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_type: 'emoji' | 'gif' | 'custom' | null;
          avatar_data: string | null;
          has_completed_profile_setup: boolean;
          username_changes_remaining: number;
          username_change_history: any[]; // JSONB array
          last_username_change: string | null;
          display_name_locked: boolean;
          total_score: number;
          games_played: number;
          games_won: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_type?: 'emoji' | 'gif' | 'custom' | null;
          avatar_data?: string | null;
          has_completed_profile_setup?: boolean;
          username_changes_remaining?: number;
          username_change_history?: any[];
          last_username_change?: string | null;
          display_name_locked?: boolean;
          total_score?: number;
          games_played?: number;
          games_won?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_type?: 'emoji' | 'gif' | 'custom' | null;
          avatar_data?: string | null;
          has_completed_profile_setup?: boolean;
          username_changes_remaining?: number;
          username_change_history?: any[];
          last_username_change?: string | null;
          display_name_locked?: boolean;
          total_score?: number;
          games_played?: number;
          games_won?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          creator_id: string;
          max_players: number;
          current_players: number;
          total_rounds: number;
          current_round: number;
          time_per_round: number;
          hints_enabled: number;
          status: 'waiting' | 'playing' | 'finished';
          is_public: boolean;
          game_code: string | null;
          custom_words: string[] | null;
          language: string;
          created_at: string;
          started_at: string | null;
          finished_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          creator_id: string;
          max_players?: number;
          current_players?: number;
          total_rounds?: number;
          current_round?: number;
          time_per_round?: number;
          hints_enabled?: number;
          status?: 'waiting' | 'playing' | 'finished';
          is_public?: boolean;
          game_code?: string | null;
          custom_words?: string[] | null;
          language?: string;
          created_at?: string;
          started_at?: string | null;
          finished_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          creator_id?: string;
          max_players?: number;
          current_players?: number;
          total_rounds?: number;
          current_round?: number;
          time_per_round?: number;
          hints_enabled?: number;
          status?: 'waiting' | 'playing' | 'finished';
          is_public?: boolean;
          game_code?: string | null;
          custom_words?: string[] | null;
          language?: string;
          created_at?: string;
          started_at?: string | null;
          finished_at?: string | null;
        };
      };
      game_players: {
        Row: {
          id: string;
          game_id: string;
          user_id: string;
          display_name: string;
          avatar_data: string | null;
          score: number;
          is_ready: boolean;
          is_current_drawer: boolean;
          turn_order: number | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          user_id: string;
          display_name: string;
          avatar_data?: string | null;
          score?: number;
          is_ready?: boolean;
          is_current_drawer?: boolean;
          turn_order?: number | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          user_id?: string;
          display_name?: string;
          avatar_data?: string | null;
          score?: number;
          is_ready?: boolean;
          is_current_drawer?: boolean;
          turn_order?: number | null;
          joined_at?: string;
        };
      };
      drawings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          drawing_data: any; // JSONB
          svg_data: string | null;
          is_public: boolean;
          likes_count: number;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          drawing_data: any;
          svg_data?: string | null;
          is_public?: boolean;
          likes_count?: number;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          drawing_data?: any;
          svg_data?: string | null;
          is_public?: boolean;
          likes_count?: number;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
