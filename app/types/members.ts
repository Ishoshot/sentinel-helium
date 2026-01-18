/**
 * Team Member and Invitation types
 */
import type { MemberRole } from './enums'
import type { User } from './auth'
import type { Workspace } from './workspace'

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

// Form data types
export interface CreateInvitationData {
  email: string;
  role: Exclude<MemberRole, "owner">;
}

export interface UpdateMemberRoleData {
  role: Exclude<MemberRole, "owner">;
}
