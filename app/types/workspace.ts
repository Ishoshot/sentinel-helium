/**
 * Workspace and Activity types
 */
import type { User } from './auth'

export interface Workspace {
  id: number;
  name: string;
  slug: string;
  settings: Record<string, unknown> | null;
  owner: User;
  team: Team;
  members_count: number;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  name: string;
}

export interface Activity {
  id: number;
  type: string;
  type_label: string;
  type_icon: string;
  type_category: string;
  description: string;
  actor: User | null;
  subject_type: string | null;
  subject_id: number | null;
  metadata: Record<string, unknown> | null;
  is_system_action: boolean;
  created_at: string;
  updated_at: string;
}

// Form data types
export interface CreateWorkspaceData {
  name: string;
}

export interface UpdateWorkspaceData {
  name: string;
}
