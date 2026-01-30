<script setup lang="ts">
import type { BriefingGeneration, BriefingOutputFormat } from "~/types";
import { getBriefingStatusLabel, BriefingGenerationStatus } from "~/types";

/**
 * BriefingGenerationCard - Generation history card
 * Clean list item with status indicators and actions
 */

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

const status = computed(() => props.generation.status as BriefingGenerationStatus);
const isComplete = computed(() => status.value === BriefingGenerationStatus.Completed);
const isProcessing = computed(() => status.value === BriefingGenerationStatus.Processing);
const isPending = computed(() => status.value === BriefingGenerationStatus.Pending);
const isFailed = computed(() => status.value === BriefingGenerationStatus.Failed);

const statusLabel = computed(() => getBriefingStatusLabel(status.value));

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

const achievementsCount = computed(() => props.generation.achievements?.length ?? 0);
const progress = computed(() => props.generation.progress ?? 0);

const availableFormats = computed(() => {
  if (!isComplete.value) return [];
  return props.generation.output_formats ?? [];
});

const statusConfig = computed(() => {
  if (isComplete.value) {
    return {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      ring: 'ring-emerald-200',
      icon: 'lucide:check',
    };
  }
  if (isProcessing.value || isPending.value) {
    return {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      ring: 'ring-blue-200',
      icon: 'lucide:loader-2',
      animate: true,
    };
  }
  if (isFailed.value) {
    return {
      bg: 'bg-red-100',
      text: 'text-red-700',
      ring: 'ring-red-200',
      icon: 'lucide:x',
    };
  }
  return {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    ring: 'ring-slate-200',
    icon: 'lucide:help-circle',
  };
});

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
  <!-- Compact variant -->
  <div
    v-if="compact"
    class="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
    @click="handleView"
  >
    <!-- Status indicator -->
    <div
      class="flex size-10 shrink-0 items-center justify-center rounded-lg ring-1"
      :class="[statusConfig.bg, statusConfig.ring]"
    >
      <Icon
        :name="statusConfig.icon"
        class="size-4"
        :class="[statusConfig.text, statusConfig.animate && 'animate-spin']"
      />
    </div>

    <!-- Content -->
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <h3 class="truncate text-sm font-medium text-slate-900">
          {{ generation.briefing?.title ?? 'Briefing' }}
        </h3>
        <span
          class="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ring-1"
          :class="[statusConfig.bg, statusConfig.text, statusConfig.ring]"
        >
          {{ statusLabel }}
        </span>
      </div>
      <p class="mt-0.5 text-xs text-slate-500">
        {{ timeAgo }}
        <template v-if="achievementsCount > 0">
          · {{ achievementsCount }} achievement{{ achievementsCount !== 1 ? 's' : '' }}
        </template>
      </p>
    </div>

    <!-- Progress or arrow -->
    <div class="shrink-0">
      <template v-if="isProcessing || isPending">
        <div class="w-24">
          <div class="mb-1.5 flex items-center justify-between">
            <span class="text-xs font-medium text-slate-700">{{ Math.round(progress) }}%</span>
          </div>
          <div class="h-1.5 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
            <div
              class="h-full rounded-full bg-blue-500 transition-all duration-500"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="flex size-8 items-center justify-center rounded-lg transition-colors group-hover:bg-slate-100">
          <Icon
            name="lucide:chevron-right"
            class="size-5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600"
          />
        </div>
      </template>
    </div>
  </div>

  <!-- Full card variant -->
  <div
    v-else
    class="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm"
  >
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-100 p-5">
      <div class="flex items-center gap-3">
        <div
          class="flex size-11 items-center justify-center rounded-xl ring-1"
          :class="[statusConfig.bg, statusConfig.ring]"
        >
          <Icon
            :name="statusConfig.icon"
            class="size-5"
            :class="[statusConfig.text, statusConfig.animate && 'animate-spin']"
          />
        </div>
        <div>
          <h3 class="font-medium text-slate-900">
            {{ generation.briefing?.title ?? 'Briefing' }}
          </h3>
          <p class="text-sm text-slate-500">{{ timeAgo }}</p>
        </div>
      </div>

      <span
        class="rounded-md px-2.5 py-1 text-xs font-medium ring-1"
        :class="[statusConfig.bg, statusConfig.text, statusConfig.ring]"
      >
        {{ statusLabel }}
      </span>
    </div>

    <!-- Progress -->
    <div
      v-if="isProcessing || isPending"
      class="p-5"
    >
      <div class="mb-2 flex items-center justify-between">
        <span class="text-sm text-slate-600">
          {{ generation.progress_message ?? 'Generating...' }}
        </span>
        <span class="text-sm font-semibold tabular-nums text-slate-900">{{ Math.round(progress) }}%</span>
      </div>
      <div class="h-2 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
        <div
          class="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </div>

    <!-- Content for completed -->
    <div
      v-else-if="isComplete"
      class="p-5"
    >
      <p
        v-if="generation.narrative"
        class="line-clamp-3 text-sm leading-relaxed text-slate-600"
      >
        {{ generation.narrative.slice(0, 200) }}{{ generation.narrative.length > 200 ? '...' : '' }}
      </p>

      <p
        v-if="achievementsCount > 0"
        class="mt-4 flex items-center gap-2 text-sm text-slate-600"
      >
        <span class="flex size-6 items-center justify-center rounded-md bg-amber-100 ring-1 ring-amber-200">
          <Icon name="lucide:trophy" class="size-3.5 text-amber-600" />
        </span>
        <span class="font-medium text-slate-900">{{ achievementsCount }}</span>
        achievement{{ achievementsCount !== 1 ? 's' : '' }}
      </p>

      <div class="mt-5 flex items-center gap-2">
        <NuxtLink
          :to="`/${workspaceSlug}/briefings/generations/${generation.id}`"
          class="flex-1"
        >
          <button
            type="button"
            class="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
          >
            View Briefing
          </button>
        </NuxtLink>

        <BaseDropdown
          v-if="availableFormats.length > 0"
          :options="availableFormats.map(f => ({ label: f.toUpperCase(), value: f }))"
          placeholder="Download"
          menu-width="w-32"
          @update:model-value="(v: BriefingOutputFormat) => handleDownload(v)"
        >
          <template #trigger>
            <button
              type="button"
              class="flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            >
              <Icon name="lucide:download" class="size-4" />
            </button>
          </template>
        </BaseDropdown>

        <button
          type="button"
          class="flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
          @click="handleShare"
        >
          <Icon name="lucide:share" class="size-4" />
        </button>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="isFailed"
      class="p-5"
    >
      <div class="flex items-start gap-3 rounded-lg bg-red-50 p-4 ring-1 ring-red-100">
        <Icon name="lucide:alert-circle" class="mt-0.5 size-5 shrink-0 text-red-500" />
        <div>
          <p class="font-medium text-red-800">Generation failed</p>
          <p
            v-if="generation.error_message"
            class="mt-1 text-sm text-red-700"
          >
            {{ generation.error_message }}
          </p>
        </div>
      </div>
    </div>

    <!-- Generator info -->
    <div
      v-if="generation.generated_by"
      class="border-t border-slate-100 px-5 py-3"
    >
      <div class="flex items-center gap-2 text-xs text-slate-500">
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
