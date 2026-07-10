/**
 * Supabase database types.
 *
 * This is a curated, hand-authored subset covering the tables the app currently
 * reads. Once your Supabase project is running, regenerate the full, authoritative
 * file with:
 *
 *   npm run db:types
 *
 * (which runs `supabase gen types typescript --local`). Keeping this file in the
 * repo means `createClient<Database>()` stays type-safe even before generation.
 */

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
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "student" | "instructor" | "admin";
          headline: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "student" | "instructor" | "admin";
          headline?: string | null;
          bio?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          slug: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          thumbnail_url: string | null;
          level: "beginner" | "intermediate" | "advanced" | "all";
          price: number;
          currency: string;
          discount_price: number | null;
          status: "draft" | "published" | "archived";
          is_featured: boolean;
          category_id: string | null;
          instructor_id: string;
          rating_avg: number;
          rating_count: number;
          student_count: number;
          duration_minutes: number;
          lesson_count: number;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          slug: string;
          title: string;
          instructor_id: string;
          subtitle?: string | null;
          description?: string | null;
          thumbnail_url?: string | null;
          level?: "beginner" | "intermediate" | "advanced" | "all";
          price?: number;
          currency?: string;
          discount_price?: number | null;
          status?: "draft" | "published" | "archived";
          is_featured?: boolean;
          category_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["courses"]["Insert"]>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: { email: string };
        Update: Partial<{ email: string }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "student" | "instructor" | "admin";
      course_level: "beginner" | "intermediate" | "advanced" | "all";
      course_status: "draft" | "published" | "archived";
    };
    CompositeTypes: Record<string, never>;
  };
}
