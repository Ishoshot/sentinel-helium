<script setup lang="ts">
import type { BriefingGeneration, BriefingShare, CreateShareRequest } from "~/types";
import { useBriefings } from "~/composables/briefings/useBriefings";

/**
 * BriefingShareModal - Share configuration modal for briefings
 *
 * A refined modal that allows users to configure share settings:
 * - Password protection
 * - Maximum access count
 * - Expiry duration
 */

interface Props {
  modelValue: boolean;
  generation: BriefingGeneration | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  created: [share: BriefingShare];
}>();

// Form state
const isPasswordEnabled = ref(false);
const password = ref("");
const isExpiryEnabled = ref(true);
const expiryDays = ref(7);
const isMaxAccessesEnabled = ref(false);
const maxAccesses = ref(100);
const isCreating = ref(false);
const error = ref<string | null>(null);
const createdShare = ref<BriefingShare | null>(null);

// Expiry presets
const expiryPresets = [
  { label: "1 day", value: 1 },
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

// Access presets
const accessPresets = [
  { label: "10", value: 10 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
  { label: "500", value: 500 },
];

const minimumPasswordLength = 6;

// Computed expiry date
const expiryDate = computed(() => {
  if (!isExpiryEnabled.value) return null;
  const date = new Date();
  date.setDate(date.getDate() + expiryDays.value);
  return date;
});

function formatShortMonthDate(date: Date): string {
  const monthValue = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
  const month = monthValue.endsWith(".") ? monthValue.slice(0, -1) : monthValue;
  const day = new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(date);
  const year = new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(date);

  return `${month}. ${day}, ${year}`;
}

const isMaxAccessValid = computed(() => {
  return Number.isInteger(maxAccesses.value) && maxAccesses.value > 0;
});

const canCreateLink = computed(() => {
  if (isPasswordEnabled.value && password.value.length < minimumPasswordLength) {
    return false;
  }

  if (isMaxAccessesEnabled.value && !isMaxAccessValid.value) {
    return false;
  }

  return true;
});

const sharePolicySummary = computed(() => {
  return {
    password: isPasswordEnabled.value ? "Required" : "Not required",
    expiry: isExpiryEnabled.value && expiryDate.value
      ? formatShortMonthDate(expiryDate.value)
      : "No expiry",
    views: isMaxAccessesEnabled.value && isMaxAccessValid.value
      ? `${maxAccesses.value} max views`
      : "Unlimited",
  };
});

const fullShareUrl = computed(() => {
  if (!createdShare.value?.token) {
    return "";
  }

  return `${window.location.origin}/briefings/share/${encodeURIComponent(createdShare.value.token)}`;
});

const displayShareUrl = computed(() => {
  if (!fullShareUrl.value) {
    return "";
  }

  if (fullShareUrl.value.length <= 78) {
    return fullShareUrl.value;
  }

  return `${fullShareUrl.value.slice(0, 78)}...`;
});

// Reset form when modal opens
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      isPasswordEnabled.value = false;
      password.value = "";
      isExpiryEnabled.value = true;
      expiryDays.value = 7;
      isMaxAccessesEnabled.value = false;
      maxAccesses.value = 100;
      error.value = null;
      createdShare.value = null;
      isCopied.value = false;
    }
  }
);

// Services
const { createShare } = useBriefings(computed(() => props.generation?.workspace_id ?? null));

async function handleCreate() {
  if (!props.generation) return;

  // Validate password if enabled
  if (isPasswordEnabled.value && password.value.length < minimumPasswordLength) {
    error.value = `Password must be at least ${minimumPasswordLength} characters`;
    return;
  }

  if (isMaxAccessesEnabled.value && !isMaxAccessValid.value) {
    error.value = "View limit must be at least 1";
    return;
  }

  isCreating.value = true;
  error.value = null;

  try {
    const data: CreateShareRequest = {};

    if (isPasswordEnabled.value && password.value) {
      data.password = password.value;
    }

    if (isExpiryEnabled.value) {
      data.expires_in_days = expiryDays.value;
    }

    if (isMaxAccessesEnabled.value) {
      data.max_accesses = maxAccesses.value;
    }

    const share = await createShare(props.generation.id, data);

    if (share) {
      createdShare.value = share;
      emit("created", share);
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to create share link";
  } finally {
    isCreating.value = false;
  }
}

// Copy share URL
const isCopied = ref(false);
async function copyShareUrl() {
  if (!fullShareUrl.value) return;

  try {
    await navigator.clipboard.writeText(fullShareUrl.value);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch {
    error.value = "Failed to copy to clipboard";
  }
}

function openShareUrl() {
  if (!fullShareUrl.value) return;
  window.open(fullShareUrl.value, "_blank", "noopener,noreferrer");
}

function close() {
  emit("update:modelValue", false);
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    size="lg"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
          <Icon
            name="lucide:share-2"
            class="size-5 text-accent"
          />
        </div>
        <div class="min-w-0">
          <h2 class="text-lg font-semibold tracking-tight text-text-primary">
            Share Briefing
          </h2>
          <p class="truncate text-sm text-text-muted">
            {{ generation?.briefing?.title ?? "Briefing" }}
          </p>
        </div>
      </div>
    </template>

    <div
      v-if="createdShare"
      class="space-y-5"
    >
      <section class="rounded-xl border border-success/20 bg-success/10 p-5">
        <div class="flex items-start gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/15">
            <Icon
              name="lucide:check"
              class="size-5 text-success"
            />
          </div>
          <div>
            <h3 class="text-base font-semibold text-text-primary">
              Share link created
            </h3>
            <p class="mt-1 text-sm text-text-muted">
              Anyone with this link can view the briefing in read-only mode.
            </p>
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-border-subtle bg-bg-surface p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-text-muted">
          Share URL
        </p>
        <div class="mt-2 flex items-center gap-2">
          <div class="min-w-0 flex-1 truncate rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 font-mono text-sm text-text-secondary">
            {{ displayShareUrl }}
          </div>
          <button
            type="button"
            class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated text-text-secondary transition-colors hover:border-border-muted hover:text-text-primary"
            :class="{ 'border-success text-success': isCopied }"
            @click="copyShareUrl"
          >
            <Icon
              :name="isCopied ? 'lucide:check' : 'lucide:copy'"
              class="size-4"
            />
          </button>
          <button
            type="button"
            class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated text-text-secondary transition-colors hover:border-border-muted hover:text-text-primary"
            @click="openShareUrl"
          >
            <Icon
              name="lucide:external-link"
              class="size-4"
            />
          </button>
        </div>
      </section>

      <section class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-lg border border-border-subtle bg-bg-surface p-3">
          <p class="text-xs uppercase tracking-wider text-text-muted">
            Password
          </p>
          <p class="mt-1 text-sm font-medium text-text-primary">
            {{ createdShare.is_password_protected ? "Required" : "Not required" }}
          </p>
        </div>

        <div class="rounded-lg border border-border-subtle bg-bg-surface p-3">
          <p class="text-xs uppercase tracking-wider text-text-muted">
            View Limit
          </p>
          <p class="mt-1 text-sm font-medium text-text-primary">
            {{ createdShare.max_accesses ? `${createdShare.max_accesses} max views` : "Unlimited" }}
          </p>
        </div>

        <div class="rounded-lg border border-border-subtle bg-bg-surface p-3">
          <p class="text-xs uppercase tracking-wider text-text-muted">
            Expires
          </p>
          <p class="mt-1 text-sm font-medium text-text-primary">
            {{ formatShortMonthDate(new Date(createdShare.expires_at)) }}
          </p>
        </div>
      </section>
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <section class="rounded-xl border border-border-subtle bg-bg-surface px-4 py-3">
        <p class="text-sm text-text-secondary">
          Configure optional safeguards before creating a public share link.
        </p>
      </section>

      <div class="space-y-4">
        <section
          class="rounded-xl border border-border-subtle p-4 transition-colors"
          :class="{ 'border-accent/30 bg-accent/[0.02]': isPasswordEnabled }"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-3">
              <div
                class="flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                :class="isPasswordEnabled ? 'bg-accent/10 text-accent' : 'bg-bg-surface text-text-muted'"
              >
                <Icon
                  name="lucide:lock"
                  class="size-4"
                />
              </div>
              <div>
                <h3 class="font-medium text-text-primary">
                  Password Protection
                </h3>
                <p class="mt-0.5 text-sm text-text-muted">
                  Require a password to open the link.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="isPasswordEnabled"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0"
              :class="isPasswordEnabled ? 'bg-accent' : 'bg-bg-surface ring-1 ring-border-muted'"
              @click="isPasswordEnabled = !isPasswordEnabled"
            >
              <span
                class="pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition-transform"
                :class="isPasswordEnabled ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div
              v-if="isPasswordEnabled"
              class="mt-4"
            >
              <BaseInput
                v-model="password"
                type="password"
                placeholder="Enter a password (min. 6 characters)"
                :error="error && error.includes('Password') ? error : ''"
              />
            </div>
          </Transition>
        </section>

        <section
          class="rounded-xl border border-border-subtle p-4 transition-colors"
          :class="{ 'border-accent/30 bg-accent/[0.02]': isExpiryEnabled }"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-3">
              <div
                class="flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                :class="isExpiryEnabled ? 'bg-accent/10 text-accent' : 'bg-bg-surface text-text-muted'"
              >
                <Icon
                  name="lucide:calendar-clock"
                  class="size-4"
                />
              </div>
              <div>
                <h3 class="font-medium text-text-primary">
                  Link Expiry
                </h3>
                <p class="mt-0.5 text-sm text-text-muted">
                  <template v-if="isExpiryEnabled && expiryDate">
                    Expires on {{ formatShortMonthDate(expiryDate) }}
                  </template>
                  <template v-else>
                    Link will never expire
                  </template>
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="isExpiryEnabled"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0"
              :class="isExpiryEnabled ? 'bg-accent' : 'bg-bg-surface ring-1 ring-border-muted'"
              @click="isExpiryEnabled = !isExpiryEnabled"
            >
              <span
                class="pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition-transform"
                :class="isExpiryEnabled ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div
              v-if="isExpiryEnabled"
              class="mt-4 flex flex-wrap gap-2"
            >
              <button
                v-for="preset in expiryPresets"
                :key="preset.value"
                type="button"
                class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                :class="expiryDays === preset.value
                  ? 'bg-accent text-white'
                  : 'bg-bg-surface text-text-secondary ring-1 ring-border-subtle hover:ring-border-muted'"
                @click="expiryDays = preset.value"
              >
                {{ preset.label }}
              </button>
            </div>
          </Transition>
        </section>

        <section
          class="rounded-xl border border-border-subtle p-4 transition-colors"
          :class="{ 'border-accent/30 bg-accent/[0.02]': isMaxAccessesEnabled }"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-3">
              <div
                class="flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                :class="isMaxAccessesEnabled ? 'bg-accent/10 text-accent' : 'bg-bg-surface text-text-muted'"
              >
                <Icon
                  name="lucide:eye"
                  class="size-4"
                />
              </div>
              <div>
                <h3 class="font-medium text-text-primary">
                  View Limit
                </h3>
                <p class="mt-0.5 text-sm text-text-muted">
                  <template v-if="isMaxAccessesEnabled">
                    Link expires after {{ maxAccesses }} views
                  </template>
                  <template v-else>
                    Unlimited views allowed
                  </template>
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="isMaxAccessesEnabled"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0"
              :class="isMaxAccessesEnabled ? 'bg-accent' : 'bg-bg-surface ring-1 ring-border-muted'"
              @click="isMaxAccessesEnabled = !isMaxAccessesEnabled"
            >
              <span
                class="pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition-transform"
                :class="isMaxAccessesEnabled ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div
              v-if="isMaxAccessesEnabled"
              class="mt-4 flex flex-wrap items-center gap-2"
            >
              <button
                v-for="preset in accessPresets"
                :key="preset.value"
                type="button"
                class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                :class="maxAccesses === preset.value
                  ? 'bg-accent text-white'
                  : 'bg-bg-surface text-text-secondary ring-1 ring-border-subtle hover:ring-border-muted'"
                @click="maxAccesses = preset.value"
              >
                {{ preset.label }}
              </button>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="maxAccesses"
                  type="number"
                  min="1"
                  max="10000"
                  class="w-24 rounded-lg border border-border-subtle bg-bg-elevated px-3 py-1.5 text-sm text-text-primary transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                <span class="text-sm text-text-muted">custom</span>
              </div>
            </div>
          </Transition>
        </section>
      </div>

      <section class="rounded-xl border border-border-subtle bg-bg-surface p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-text-muted">
          Share Policy Summary
        </p>
        <div class="mt-2 grid gap-2 sm:grid-cols-3">
          <div class="rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2">
            <p class="text-[11px] uppercase tracking-wider text-text-muted">
              Password
            </p>
            <p class="mt-1 text-sm font-medium text-text-primary">
              {{ sharePolicySummary.password }}
            </p>
          </div>
          <div class="rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2">
            <p class="text-[11px] uppercase tracking-wider text-text-muted">
              Expiry
            </p>
            <p class="mt-1 text-sm font-medium text-text-primary">
              {{ sharePolicySummary.expiry }}
            </p>
          </div>
          <div class="rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2">
            <p class="text-[11px] uppercase tracking-wider text-text-muted">
              Views
            </p>
            <p class="mt-1 text-sm font-medium text-text-primary">
              {{ sharePolicySummary.views }}
            </p>
          </div>
        </div>
      </section>

      <div
        v-if="error && !error.includes('Password')"
        class="rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error"
      >
        {{ error }}
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs text-text-muted">
          Shared links provide read-only access to this briefing generation.
        </p>

        <div class="flex items-center justify-end gap-3">
          <BaseButton
            class="whitespace-nowrap"
            variant="secondary"
            @click="close"
          >
            {{ createdShare ? "Done" : "Cancel" }}
          </BaseButton>

          <BaseButton
            v-if="!createdShare"
            class="whitespace-nowrap"
            variant="primary"
            :loading="isCreating"
            :disabled="!canCreateLink"
            @click="handleCreate"
          >
            <Icon
              name="lucide:link"
              class="mr-2 size-4"
            />
            Create
          </BaseButton>

          <BaseButton
            v-else
            class="whitespace-nowrap"
            variant="primary"
            @click="copyShareUrl"
          >
            <Icon
              :name="isCopied ? 'lucide:check' : 'lucide:copy'"
              class="mr-2 size-4"
            />
            {{ isCopied ? "Copied!" : "Copy Link" }}
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
