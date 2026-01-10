/**
 * Centralized enums for the Sentinel application
 *
 * GUIDELINES:
 * - All magic strings MUST be defined as enums
 * - Enum keys should be PascalCase
 * - Enum values should match the API contract (usually snake_case or lowercase)
 * - Group related enums together
 * - Add JSDoc comments for clarity
 */

// =============================================================================
// UI & Component Enums
// =============================================================================

/**
 * Toast notification types
 */
export enum ToastType {
  Success = "success",
  Error = "error",
  Warning = "warning",
  Info = "info",
}

/**
 * Empty state variants for BaseEmptyState component
 */
export enum EmptyStateVariant {
  Empty = "empty",
  Error = "error",
  Success = "success",
  Warning = "warning",
  Info = "info",
  Offline = "offline",
}

/**
 * Button variants
 */
export enum ButtonVariant {
  Primary = "primary",
  Secondary = "secondary",
  Ghost = "ghost",
  Danger = "danger",
}

/**
 * Button sizes
 */
export enum ButtonSize {
  Small = "sm",
  Medium = "md",
  Large = "lg",
}

/**
 * Modal sizes
 */
export enum ModalSize {
  Small = "sm",
  Medium = "md",
  Large = "lg",
}

// =============================================================================
// API & Error Handling Enums
// =============================================================================

/**
 * HTTP status codes used in the application
 */
export enum HttpStatus {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  UnprocessableEntity = 422,
  TooManyRequests = 429,
  InternalServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503,
}

/**
 * Error categories for categorizing API errors
 */
export enum ErrorCategory {
  Auth = "auth",
  Permission = "permission",
  NotFound = "notfound",
  Validation = "validation",
  RateLimit = "ratelimit",
  Server = "server",
  Network = "network",
  Unknown = "unknown",
}

// =============================================================================
// Authentication & Authorization Enums
// =============================================================================

/**
 * OAuth providers supported by the application
 */
export enum OAuthProvider {
  GitHub = "github",
  Google = "google",
}

/**
 * Member roles within a workspace
 */
export enum MemberRole {
  Owner = "owner",
  Admin = "admin",
  Member = "member",
}

// =============================================================================
// GitHub Integration Enums
// =============================================================================

/**
 * GitHub connection status
 */
export enum ConnectionStatus {
  Pending = "pending",
  Active = "active",
  Disconnected = "disconnected",
  Failed = "failed",
}

/**
 * GitHub App installation status
 */
export enum InstallationStatus {
  Active = "active",
  Suspended = "suspended",
  Uninstalled = "uninstalled",
}

/**
 * GitHub account type (user or organization)
 */
export enum GitHubAccountType {
  User = "User",
  Organization = "Organization",
}

// =============================================================================
// Notification Enums
// =============================================================================

/**
 * Notification types
 */
export enum NotificationType {
  WorkspaceInvitation = "workspace_invitation",
  MemberJoined = "member_joined",
  MemberLeft = "member_left",
  RunCompleted = "run_completed",
  RunFailed = "run_failed",
  RepositorySynced = "repository_synced",
  GitHubConnected = "github_connected",
  GitHubDisconnected = "github_disconnected",
}

// =============================================================================
// Storage Keys
// =============================================================================

/**
 * Local storage keys
 */
export enum StorageKey {
  AuthToken = "auth_token",
  Theme = "theme",
  Locale = "locale",
}

// =============================================================================
// Route Names
// =============================================================================

/**
 * Named routes for navigation
 */
export enum RouteName {
  Home = "index",
  Login = "login",
  AuthCallback = "auth-callback",
  AuthError = "auth-error",
  WorkspaceOverview = "workspace",
  WorkspaceMembers = "workspace-members",
  WorkspaceSettings = "workspace-settings",
  WorkspaceIntegrations = "workspace-settings-integrations",
  WorkspaceRepositories = "workspace-repositories",
}
