export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      platform_admins: {
        Row: {
          id: string;
          auth_user_id: string;
          full_name: string;
          role: "super_admin" | "accountant" | "support";
          preferred_language: "ar" | "en";
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          full_name: string;
          role: "super_admin" | "accountant" | "support";
          preferred_language?: "ar" | "en";
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          full_name?: string;
          role?: "super_admin" | "accountant" | "support";
          preferred_language?: "ar" | "en";
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      clinic_types: {
        Row: {
          id: string;
          code: string;
          name_ar: string;
          name_en: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name_ar: string;
          name_en: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name_ar?: string;
          name_en?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      features: {
        Row: {
          id: string;
          code: string;
          name_ar: string;
          name_en: string;
          description_ar: string | null;
          description_en: string | null;
          category: string;
          base_price_egp: number | null;
          applicable_clinic_type_ids: string[] | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name_ar: string;
          name_en: string;
          description_ar?: string | null;
          description_en?: string | null;
          category: string;
          base_price_egp?: number | null;
          applicable_clinic_type_ids?: string[] | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name_ar?: string;
          name_en?: string;
          description_ar?: string | null;
          description_en?: string | null;
          category?: string;
          base_price_egp?: number | null;
          applicable_clinic_type_ids?: string[] | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          code: string;
          name_ar: string;
          name_en: string;
          price_egp: number;
          billing_cycle: "monthly" | "yearly";
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name_ar: string;
          name_en: string;
          price_egp: number;
          billing_cycle: "monthly" | "yearly";
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name_ar?: string;
          name_en?: string;
          price_egp?: number;
          billing_cycle?: "monthly" | "yearly";
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      plan_features: {
        Row: {
          plan_id: string;
          feature_id: string;
        };
        Insert: {
          plan_id: string;
          feature_id: string;
        };
        Update: {
          plan_id?: string;
          feature_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plan_features_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plan_features_feature_id_fkey";
            columns: ["feature_id"];
            isOneToOne: false;
            referencedRelation: "features";
            referencedColumns: ["id"];
          }
        ];
      };
      plan_limits: {
        Row: {
          id: string;
          plan_id: string;
          limit_type: "provider_seats" | "patients" | "staff_accounts";
          max_value: number | null;
        };
        Insert: {
          id?: string;
          plan_id: string;
          limit_type: "provider_seats" | "patients" | "staff_accounts";
          max_value?: number | null;
        };
        Update: {
          id?: string;
          plan_id?: string;
          limit_type?: "provider_seats" | "patients" | "staff_accounts";
          max_value?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "plan_limits_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          }
        ];
      };
      clinics: {
        Row: {
          id: string;
          name: string;
          clinic_type_id: string;
          owner_full_name: string;
          owner_email: string;
          owner_phone: string;
          status: "trial" | "active" | "past_due" | "suspended" | "cancelled";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          clinic_type_id: string;
          owner_full_name: string;
          owner_email: string;
          owner_phone: string;
          status: "trial" | "active" | "past_due" | "suspended" | "cancelled";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          clinic_type_id?: string;
          owner_full_name?: string;
          owner_email?: string;
          owner_phone?: string;
          status?: "trial" | "active" | "past_due" | "suspended" | "cancelled";
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clinics_clinic_type_id_fkey";
            columns: ["clinic_type_id"];
            isOneToOne: false;
            referencedRelation: "clinic_types";
            referencedColumns: ["id"];
          }
        ];
      };
      clinic_subscriptions: {
        Row: {
          id: string;
          clinic_id: string;
          plan_id: string;
          status: "trial" | "active" | "past_due" | "cancelled";
          price_locked_egp: number;
          discount_code_id: string | null;
          trial_ends_at: string | null;
          current_period_start: string;
          current_period_end: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          plan_id: string;
          status: "trial" | "active" | "past_due" | "cancelled";
          price_locked_egp: number;
          discount_code_id?: string | null;
          trial_ends_at?: string | null;
          current_period_start: string;
          current_period_end: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          plan_id?: string;
          status?: "trial" | "active" | "past_due" | "cancelled";
          price_locked_egp?: number;
          discount_code_id?: string | null;
          trial_ends_at?: string | null;
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clinic_subscriptions_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinic_subscriptions_discount_code_id_fkey";
            columns: ["discount_code_id"];
            isOneToOne: false;
            referencedRelation: "discount_codes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinic_subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          }
        ];
      };
      account_feature_overrides: {
        Row: {
          id: string;
          clinic_id: string;
          feature_id: string;
          override_type: "grant" | "revoke";
          price_addon_egp: number | null;
          note: string | null;
          granted_by: string;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          feature_id: string;
          override_type: "grant" | "revoke";
          price_addon_egp?: number | null;
          note?: string | null;
          granted_by: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          feature_id?: string;
          override_type?: "grant" | "revoke";
          price_addon_egp?: number | null;
          note?: string | null;
          granted_by?: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "account_feature_overrides_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "account_feature_overrides_feature_id_fkey";
            columns: ["feature_id"];
            isOneToOne: false;
            referencedRelation: "features";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "account_feature_overrides_granted_by_fkey";
            columns: ["granted_by"];
            isOneToOne: false;
            referencedRelation: "platform_admins";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: {
          id: string;
          clinic_id: string;
          subscription_id: string | null;
          amount_egp: number;
          payment_method: "bank_transfer" | "cash" | "vodafone_cash" | "instapay" | "other";
          status: "pending" | "confirmed" | "failed";
          reference_note: string | null;
          recorded_by: string;
          paid_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          subscription_id?: string | null;
          amount_egp: number;
          payment_method: "bank_transfer" | "cash" | "vodafone_cash" | "instapay" | "other";
          status: "pending" | "confirmed" | "failed";
          reference_note?: string | null;
          recorded_by: string;
          paid_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          subscription_id?: string | null;
          amount_egp?: number;
          payment_method?: "bank_transfer" | "cash" | "vodafone_cash" | "instapay" | "other";
          status?: "pending" | "confirmed" | "failed";
          reference_note?: string | null;
          recorded_by?: string;
          paid_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "clinic_subscriptions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "platform_admins";
            referencedColumns: ["id"];
          }
        ];
      };
      usage_logs: {
        Row: {
          id: string;
          clinic_id: string;
          usage_type: "ai_tokens" | "whatsapp_messages" | "sms";
          quantity: number;
          period_month: string;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          usage_type: "ai_tokens" | "whatsapp_messages" | "sms";
          quantity: number;
          period_month: string;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          usage_type?: "ai_tokens" | "whatsapp_messages" | "sms";
          quantity?: number;
          period_month?: string;
          recorded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "usage_logs_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          }
        ];
      };
      upgrade_requests: {
        Row: {
          id: string;
          clinic_id: string;
          feature_id: string | null;
          requested_by_name: string | null;
          message: string | null;
          status: "open" | "contacted" | "resolved";
          created_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          feature_id?: string | null;
          requested_by_name?: string | null;
          message?: string | null;
          status?: "open" | "contacted" | "resolved";
          created_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          feature_id?: string | null;
          requested_by_name?: string | null;
          message?: string | null;
          status?: "open" | "contacted" | "resolved";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "upgrade_requests_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "upgrade_requests_feature_id_fkey";
            columns: ["feature_id"];
            isOneToOne: false;
            referencedRelation: "features";
            referencedColumns: ["id"];
          }
        ];
      };
      discount_codes: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: "percentage" | "fixed_amount";
          discount_value: number;
          applies_to: "new_subscription" | "renewal" | "both";
          valid_from: string;
          valid_until: string | null;
          max_uses: number | null;
          times_used: number;
          is_active: boolean;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string | null;
          discount_type: "percentage" | "fixed_amount";
          discount_value: number;
          applies_to: "new_subscription" | "renewal" | "both";
          valid_from?: string;
          valid_until?: string | null;
          max_uses?: number | null;
          times_used?: number;
          is_active?: boolean;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          description?: string | null;
          discount_type?: "percentage" | "fixed_amount";
          discount_value?: number;
          applies_to?: "new_subscription" | "renewal" | "both";
          valid_from?: string;
          valid_until?: string | null;
          max_uses?: number | null;
          times_used?: number;
          is_active?: boolean;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "discount_codes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "platform_admins";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_log: {
        Row: {
          id: string;
          actor_admin_id: string | null;
          action: string;
          target_table: string;
          target_id: string;
          old_value: Json | null;
          new_value: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_admin_id?: string | null;
          action: string;
          target_table: string;
          target_id: string;
          old_value?: Json | null;
          new_value?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_admin_id?: string | null;
          action?: string;
          target_table?: string;
          target_id?: string;
          old_value?: Json | null;
          new_value?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_admin_id_fkey";
            columns: ["actor_admin_id"];
            isOneToOne: false;
            referencedRelation: "platform_admins";
            referencedColumns: ["id"];
          }
        ];
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          channel: "email" | "whatsapp" | "both";
          subject: string | null;
          body: string;
          audience_filter: Json;
          status: "draft" | "scheduled" | "sending" | "sent" | "failed";
          scheduled_at: string | null;
          sent_at: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          channel: "email" | "whatsapp" | "both";
          subject?: string | null;
          body: string;
          audience_filter: Json;
          status?: "draft" | "scheduled" | "sending" | "sent" | "failed";
          scheduled_at?: string | null;
          sent_at?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          channel?: "email" | "whatsapp" | "both";
          subject?: string | null;
          body?: string;
          audience_filter?: Json;
          status?: "draft" | "scheduled" | "sending" | "sent" | "failed";
          scheduled_at?: string | null;
          sent_at?: string | null;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "platform_admins";
            referencedColumns: ["id"];
          }
        ];
      };
      announcement_recipients: {
        Row: {
          id: string;
          announcement_id: string;
          clinic_id: string;
          channel: "email" | "whatsapp";
          status: "pending" | "sent" | "failed";
          error_message: string | null;
          sent_at: string | null;
        };
        Insert: {
          id?: string;
          announcement_id: string;
          clinic_id: string;
          channel: "email" | "whatsapp";
          status?: "pending" | "sent" | "failed";
          error_message?: string | null;
          sent_at?: string | null;
        };
        Update: {
          id?: string;
          announcement_id?: string;
          clinic_id?: string;
          channel?: "email" | "whatsapp";
          status?: "pending" | "sent" | "failed";
          error_message?: string | null;
          sent_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "announcement_recipients_announcement_id_fkey";
            columns: ["announcement_id"];
            isOneToOne: false;
            referencedRelation: "announcements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "announcement_recipients_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          title: string;
          body: string;
          notification_type: "manual_broadcast" | "system_event";
          target_role: "super_admin" | "accountant" | "support" | null;
          link_url: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          notification_type?: "manual_broadcast" | "system_event";
          target_role?: "super_admin" | "accountant" | "support" | null;
          link_url?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          notification_type?: "manual_broadcast" | "system_event";
          target_role?: "super_admin" | "accountant" | "support" | null;
          link_url?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "platform_admins";
            referencedColumns: ["id"];
          }
        ];
      };
      notification_recipients: {
        Row: {
          id: string;
          notification_id: string;
          admin_id: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          notification_id: string;
          admin_id: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          notification_id?: string;
          admin_id?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_recipients_notification_id_fkey";
            columns: ["notification_id"];
            isOneToOne: false;
            referencedRelation: "notifications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_recipients_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "platform_admins";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_discount_usage: {
        Args: {
          code_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      admin_role: "super_admin" | "accountant" | "support";
      language_pref: "ar" | "en";
      billing_cycle: "monthly" | "yearly";
      plan_limit_type: "provider_seats" | "patients" | "staff_accounts";
      clinic_status: "trial" | "active" | "past_due" | "suspended" | "cancelled";
      subscription_status: "trial" | "active" | "past_due" | "cancelled";
      override_type: "grant" | "revoke";
      payment_method: "bank_transfer" | "cash" | "vodafone_cash" | "instapay" | "other";
      payment_status: "pending" | "confirmed" | "failed";
      usage_type: "ai_tokens" | "whatsapp_messages" | "sms";
      request_status: "open" | "contacted" | "resolved";
      discount_type: "percentage" | "fixed_amount";
      discount_applies_to: "new_subscription" | "renewal" | "both";
      announcement_channel: "email" | "whatsapp" | "both";
      announcement_status: "draft" | "scheduled" | "sending" | "sent" | "failed";
      delivery_status: "pending" | "sent" | "failed";
      notification_type: "manual_broadcast" | "system_event";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
