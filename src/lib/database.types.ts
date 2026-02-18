export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      card_definitions: {
        Row: {
          created_at: string
          discard_effect: Json
          id: string
          image_url: string | null
          is_starter: boolean
          name: string
          point_cost: number
          rarity: string
          stats: Json
          type: string
        }
        Insert: {
          created_at?: string
          discard_effect?: Json
          id: string
          image_url?: string | null
          is_starter?: boolean
          name: string
          point_cost: number
          rarity: string
          stats?: Json
          type: string
        }
        Update: {
          created_at?: string
          discard_effect?: Json
          id?: string
          image_url?: string | null
          is_starter?: boolean
          name?: string
          point_cost?: number
          rarity?: string
          stats?: Json
          type?: string
        }
        Relationships: []
      }
      deck_cards: {
        Row: {
          card_id: string
          deck_id: string
          id: string
          quantity: number
        }
        Insert: {
          card_id: string
          deck_id: string
          id?: string
          quantity?: number
        }
        Update: {
          card_id?: string
          deck_id?: string
          id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "deck_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "card_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      decks: {
        Row: {
          created_at: string
          id: string
          is_starter: boolean
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_starter?: boolean
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_starter?: boolean
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_players: {
        Row: {
          deck_id: string | null
          id: string
          is_ready: boolean
          room_id: string
          seat_order: number | null
          user_id: string
        }
        Insert: {
          deck_id?: string | null
          id?: string
          is_ready?: boolean
          room_id: string
          seat_order?: number | null
          user_id: string
        }
        Update: {
          deck_id?: string | null
          id?: string
          is_ready?: boolean
          room_id?: string
          seat_order?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_players_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rooms: {
        Row: {
          created_at: string
          host_id: string | null
          id: string
          max_players: number
          room_code: string
          status: string
        }
        Insert: {
          created_at?: string
          host_id?: string | null
          id?: string
          max_players?: number
          room_code: string
          status?: string
        }
        Update: {
          created_at?: string
          host_id?: string | null
          id?: string
          max_players?: number
          room_code?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_rooms_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_state: {
        Row: {
          active_player_id: string | null
          id: string
          phase: string
          room_id: string
          state: Json
          turn_number: number
          updated_at: string
        }
        Insert: {
          active_player_id?: string | null
          id?: string
          phase?: string
          room_id: string
          state?: Json
          turn_number?: number
          updated_at?: string
        }
        Update: {
          active_player_id?: string | null
          id?: string
          phase?: string
          room_id?: string
          state?: Json
          turn_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_state_active_player_id_fkey"
            columns: ["active_player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_state_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      match_history: {
        Row: {
          completed_at: string
          duration_seconds: number | null
          id: string
          room_id: string | null
          winner_id: string | null
        }
        Insert: {
          completed_at?: string
          duration_seconds?: number | null
          id?: string
          room_id?: string | null
          winner_id?: string | null
        }
        Update: {
          completed_at?: string
          duration_seconds?: number | null
          id?: string
          room_id?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_history_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_history_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_players: {
        Row: {
          id: string
          match_id: string
          placement: number
          salvaged_card_ids: string[]
          user_id: string
        }
        Insert: {
          id?: string
          match_id: string
          placement: number
          salvaged_card_ids?: string[]
          user_id: string
        }
        Update: {
          id?: string
          match_id?: string
          placement?: number
          salvaged_card_ids?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "match_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      packs: {
        Row: {
          id: string
          name: string
          rarity_weights: Json
        }
        Insert: {
          id: string
          name: string
          rarity_weights: Json
        }
        Update: {
          id?: string
          name?: string
          rarity_weights?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          is_guest: boolean
          scrap: number
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          is_guest?: boolean
          scrap?: number
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          is_guest?: boolean
          scrap?: number
          username?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          created_at: string
          id: string
          initiator_id: string
          offered_card_ids: string[]
          recipient_id: string
          requested_card_ids: string[]
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          initiator_id: string
          offered_card_ids: string[]
          recipient_id: string
          requested_card_ids: string[]
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          initiator_id?: string
          offered_card_ids?: string[]
          recipient_id?: string
          requested_card_ids?: string[]
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_collections: {
        Row: {
          card_id: string
          id: string
          is_starter: boolean
          quantity: number
          user_id: string
        }
        Insert: {
          card_id: string
          id?: string
          is_starter?: boolean
          quantity?: number
          user_id: string
        }
        Update: {
          card_id?: string
          id?: string
          is_starter?: boolean
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_collections_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "card_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

