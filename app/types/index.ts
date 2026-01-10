// User types
export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// Workspace types
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

// Team member types
export type MemberRole = "owner" | "admin" | "member";

export interface TeamMember {
  id: number;
  user_id: number;
  team_id: number;
  workspace_id: number;
  role: MemberRole;
  role_label: string;
  user: User;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

// Invitation types
export interface Invitation {
  id: number;
  email: string;
  workspace_id: number;
  team_id: number;
  role: Exclude<MemberRole, "owner">;
  role_label: string;
  invited_by: User;
  workspace: Workspace;
  is_expired: boolean;
  is_accepted: boolean;
  is_pending: boolean;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  data: T[];
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// OAuth provider types
export type OAuthProvider = "github" | "google";

// Form data types
export interface CreateWorkspaceData {
  name: string;
}

export interface UpdateWorkspaceData {
  name: string;
}

export interface CreateInvitationData {
  email: string;
  role: Exclude<MemberRole, "owner">;
}

export interface UpdateMemberRoleData {
  role: Exclude<MemberRole, "owner">;
}

// Activity types
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
