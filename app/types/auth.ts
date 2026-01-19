/**
 * Authentication and User types
 */

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  email_verified_at: string | null;
  has_seen_getting_started: boolean;
  created_at: string;
  updated_at: string;
}
