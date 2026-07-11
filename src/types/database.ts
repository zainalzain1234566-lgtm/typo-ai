export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_path: string | null;
          instagram_username: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_path?: string | null;
          instagram_username?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_path?: string | null;
          instagram_username?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      brand_kits: {
        Row: {
          id: string;
          user_id: string;
          instagram_username: string | null;
          logo_path: string | null;
          primary_color: string | null;
          default_font: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          instagram_username?: string | null;
          logo_path?: string | null;
          primary_color?: string | null;
          default_font?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          instagram_username?: string | null;
          logo_path?: string | null;
          primary_color?: string | null;
          default_font?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          default_language: string;
          default_tone: string;
          default_level: string;
          default_size: string;
          default_slide_count: number;
          preferred_template_id: string | null;
          content_mode: string;
          telegram_bot_token: string | null;
          telegram_chat_id: string | null;
          telegram_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          default_language?: string;
          default_tone?: string;
          default_level?: string;
          default_size?: string;
          default_slide_count?: number;
          preferred_template_id?: string | null;
          content_mode?: string;
          telegram_bot_token?: string | null;
          telegram_chat_id?: string | null;
          telegram_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          default_language?: string;
          default_tone?: string;
          default_level?: string;
          default_size?: string;
          default_slide_count?: number;
          preferred_template_id?: string | null;
          content_mode?: string;
          telegram_bot_token?: string | null;
          telegram_chat_id?: string | null;
          telegram_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      templates: {
        Row: {
          id: string;
          slug: string;
          name_ar: string;
          description_ar: string | null;
          component_key: string;
          thumbnail_path: string | null;
          is_active: boolean;
          sort_order: number;
          supported_sizes: string[];
          supported_fonts: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_ar: string;
          description_ar?: string | null;
          component_key: string;
          thumbnail_path?: string | null;
          is_active?: boolean;
          sort_order?: number;
          supported_sizes: string[];
          supported_fonts: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name_ar?: string;
          description_ar?: string | null;
          component_key?: string;
          thumbnail_path?: string | null;
          is_active?: boolean;
          sort_order?: number;
          supported_sizes?: string[];
          supported_fonts?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      template_palettes: {
        Row: {
          id: string;
          template_id: string;
          name_ar: string;
          background_color: string;
          text_color: string;
          accent_color: string;
          secondary_color: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          name_ar: string;
          background_color: string;
          text_color: string;
          accent_color: string;
          secondary_color: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          name_ar?: string;
          background_color?: string;
          text_color?: string;
          accent_color?: string;
          secondary_color?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      favorite_templates: {
        Row: {
          user_id: string;
          template_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          template_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          template_id?: string;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          folder_id: string | null;
          template_id: string | null;
          palette_id: string | null;
          title: string;
          topic: string;
          content_type: string;
          target_audience: string | null;
          content_level: string;
          tone: string;
          language: string;
          size: string;
          width: number;
          height: number;
          slide_count: number;
          cta_type: string | null;
          font_family: string;
          use_brand_kit: boolean;
          show_logo: boolean;
          show_account_name: boolean;
          show_slide_number: boolean;
          logo_position: string;
          account_name_position: string;
          caption: string | null;
          hashtags: string | null;
          status: string;
          is_favorite: boolean;
          last_exported_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          folder_id?: string | null;
          template_id?: string | null;
          palette_id?: string | null;
          title: string;
          topic: string;
          content_type: string;
          target_audience?: string | null;
          content_level: string;
          tone: string;
          language: string;
          size: string;
          width: number;
          height: number;
          slide_count: number;
          cta_type?: string | null;
          font_family?: string;
          use_brand_kit?: boolean;
          show_logo?: boolean;
          show_account_name?: boolean;
          show_slide_number?: boolean;
          logo_position?: string;
          account_name_position?: string;
          caption?: string | null;
          hashtags?: string | null;
          status?: string;
          is_favorite?: boolean;
          last_exported_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          folder_id?: string | null;
          template_id?: string | null;
          palette_id?: string | null;
          title?: string;
          topic?: string;
          content_type?: string;
          target_audience?: string | null;
          content_level?: string;
          tone?: string;
          language?: string;
          size?: string;
          width?: number;
          height?: number;
          slide_count?: number;
          cta_type?: string | null;
          font_family?: string;
          use_brand_kit?: boolean;
          show_logo?: boolean;
          show_account_name?: boolean;
          show_slide_number?: boolean;
          logo_position?: string;
          account_name_position?: string;
          caption?: string | null;
          hashtags?: string | null;
          status?: string;
          is_favorite?: boolean;
          last_exported_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      slides: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          position: number;
          slide_type: string;
          title: string | null;
          body: string | null;
          cta_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          position: number;
          slide_type: string;
          title?: string | null;
          body?: string | null;
          cta_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          position?: number;
          slide_type?: string;
          title?: string | null;
          body?: string | null;
          cta_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      export_records: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          export_type: string;
          slide_id: string | null;
          file_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          export_type: string;
          slide_id?: string | null;
          file_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          export_type?: string;
          slide_id?: string | null;
          file_path?: string | null;
          created_at?: string;
        };
      };
      generation_jobs: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          provider: string | null;
          model: string | null;
          status: string;
          request_payload: Json | null;
          response_payload: Json | null;
          error_message: string | null;
          prompt_tokens: number | null;
          completion_tokens: number | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          provider?: string | null;
          model?: string | null;
          status?: string;
          request_payload?: Json | null;
          response_payload?: Json | null;
          error_message?: string | null;
          prompt_tokens?: number | null;
          completion_tokens?: number | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          provider?: string | null;
          model?: string | null;
          status?: string;
          request_payload?: Json | null;
          response_payload?: Json | null;
          error_message?: string | null;
          prompt_tokens?: number | null;
          completion_tokens?: number | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      account_usage: {
        Row: {
          user_id: string;
          projects_created: number;
          generations_used: number;
          exports_used: number;
          period_start: string;
          period_end: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          projects_created?: number;
          generations_used?: number;
          exports_used?: number;
          period_start?: string;
          period_end?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          projects_created?: number;
          generations_used?: number;
          exports_used?: number;
          period_start?: string;
          period_end?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: { [key: string]: never };
    Functions: {
      get_dashboard_stats: { Args: Record<string, never>; Returns: Json };
      reorder_project_slides: {
        Args: { p_project_id: string; p_ordered_slide_ids: string[] };
        Returns: Database["public"]["Tables"]["slides"]["Row"][];
      };
      duplicate_project: {
        Args: { p_project_id: string };
        Returns: string;
      };
      handle_new_user: { Args: Record<string, never>; Returns: never };
      update_updated_at: { Args: Record<string, never>; Returns: never };
    };
    Enums: { [key: string]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T];
