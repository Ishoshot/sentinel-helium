// Re-export enums for convenience
export {
  ToastType,
  EmptyStateVariant,
  ButtonVariant,
  ButtonSize,
  ModalSize,
  HttpStatus,
  ErrorCategory,
  OAuthProvider,
  MemberRole,
  ConnectionStatus,
  InstallationStatus,
  GitHubAccountType,
  NotificationType,
  StorageKey,
  RouteName,
  RunStatus,
  FindingSeverity,
} from "./enums";

// Import enums for use in interfaces
import {
  MemberRole,
  ConnectionStatus,
  InstallationStatus,
  GitHubAccountType,
  NotificationType,
  RunStatus,
  FindingSeverity,
} from "./enums";

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

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

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

// GitHub Integration types
export interface Provider {
  id: number;
  type: string;
  name: string;
  label: string;
  icon: string;
  is_active: boolean;
}

export interface Installation {
  id: number;
  installation_id: number;
  account_type: "User" | "Organization";
  account_login: string;
  account_avatar_url: string;
  status: InstallationStatus;
  status_label: string;
  is_active: boolean;
  is_organization: boolean;
  repositories_count?: number;
  suspended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: number;
  status: ConnectionStatus;
  status_label: string;
  is_active: boolean;
  provider: Provider;
  installation: Installation | null;
  created_at: string;
  updated_at: string;
}

export interface RepositorySettings {
  id: number;
  auto_review_enabled: boolean;
  review_rules: Record<string, unknown> | null;
  updated_at: string;
}

export interface Repository {
  id: number;
  github_id: number;
  name: string;
  full_name: string;
  owner: string;
  private: boolean;
  default_branch: string;
  language: string | null;
  description: string | null;
  auto_review_enabled: boolean;
  settings: RepositorySettings | null;
  installation?: Installation;
  created_at: string;
  updated_at: string;
}

// GitHub API response types
export interface ConnectResponse {
  data: Connection;
  installation_url?: string;
  message?: string;
}

export interface SyncRepositoriesResponse {
  message: string;
  summary: {
    added: number;
    updated: number;
    removed: number;
  };
}

export interface UpdateRepositoryData {
  auto_review_enabled?: boolean;
  review_rules?: Record<string, unknown> | null;
}

// Notification types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationListResponse {
  data: Notification[];
  unread_count: number;
}

export interface UnreadCountResponse {
  count: number;
}

// Review System types
export interface Annotation {
  id: number;
  provider_id: number | null;
  external_id: string | null;
  type: string;
  created_at: string;
}

export interface Finding {
  id: number;
  run_id: number;
  severity: FindingSeverity | string;
  category: string;
  title: string;
  description: string;
  file_path: string | null;
  line_start: number | null;
  line_end: number | null;
  confidence: number | null;
  metadata: Record<string, unknown> | null;
  annotations: readonly Annotation[];
  created_at: string;
}

export interface Run {
  id: number;
  repository_id: number;
  external_reference: string;
  status: RunStatus;
  started_at: string | null;
  completed_at: string | null;
  metrics: Record<string, unknown> | null;
  policy_snapshot: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  repository?: Repository;
  findings?: readonly Finding[];
  created_at: string;
}
