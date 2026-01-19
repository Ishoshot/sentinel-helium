<script setup lang="ts">
import type { PullRequestGroup } from "~/types";
import { useWorkspaceStore } from "~/stores/useWorkspaceStore";

const props = defineProps<{
  group: PullRequestGroup;
}>();

const isExpanded = ref(true);

const statusConfig = {
  completed: {
    label: "Completed",
    color: "text-success",
    bg: "bg-success/10",
    icon: "✓",
  },
  running: {
    label: "Running",
    color: "text-warning",
    bg: "bg-warning/10",
    icon: "⋯",
  },
  failed: {
    label: "Failed",
    color: "text-danger",
    bg: "bg-danger/10",
    icon: "✕",
  },
  pending: {
    label: "Pending",
    color: "text-muted",
    bg: "bg-muted/10",
    icon: "○",
  },
  skipped: {
    label: "Skipped",
    color: "text-muted",
    bg: "bg-muted/10",
    icon: "⊘",
  },
};

const latestStatusConfig = computed(() => {
  const status = props.group.latest_status as keyof typeof statusConfig;
  return statusConfig[status] || statusConfig.pending;
});

const workspaceStore = useWorkspaceStore();
const workspaceSlug = computed(() => workspaceStore.activeWorkspace?.slug ?? workspaceStore.currentWorkspaceSlug);

const navigateToRun = (runId: number) => {
  if (!workspaceSlug.value) return;
  navigateTo(`/${workspaceSlug.value}/runs/${runId}`);
};

// Run status config for the list items
const getRunStatusConfig = (status: string) => {
  const configs: Record<string, { dot: string; label: string }> = {
    completed: { dot: 'bg-success', label: 'Completed' },
    running: { dot: 'bg-warning animate-pulse', label: 'Running' },
    in_progress: { dot: 'bg-warning animate-pulse', label: 'In Progress' },
    failed: { dot: 'bg-danger', label: 'Failed' },
    skipped: { dot: 'bg-text-muted', label: 'Skipped' },
    queued: { dot: 'bg-accent animate-pulse', label: 'Queued' },
    pending: { dot: 'bg-text-muted', label: 'Pending' },
  };
  return configs[status] ?? configs.pending;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDuration = (startedAt: string | null, completedAt: string | null) => {
  if (!startedAt || !completedAt) return null;
  const duration = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};
</script>

<template>
  <div class="rounded-2xl border border-border-subtle bg-bg-base shadow-sm transition-all duration-200 hover:shadow-md">
    <!-- Collapsible Header -->
    <button
      type="button"
      class="w-full px-6 py-5 text-left transition-all duration-200 hover:bg-bg-surface/50"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex min-w-0 flex-1 items-start gap-4">
          <!-- PR Icon -->
          <div
            class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5"
          >
            <Icon
              name="lucide:git-pull-request"
              class="size-5 text-accent"
            />
          </div>

          <!-- PR Info -->
          <div class="min-w-0 flex-1">
            <div class="mb-1 flex flex-wrap items-center gap-2">
              <span class="text-sm font-medium text-muted">
                #{{ group.pull_request_number }}
              </span>
              <span
                :class="[
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  latestStatusConfig.bg,
                  latestStatusConfig.color,
                ]"
              >
                {{ latestStatusConfig.icon }} {{ latestStatusConfig.label }}
              </span>
            </div>
            <h3 class="mb-2 text-base font-semibold leading-snug text-primary">
              {{ group.pull_request_title || "Untitled Pull Request" }}
            </h3>
            <div class="flex flex-wrap items-center gap-3 text-sm text-muted">
              <span class="flex items-center gap-1.5">
                <span class="font-medium text-primary">{{ group.repository.name }}</span>
              </span>
              <span class="text-border-subtle">•</span>
              <span>{{ group.runs_count }} {{ group.runs_count === 1 ? "run" : "runs" }}</span>
            </div>
          </div>
        </div>

        <!-- Expand/Collapse Icon -->
        <Icon
          name="lucide:chevron-down"
          :class="[
            'size-5 shrink-0 text-muted transition-transform duration-200',
            isExpanded && 'rotate-180',
          ]"
        />
      </div>
    </button>

    <!-- Runs List -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[2000px] opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="max-h-[2000px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div
        v-if="isExpanded"
        class="border-t border-border-subtle"
      >
        <div class="divide-y divide-border-subtle/50">
          <button
            v-for="run in group.runs"
            :key="run.id"
            type="button"
            class="group w-full px-6 py-4 text-left transition-all duration-200 hover:bg-bg-surface/50"
            @click="navigateToRun(run.id)"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="flex min-w-0 flex-1 items-center gap-3">
                <!-- Run Status Indicator -->
                <div
                  class="size-2 shrink-0 rounded-full"
                  :class="getRunStatusConfig(run.status).dot"
                  :title="getRunStatusConfig(run.status).label"
                />

                <!-- Run Info -->
                <div class="min-w-0 flex-1">
                  <div class="mb-0.5 flex items-center gap-2">
                    <span class="text-sm font-medium text-primary">
                      {{ formatDate(run.created_at) }}
                    </span>
                    <span
                      v-if="formatDuration(run.started_at, run.completed_at)"
                      class="text-xs text-muted"
                    >
                      {{ formatDuration(run.started_at, run.completed_at) }}
                    </span>
                    <!-- Skipped badge -->
                    <span
                      v-if="run.status === 'skipped'"
                      class="inline-flex items-center gap-1 rounded-full bg-muted/10 px-2 py-0.5 text-[10px] font-medium text-muted"
                    >
                      <span>⊘</span> Skipped
                    </span>
                  </div>
                  <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span v-if="run.metrics">
                      {{ run.metrics.files_changed }} files
                    </span>
                    <span
                      v-if="run.metadata?.sender_login"
                      class="flex items-center gap-1"
                    >
                      <span class="text-border-subtle">•</span>
                      {{ run.metadata.sender_login }}
                    </span>
                  </div>
                </div>

                <!-- Findings Count -->
                <div
                  v-if="run.findings && run.findings.length > 0"
                  class="shrink-0 rounded-lg bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning"
                >
                  {{ run.findings.length }} findings
                </div>
              </div>

              <!-- Arrow -->
              <div
                class="shrink-0 text-muted opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
              >
                →
              </div>
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
