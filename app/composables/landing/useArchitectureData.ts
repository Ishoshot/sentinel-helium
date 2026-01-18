/**
 * Shared architecture data for landing page visualizations
 * Single source of truth for both desktop and mobile views
 */

export interface ArchitectureRow {
  icon: string;
  label: string;
  value: string;
  status?: "active" | "success" | "warning" | "error";
}

export interface ArchitectureItem {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: string;
  rows: ArchitectureRow[];
}

export interface ArchitectureLayer {
  title: string;
  items: ArchitectureItem[];
}

// Badge color classes
export const badgeColors: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600 border-blue-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
  amber: "bg-amber-50 text-amber-600 border-amber-200",
  purple: "bg-purple-50 text-purple-600 border-purple-200",
  cyan: "bg-cyan-50 text-cyan-600 border-cyan-200",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
  rose: "bg-rose-50 text-rose-600 border-rose-200",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
};

// Status dot colors
export const statusColors: Record<string, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  active: "bg-blue-500",
  error: "bg-red-500",
};

// Color config for desktop 3D view
export const colorConfig: Record<
  string,
  { border: string; badge: string; stripe: string }
> = {
  blue: {
    border: "border-l-blue-500",
    badge: "bg-blue-50 text-blue-600 border-blue-200",
    stripe: "rgba(59, 130, 246, 0.25)",
  },
  amber: {
    border: "border-l-amber-500",
    badge: "bg-amber-50 text-amber-600 border-amber-200",
    stripe: "rgba(245, 158, 11, 0.25)",
  },
  cyan: {
    border: "border-l-cyan-500",
    badge: "bg-cyan-50 text-cyan-600 border-cyan-200",
    stripe: "rgba(6, 182, 212, 0.25)",
  },
  emerald: {
    border: "border-l-emerald-500",
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200",
    stripe: "rgba(16, 185, 129, 0.25)",
  },
  rose: {
    border: "border-l-rose-500",
    badge: "bg-rose-50 text-rose-600 border-rose-200",
    stripe: "rgba(244, 63, 94, 0.25)",
  },
};

// Architecture layers data
const entryLayer: ArchitectureLayer = {
  title: "GitHub",
  items: [
    {
      id: "webhook",
      title: "Webhook",
      badge: "Entry",
      badgeColor: "blue",
      icon: "ph:webhooks-logo-bold",
      rows: [
        {
          icon: "ph:webhooks-logo",
          label: "PR Events",
          value: "opened, synchronize",
          status: "active",
        },
        {
          icon: "ph:shield-check",
          label: "Signature",
          value: "Verified",
          status: "success",
        },
        {
          icon: "ph:lightning",
          label: "Latency",
          value: "< 50ms",
          status: "active",
        },
      ],
    },
    {
      id: "repository",
      title: "Repository",
      badge: "Source",
      badgeColor: "blue",
      icon: "ph:git-branch-bold",
      rows: [
        {
          icon: "ph:git-branch",
          label: "Auto-review",
          value: "Enabled",
          status: "success",
        },
        {
          icon: "ph:file-code",
          label: "Config",
          value: "sentinel.json",
          status: "active",
        },
      ],
    },
  ],
};

const orchestrationLayer: ArchitectureLayer = {
  title: "Orchestration",
  items: [
    {
      id: "validation",
      title: "Validation",
      badge: "Check",
      badgeColor: "amber",
      icon: "ph:shield-check-bold",
      rows: [
        {
          icon: "ph:shield-check",
          label: "Config syntax",
          value: "Valid",
          status: "success",
        },
        { icon: "ph:key", label: "API Keys", value: "BYOK", status: "success" },
        {
          icon: "ph:funnel",
          label: "Trigger rules",
          value: "Matched",
          status: "success",
        },
      ],
    },
    {
      id: "queue",
      title: "Queue",
      badge: "Worker",
      badgeColor: "amber",
      icon: "ph:queue-bold",
      rows: [
        {
          icon: "ph:queue",
          label: "Priority",
          value: "Premium",
          status: "active",
        },
        {
          icon: "ph:arrows-out",
          label: "Workers",
          value: "2-4 replicas",
          status: "active",
        },
        { icon: "ph:clock", label: "Target", value: "< 30s", status: "active" },
      ],
    },
  ],
};

const executionLayer: ArchitectureLayer = {
  title: "Execution",
  items: [
    {
      id: "context",
      title: "Context Engine",
      badge: "Build",
      badgeColor: "emerald",
      icon: "ph:tree-structure-bold",
      rows: [
        {
          icon: "ph:git-diff",
          label: "Diff collector",
          value: "Active",
          status: "success",
        },
        {
          icon: "ph:tree-structure",
          label: "Semantic analysis",
          value: "Active",
          status: "success",
        },
        {
          icon: "ph:book-open",
          label: "Guidelines",
          value: "Loaded",
          status: "success",
        },
        {
          icon: "ph:clock-counter-clockwise",
          label: "History",
          value: "5 runs",
          status: "active",
        },
      ],
    },
    {
      id: "review",
      title: "Review Engine",
      badge: "AI",
      badgeColor: "emerald",
      icon: "ph:brain-bold",
      rows: [
        {
          icon: "ph:brain",
          label: "Provider",
          value: "Anthropic",
          status: "active",
        },
        {
          icon: "ph:cpu",
          label: "Model",
          value: "Claude 3.5",
          status: "active",
        },
        {
          icon: "ph:coins",
          label: "Tokens",
          value: "~8,500",
          status: "active",
        },
      ],
    },
  ],
};

const outputLayer: ArchitectureLayer = {
  title: "Output",
  items: [
    {
      id: "findings",
      title: "Findings",
      badge: "Results",
      badgeColor: "rose",
      icon: "ph:magnifying-glass-bold",
      rows: [
        {
          icon: "ph:warning-octagon",
          label: "Critical",
          value: "0",
          status: "success",
        },
        { icon: "ph:warning", label: "High", value: "1", status: "warning" },
        { icon: "ph:info", label: "Medium", value: "3", status: "active" },
        { icon: "ph:minus", label: "Low", value: "2", status: "active" },
      ],
    },
    {
      id: "annotations",
      title: "Annotations",
      badge: "Post",
      badgeColor: "rose",
      icon: "ph:chat-centered-text-bold",
      rows: [
        {
          icon: "ph:chat-centered-text",
          label: "PR comments",
          value: "6 posted",
          status: "success",
        },
        {
          icon: "ph:article",
          label: "Summary",
          value: "Generated",
          status: "success",
        },
        {
          icon: "ph:seal-check",
          label: "Verdict",
          value: "Approve",
          status: "success",
        },
      ],
    },
  ],
};

export const architectureLayers: ArchitectureLayer[] = [
  entryLayer,
  orchestrationLayer,
  executionLayer,
  outputLayer,
];

// Stats data
export const architectureStats = [
  { value: "< 30s", label: "Avg review time" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "6", label: "AI providers" },
  { value: "BYOK", label: "Your API keys" },
];

// Card actions mapping
export const cardActions: Record<string, string> = {
  repository: "Configure policy",
  context: "Add codebase rules",
};

// Desktop card positions for 3D view
export const cardPositions: Record<
  string,
  { col: number; row: number; z: number }
> = {
  webhook: { col: 1, row: 0.5, z: 0 },
  repository: { col: 1, row: 2.4, z: 0 },
  validation: { col: 2, row: 1.6, z: 30 },
  queue: { col: 2, row: 3.0, z: 30 },
  context: { col: 3, row: 0.3, z: 60 },
  review: { col: 3, row: 2.5, z: 60 },
  findings: { col: 4, row: 0.9, z: 90 },
  annotations: { col: 4, row: 2.8, z: 90 },
};
