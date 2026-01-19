<script setup lang="ts">
import type { BriefingGeneration, BriefingOutputFormat } from "~/types";
import { getBriefingStatusColor, getBriefingStatusLabel, BriefingGenerationStatus } from "~/types";

interface Props {
  generation: BriefingGeneration;
  workspaceSlug: string;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
});

const emit = defineEmits<{
  view: [generation: BriefingGeneration];
  download: [generation: BriefingGeneration, format: BriefingOutputFormat];
  share: [generation: BriefingGeneration];
}>();

// Status helpers
const status = computed(() => props.generation.status as BriefingGenerationStatus);
const isComplete = computed(() => status.value === BriefingGenerationStatus.Completed);
const isProcessing = computed(() => status.value === BriefingGenerationStatus.Processing);
const isPending = computed(() => status.value === BriefingGenerationStatus.Pending);
const isFailed = computed(() => status.value === BriefingGenerationStatus.Failed);

const statusColor = computed(() => getBriefingStatusColor(status.value));
const statusLabel = computed(() => getBriefingStatusLabel(status.value));

// Formatted dates
const createdAt = computed(() => new Date(props.generation.created_at));
const completedAt = computed(() => {
  if (!props.generation.completed_at) return null;
  return new Date(props.generation.completed_at);
});

const timeAgo = computed(() => {
  const date = completedAt.value ?? createdAt.value;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
});

// Achievements count
const achievementsCount = computed(() => props.generation.achievements?.length ?? 0);

// Progress for in-progress generations
const progress = computed(() => props.generation.progress ?? 0);

// Available output formats
const availableFormats = computed(() => {
  if (!isComplete.value) return [];
  return props.generation.briefing?.output_formats ?? ["html", "pdf"];
});

// Status badge styling
function getStatusBadgeClass() {
  switch (statusColor.value) {
    case "success":
      return "text-success bg-success/10";
    case "error":
      return "text-error bg-error/10";
    case "info":
      return "text-accent bg-accent/10";
    case "warning":
      return "text-warning bg-warning/10";
    default:
      return "text-text-muted bg-bg-surface";
  }
}

function handleView() {
  emit("view", props.generation);
}

function handleDownload(format: BriefingOutputFormat) {
  emit("download", props.generation, format);
}

function handleShare() {
  emit("share", props.generation);
}
</script>

<template>
  <!-- Compact variant for lists -->
  <div
    v-if="compact"
    class="flex items-center gap-4 p-4 rounded-xl border border-border-subtle bg-bg-elevated transition-all duration-200 hover:shadow-md hover:border-border-muted cursor-pointer"
    @click="handleView"
  >
    <!-- Status indicator -->
    <div
      class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
      :class="getStatusBadgeClass()"
    >
      <Icon
        v-if="isComplete"
        name="lucide:file-text"
        class="w-5 h-5"
      />
      <Icon
        v-else-if="isFailed"
        name="lucide:alert-circle"
        class="w-5 h-5"
      />
      <Icon
        v-else
        name="lucide:loader-2"
        class="w-5 h-5 animate-spin"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <h3 class="font-medium text-text-primary truncate">
          {{ generation.briefing?.title ?? 'Briefing' }}
        </h3>
        <span
          class="shrink-0 px-2 py-0.5 text-xs font-medium rounded-full"
          :class="getStatusBadgeClass()"
        >
          {{ statusLabel }}
        </span>
      </div>
      <p class="text-sm text-text-muted">
        {{ timeAgo }}
        <template v-if="achievementsCount > 0">
          · {{ achievementsCount }} achievement{{ achievementsCount !== 1 ? 's' : '' }}
        </template>
      </p>
    </div>

    <!-- Progress or Actions -->
    <div class="shrink-0">
      <template v-if="isProcessing || isPending">
        <div class="w-20 h-2 bg-bg-surface rounded-full overflow-hidden">
          <div
            class="h-full bg-accent rounded-full transition-all duration-300"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </template>
      <template v-else-if="isComplete">
        <Icon
          name="lucide:chevron-right"
          class="w-5 h-5 text-text-muted"
        />
      </template>
    </div>
  </div>

  <!-- Full card variant -->
  <div
    v-else
    class="group rounded-2xl border border-border-subtle bg-bg-elevated overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/5"
  >
    <!-- Header with status -->
    <div class="px-6 py-4 border-b border-border-subtle bg-bg-surface/50">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Briefing icon -->
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center"
            :class="getStatusBadgeClass()"
          >
            <Icon
              v-if="isComplete"
              name="lucide:file-text"
              class="w-5 h-5"
            />
            <Icon
              v-else-if="isFailed"
              name="lucide:alert-circle"
              class="w-5 h-5"
            />
            <Icon
              v-else
              name="lucide:loader-2"
              class="w-5 h-5 animate-spin"
            />
          </div>

          <div>
            <h3 class="font-semibold text-text-primary">
              {{ generation.briefing?.title ?? 'Briefing Generation' }}
            </h3>
            <p class="text-sm text-text-muted">
              {{ timeAgo }}
            </p>
          </div>
        </div>

        <!-- Status badge -->
        <span
          class="px-3 py-1 text-sm font-medium rounded-full"
          :class="getStatusBadgeClass()"
        >
          {{ statusLabel }}
        </span>
      </div>
    </div>

    <!-- Progress bar for in-progress -->
    <div
      v-if="isProcessing || isPending"
      class="px-6 py-4"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-text-muted">
          {{ generation.progress_message ?? 'Generating...' }}
        </span>
        <span class="text-sm font-medium text-text-primary tabular-nums">
          {{ Math.round(progress) }}%
        </span>
      </div>
      <div class="h-2 bg-bg-surface rounded-full overflow-hidden">
        <div
          class="h-full bg-accent rounded-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </div>

    <!-- Content preview for completed -->
    <div
      v-else-if="isComplete"
      class="px-6 py-4"
    >
      <!-- Narrative preview -->
      <p
        v-if="generation.narrative"
        class="text-sm text-text-secondary line-clamp-3 mb-4"
      >
        {{ generation.narrative.slice(0, 200) }}{{ generation.narrative.length > 200 ? '...' : '' }}
      </p>

      <!-- Achievements preview -->
      <div
        v-if="achievementsCount > 0"
        class="flex items-center gap-2 mb-4"
      >
        <Icon
          name="lucide:trophy"
          class="w-4 h-4 text-amber-500"
        />
        <span class="text-sm text-text-muted">
          {{ achievementsCount }} achievement{{ achievementsCount !== 1 ? 's' : '' }} unlocked
        </span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <NuxtLink
          :to="`/${workspaceSlug}/briefings/generations/${generation.id}`"
          class="flex-1"
        >
          <BaseButton
            variant="primary"
            size="sm"
            class="w-full"
          >
            <Icon
              name="lucide:eye"
              class="w-4 h-4 mr-1.5"
            />
            View Briefing
          </BaseButton>
        </NuxtLink>

        <!-- Download dropdown -->
        <BaseDropdown
          v-if="availableFormats.length > 0"
          :options="availableFormats.map(f => ({ label: f.toUpperCase(), value: f }))"
          placeholder="Download"
          menu-width="w-32"
          @update:model-value="(v: BriefingOutputFormat) => handleDownload(v)"
        >
          <template #trigger>
            <BaseButton
              variant="secondary"
              size="sm"
            >
              <Icon
                name="lucide:download"
                class="w-4 h-4"
              />
            </BaseButton>
          </template>
        </BaseDropdown>

        <!-- Share button -->
        <BaseButton
          variant="secondary"
          size="sm"
          @click="handleShare"
        >
          <Icon
            name="lucide:share-2"
            class="w-4 h-4"
          />
        </BaseButton>
      </div>
    </div>

    <!-- Error message for failed -->
    <div
      v-else-if="isFailed"
      class="px-6 py-4"
    >
      <div class="flex items-start gap-3 p-3 rounded-lg bg-error/5 border border-error/10">
        <Icon
          name="lucide:alert-triangle"
          class="w-5 h-5 text-error shrink-0 mt-0.5"
        />
        <div>
          <p class="text-sm font-medium text-error">
            Generation failed
          </p>
          <p
            v-if="generation.error_message"
            class="text-sm text-text-muted mt-1"
          >
            {{ generation.error_message }}
          </p>
        </div>
      </div>
    </div>

    <!-- Generator info -->
    <div
      v-if="generation.generated_by"
      class="px-6 py-3 border-t border-border-subtle bg-bg-surface/30"
    >
      <div class="flex items-center gap-2 text-xs text-text-muted">
        <BaseAvatar
          :src="generation.generated_by.avatar_url"
          :name="generation.generated_by.name"
          size="xs"
        />
        <span>{{ generation.generated_by.name }}</span>
      </div>
    </div>
  </div>
</template>
