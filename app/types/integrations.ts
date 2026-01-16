/**
 * Integration, Provider, and GitHub types
 */
import type { ConnectionStatus, InstallationStatus } from './enums'

export type AiProvider = "anthropic" | "openai";

export interface AiOption {
  id: number;
  provider: AiProvider;
  identifier: string;
  name: string;
  description: string | null;
  is_default: boolean;
}

export interface ProviderKey {
  id: number;
  provider: AiProvider;
  provider_label: string;
  ai_model: {
    id: number;
    identifier: string;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface StoreProviderKeyRequest {
  provider: AiProvider;
  key: string;
  provider_model_id?: number;
}

export const AI_PROVIDERS: { value: AiProvider; label: string }[] = [
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
];

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
