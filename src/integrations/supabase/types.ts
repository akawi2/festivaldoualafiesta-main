export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
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
      activity_registrations: {
        Row: {
          age: number
          commercial_name: string
          created_at: string
          discipline: string
          district: string
          experience_years: number
          full_name: string
          id: string
          phone: string
          status: string
          submitter_fingerprint: string | null
          submitter_ip: string | null
          updated_at: string
          weight_category: string | null
        }
        Insert: {
          age: number
          commercial_name: string
          created_at?: string
          discipline: string
          district: string
          experience_years: number
          full_name: string
          id?: string
          phone: string
          status?: string
          submitter_fingerprint?: string | null
          submitter_ip?: string | null
          updated_at?: string
          weight_category?: string | null
        }
        Update: {
          age?: number
          commercial_name?: string
          created_at?: string
          discipline?: string
          district?: string
          experience_years?: number
          full_name?: string
          id?: string
          phone?: string
          status?: string
          submitter_fingerprint?: string | null
          submitter_ip?: string | null
          updated_at?: string
          weight_category?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          password_hash: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          password_hash: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          password_hash?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      emails: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      gallery_categories: {
        Row: {
          created_at: string
          description_en: string | null
          description_fr: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          name_en: string | null
          place_it: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          name_en?: string | null
          place_it?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          name_en?: string | null
          place_it?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          category: string
          created_at: string
          description_en: string | null
          description_fr: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kwatt_hero_likes: {
        Row: {
          created_at: string
          hero_id: string
          id: string
          session_id: string | null
          user_agent: string | null
          voter_fingerprint: string | null
          voter_ip: string | null
        }
        Insert: {
          created_at?: string
          hero_id: string
          id?: string
          session_id?: string | null
          user_agent?: string | null
          voter_fingerprint?: string | null
          voter_ip?: string | null
        }
        Update: {
          created_at?: string
          hero_id?: string
          id?: string
          session_id?: string | null
          user_agent?: string | null
          voter_fingerprint?: string | null
          voter_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kwatt_hero_likes_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "kwatt_heroes"
            referencedColumns: ["id"]
          },
        ]
      }
      kwatt_heroes: {
        Row: {
          category: string
          created_at: string
          description_en: string | null
          description_fr: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          likes_count: number
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          likes_count?: number
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          likes_count?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      miss_candidates: {
        Row: {
          age: number | null
          city: string | null
          created_at: string
          description: string | null
          description_en: string | null
          description_fr: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          updated_at: string
          votes_count: number | null
        }
        Insert: {
          age?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          updated_at?: string
          votes_count?: number | null
        }
        Update: {
          age?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          updated_at?: string
          votes_count?: number | null
        }
        Relationships: []
      }
      miss_gallery_images: {
        Row: {
          category: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          miss_candidate_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          miss_candidate_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          miss_candidate_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "miss_gallery_images_miss_candidate_id_fkey"
            columns: ["miss_candidate_id"]
            isOneToOne: false
            referencedRelation: "miss_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      miss_registrations: {
        Row: {
          age: number | null
          auth_url: string | null
          borough: string | null
          card_url: string | null
          city: string | null
          created_at: string
          "date de naissance": string | null
          description: string | null
          district: string | null
          email: string | null
          experience: string | null
          first_name: string | null
          hobbies: string | null
          id: string
          image_url: string | null
          name: string
          phone: string | null
          profession: string | null
          status: string
          submitter_fingerprint: string | null
          submitter_ip: string | null
          taille: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          auth_url?: string | null
          borough?: string | null
          card_url?: string | null
          city?: string | null
          created_at?: string
          "date de naissance"?: string | null
          description?: string | null
          district?: string | null
          email?: string | null
          experience?: string | null
          first_name?: string | null
          hobbies?: string | null
          id?: string
          image_url?: string | null
          name: string
          phone?: string | null
          profession?: string | null
          status?: string
          submitter_fingerprint?: string | null
          submitter_ip?: string | null
          taille?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          auth_url?: string | null
          borough?: string | null
          card_url?: string | null
          city?: string | null
          created_at?: string
          "date de naissance"?: string | null
          description?: string | null
          district?: string | null
          email?: string | null
          experience?: string | null
          first_name?: string | null
          hobbies?: string | null
          id?: string
          image_url?: string | null
          name?: string
          phone?: string | null
          profession?: string | null
          status?: string
          submitter_fingerprint?: string | null
          submitter_ip?: string | null
          taille?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      miss_votes: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          session_id: string | null
          user_agent: string | null
          vote_day: string
          vote_type: string | null
          voter_fingerprint: string | null
          voter_ip: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          session_id?: string | null
          user_agent?: string | null
          vote_day?: string
          vote_type?: string | null
          voter_fingerprint?: string | null
          voter_ip?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          session_id?: string | null
          user_agent?: string | null
          vote_day?: string
          vote_type?: string | null
          voter_fingerprint?: string | null
          voter_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "miss_votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "miss_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_catalog: {
        Row: {
          category: string | null
          display_order: number
          key: string
          kind: string
          label_en: string
          label_fr: string
          price_fcfa: number | null
        }
        Insert: {
          category?: string | null
          display_order?: number
          key: string
          kind: string
          label_en: string
          label_fr: string
          price_fcfa?: number | null
        }
        Update: {
          category?: string | null
          display_order?: number
          key?: string
          kind?: string
          label_en?: string
          label_fr?: string
          price_fcfa?: number | null
        }
        Relationships: []
      }
      partner_subscriptions: {
        Row: {
          activity_sector: string | null
          contribution_details: string | null
          contribution_type: string | null
          created_at: string
          email: string
          id: string
          items: Json
          kind: string
          organization_name: string
          phone: string
          representative_name: string
          representative_position: string | null
          status: string
          submitter_fingerprint: string | null
          submitter_ip: string | null
          total_price: number
          updated_at: string
        }
        Insert: {
          activity_sector?: string | null
          contribution_details?: string | null
          contribution_type?: string | null
          created_at?: string
          email: string
          id?: string
          items?: Json
          kind: string
          organization_name: string
          phone: string
          representative_name: string
          representative_position?: string | null
          status?: string
          submitter_fingerprint?: string | null
          submitter_ip?: string | null
          total_price?: number
          updated_at?: string
        }
        Update: {
          activity_sector?: string | null
          contribution_details?: string | null
          contribution_type?: string | null
          created_at?: string
          email?: string
          id?: string
          items?: Json
          kind?: string
          organization_name?: string
          phone?: string
          representative_name?: string
          representative_position?: string | null
          status?: string
          submitter_fingerprint?: string | null
          submitter_ip?: string | null
          total_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          partner_type: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          partner_type: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          partner_type?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      program_events: {
        Row: {
          artist_name: string
          created_at: string
          description_en: string | null
          description_fr: string | null
          end_time: string
          event_type: string
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          stage: string
          start_time: string
          ticket_info: string | null
          title: string
          updated_at: string
        }
        Insert: {
          artist_name: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          end_time: string
          event_type?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          stage?: string
          start_time: string
          ticket_info?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          artist_name?: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          end_time?: string
          event_type?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          stage?: string
          start_time?: string
          ticket_info?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          created_at: string
          email: string
          event_type: string | null
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          event_type?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          event_type?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          category: string | null
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      spot_bookings: {
        Row: {
          created_at: string
          event_site: string
          festival_day: string
          first_name: string
          id: string
          last_name: string
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_site: string
          festival_day: string
          first_name: string
          id?: string
          last_name: string
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_site?: string
          festival_day?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      stand_reservations: {
        Row: {
          activity_sector: string | null
          created_at: string
          email: string | null
          id: string
          payment_status: string
          price_fcfa: number | null
          price_total: number | null
          quantity: number
          representative_name: string | null
          representative_position: string | null
          stand_name: string
          stand_phone: string
          stand_type: string
          status: string
          submitter_fingerprint: string | null
          submitter_ip: string | null
          total_price: number | null
          updated_at: string
        }
        Insert: {
          activity_sector?: string | null
          created_at?: string
          email?: string | null
          id?: string
          payment_status?: string
          price_fcfa?: number | null
          price_total?: number | null
          quantity?: number
          representative_name?: string | null
          representative_position?: string | null
          stand_name: string
          stand_phone: string
          stand_type: string
          status?: string
          submitter_fingerprint?: string | null
          submitter_ip?: string | null
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          activity_sector?: string | null
          created_at?: string
          email?: string | null
          id?: string
          payment_status?: string
          price_fcfa?: number | null
          price_total?: number | null
          quantity?: number
          representative_name?: string | null
          representative_position?: string | null
          stand_name?: string
          stand_phone?: string
          stand_type?: string
          status?: string
          submitter_fingerprint?: string | null
          submitter_ip?: string | null
          total_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      talent_submissions: {
        Row: {
          arrondissement: string | null
          created_at: string
          id: string
          name: string
          participation_type: string
          phone: string | null
          quartier: string | null
          stage_name: string
          status: string
          talent_description: string
          updated_at: string
        }
        Insert: {
          arrondissement?: string | null
          created_at?: string
          id?: string
          name: string
          participation_type: string
          phone?: string | null
          quartier?: string | null
          stage_name: string
          status?: string
          talent_description: string
          updated_at?: string
        }
        Update: {
          arrondissement?: string | null
          created_at?: string
          id?: string
          name?: string
          participation_type?: string
          phone?: string | null
          quartier?: string | null
          stage_name?: string
          status?: string
          talent_description?: string
          updated_at?: string
        }
        Relationships: []
      }
      voting_sessions: {
        Row: {
          created_at: string
          id: string
          last_vote_at: string | null
          session_id: string
          voter_fingerprint: string | null
          voter_ip: string | null
          votes_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_vote_at?: string | null
          session_id: string
          voter_fingerprint?: string | null
          voter_ip?: string | null
          votes_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          last_vote_at?: string | null
          session_id?: string
          voter_fingerprint?: string | null
          voter_ip?: string | null
          votes_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_user: {
        Args: {
          p_acting_email: string
          p_acting_password: string
          p_email: string
          p_is_active?: boolean
          p_name: string
          p_password: string
          p_role?: string
        }
        Returns: string
      }
      admin_delete_partner: { Args: { p_id: string }; Returns: boolean }
      admin_delete_user: {
        Args: {
          p_acting_email: string
          p_acting_password: string
          p_id: string
        }
        Returns: undefined
      }
      admin_get_gallery_images: {
        Args: never
        Returns: {
          category: string
          created_at: string
          description_en: string | null
          description_fr: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          title: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "gallery_images"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_get_partners: {
        Args: never
        Returns: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          logo_url: string
          name: string
          partner_type: string
          updated_at: string
          website_url: string
        }[]
      }
      admin_list_activity_registrations: {
        Args: never
        Returns: {
          age: number
          commercial_name: string
          created_at: string
          discipline: string
          district: string
          experience_years: number
          full_name: string
          id: string
          phone: string
          status: string
          submitter_fingerprint: string | null
          submitter_ip: string | null
          updated_at: string
          weight_category: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "activity_registrations"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_list_partner_subscriptions: {
        Args: never
        Returns: {
          activity_sector: string | null
          contribution_details: string | null
          contribution_type: string | null
          created_at: string
          email: string
          id: string
          items: Json
          kind: string
          organization_name: string
          phone: string
          representative_name: string
          representative_position: string | null
          status: string
          submitter_fingerprint: string | null
          submitter_ip: string | null
          total_price: number
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "partner_subscriptions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_list_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          role: string
          updated_at: string
        }[]
      }
      admin_login: {
        Args: { p_email: string; p_password: string }
        Returns: {
          email: string
          id: string
          is_active: boolean
          name: string
          role: string
        }[]
      }
      admin_reset_miss_votes: { Args: never; Returns: undefined }
      admin_toggle_partner_active: {
        Args: { p_id: string; p_is_active: boolean }
        Returns: boolean
      }
      admin_update_activity_registration_status: {
        Args: { p_id: string; p_status: string }
        Returns: undefined
      }
      admin_update_partner_subscription_status: {
        Args: { p_id: string; p_status: string }
        Returns: undefined
      }
      admin_update_program_event: {
        Args: {
          p_artist_name: string
          p_description_en?: string
          p_description_fr?: string
          p_end_time: string
          p_event_type: string
          p_id: string
          p_image_url?: string
          p_is_active?: boolean
          p_is_featured?: boolean
          p_stage: string
          p_start_time: string
          p_ticket_info?: string
          p_title: string
        }
        Returns: string
      }
      admin_update_stand_payment_status: {
        Args: { p_id: string; p_payment_status: string }
        Returns: undefined
      }
      admin_update_stand_status: {
        Args: { p_id: string; p_status: string }
        Returns: undefined
      }
      admin_update_talent_status: {
        Args: { p_id: string; p_status: string }
        Returns: undefined
      }
      admin_update_user: {
        Args: {
          p_acting_email: string
          p_acting_password: string
          p_email: string
          p_id: string
          p_is_active: boolean
          p_name: string
          p_role: string
        }
        Returns: undefined
      }
      admin_update_user_password: {
        Args: {
          p_acting_email: string
          p_acting_password: string
          p_id: string
          p_new_password: string
        }
        Returns: undefined
      }
      admin_upsert_gallery_image: {
        Args: {
          p_category: string
          p_description_en?: string
          p_description_fr?: string
          p_display_order?: number
          p_id?: string
          p_image_url: string
          p_is_active?: boolean
          p_title: string
        }
        Returns: string
      }
      admin_upsert_miss_candidate: {
        Args: {
          p_age: number
          p_city: string
          p_description_en?: string
          p_description_fr: string
          p_id?: string
          p_image_url?: string
          p_is_active?: boolean
          p_name: string
        }
        Returns: string
      }
      admin_upsert_partner: {
        Args: {
          p_display_order?: number
          p_id?: string
          p_is_active?: boolean
          p_logo_url?: string
          p_name: string
          p_partner_type: string
          p_website_url?: string
        }
        Returns: string
      }
      admin_verify_credentials: {
        Args: { p_email: string; p_password: string }
        Returns: boolean
      }
      create_miss_candidate: {
        Args: {
          p_age: number
          p_city: string
          p_description: string
          p_image_url: string
          p_is_active: boolean
          p_name: string
        }
        Returns: string
      }
      create_program_event: {
        Args: {
          p_artist_name: string
          p_description: string
          p_end_time: string
          p_event_type: string
          p_image_url: string
          p_is_active: boolean
          p_is_featured: boolean
          p_stage: string
          p_start_time: string
          p_ticket_info: string
          p_title: string
        }
        Returns: string
      }
      increment_candidate_votes: {
        Args: { candidate_uuid: string }
        Returns: undefined
      }
      increment_hero_likes: { Args: { hero_uuid: string }; Returns: undefined }
      submit_activity_registration: {
        Args: {
          p_age: number
          p_commercial_name: string
          p_discipline: string
          p_district: string
          p_experience_years: number
          p_fingerprint?: string
          p_full_name: string
          p_ip?: string
          p_phone: string
          p_weight_category?: string
        }
        Returns: string
      }
      submit_miss_registration:
        | {
            Args: {
              p_age: number
              p_city: string
              p_description: string
              p_email: string
              p_experience: string
              p_hobbies: string
              p_name: string
              p_phone: string
            }
            Returns: string
          }
        | {
            Args: {
              p_age: number
              p_city: string
              p_description: string
              p_email: string
              p_experience: string
              p_hobbies: string
              p_name: string
              p_phone: string
              p_taille?: string
            }
            Returns: string
          }
      submit_partner_subscription: {
        Args: {
          p_activity_sector: string
          p_contribution_details?: string
          p_contribution_type?: string
          p_email: string
          p_fingerprint?: string
          p_ip?: string
          p_item_keys: string[]
          p_kind: string
          p_organization_name: string
          p_phone: string
          p_representative_name: string
          p_representative_position: string
        }
        Returns: string
      }
      submit_quote_request: {
        Args: {
          p_email: string
          p_event_type: string
          p_message: string
          p_name: string
          p_phone: string
        }
        Returns: string
      }
      submit_spot_booking: {
        Args: {
          p_event_site: string
          p_festival_day: string
          p_first_name: string
          p_last_name: string
          p_phone: string
        }
        Returns: string
      }
      submit_stand_reservation: {
        Args: {
          p_activity_sector?: string
          p_email?: string
          p_fingerprint?: string
          p_ip?: string
          p_price_fcfa?: number
          p_quantity?: number
          p_representative_name?: string
          p_representative_position?: string
          p_stand_name: string
          p_stand_phone: string
          p_stand_type: string
          p_total_price?: number
        }
        Returns: string
      }
      submit_talent_application: {
        Args: {
          p_arrondissement: string
          p_name: string
          p_participation_type: string
          p_phone: string
          p_quartier: string
          p_stage_name: string
          p_talent_description: string
        }
        Returns: string
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
