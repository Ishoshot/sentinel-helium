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

// Computed expiry date
const expiryDate = computed(() => {
  if (!isExpiryEnabled.value) return null;
  const date = new Date();
  date.setDate(date.getDate() + expiryDays.value);
  return date;
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
    }
  }
);

// Services
const { createShare } = useBriefings(computed(() => props.generation?.workspace_id ?? null));

async function handleCreate() {
  if (!props.generation) return;

  // Validate password if enabled
  if (isPasswordEnabled.value && password.value.length < 6) {
    error.value = "Password must be at least 6 characters";
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
  if (!createdShare.value?.token) return;

  const shareUrl = `${window.location.origin}/briefings/share/${encodeURIComponent(createdShare.value.token)}`;

  try {
    await navigator.clipboard.writeText(shareUrl);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch {
    error.value = "Failed to copy to clipboard";
  }
}

function close() {
  emit("update:modelValue", false);
}

// Share URL for display
const shareUrl = computed(() => {
  if (!createdShare.value?.token) return "";
  return `${window.location.origin}/briefings/share/${createdShare.value.token.slice(0, 12)}...`;
});
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    size="md"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 ring-1 ring-accent/20">
          <Icon
            name="lucide:share-2"
            class="size-5 text-accent"
          />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-text-primary">
            Share Briefing
          </h2>
          <p class="text-sm text-text-muted">
            {{ generation?.briefing?.title ?? 'Briefing' }}
          </p>
        </div>
      </div>
    </template>

    <!-- Success State -->
    <div v-if="createdShare">
      <div class="rounded-xl border border-success/20 bg-success/5 p-5">
        <div class="flex items-start gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/10">
            <Icon
              name="lucide:check"
              class="size-5 text-success"
            />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-medium text-text-primary">
              Share link created!
            </h3>
            <p class="mt-1 text-sm text-text-muted">
              Anyone with this link can view the briefing.
            </p>

            <!-- Share URL -->
            <div class="mt-4 flex items-center gap-2">
              <div class="flex-1 truncate rounded-lg border border-border-subtle bg-bg-surface px-3 py-2 font-mono text-sm text-text-secondary">
                {{ shareUrl }}
              </div>
              <button
                type="button"
                class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated text-text-secondary transition-all hover:border-accent hover:text-accent"
                :class="{ 'border-success text-success': isCopied }"
                @click="copyShareUrl"
              >
                <Icon
                  :name="isCopied ? 'lucide:check' : 'lucide:copy'"
                  class="size-4"
                />
              </button>
            </div>

            <!-- Share details -->
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-if="createdShare.is_password_protected"
                class="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
              >
                <Icon
                  name="lucide:lock"
                  class="size-3"
                />
                Password protected
              </span>
              <span
                v-if="createdShare.max_accesses"
                class="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200"
              >
                <Icon
                  name="lucide:users"
                  class="size-3"
                />
                {{ createdShare.max_accesses }} max views
              </span>
              <span class="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                <Icon
                  name="lucide:calendar"
                  class="size-3"
                />
                Expires {{ new Date(createdShare.expires_at).toLocaleDateString() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Configuration Form -->
    <div
      v-else
      class="space-y-6"
    >
      <!-- Password Protection -->
      <div
        class="rounded-xl border border-border-subtle p-4 transition-all"
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
                Require a password to view the briefing
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="isPasswordEnabled"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
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
      </div>

      <!-- Expiry Duration -->
      <div
        class="rounded-xl border border-border-subtle p-4 transition-all"
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
                  Expires on {{ expiryDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) }}
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
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
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
              class="rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
              :class="expiryDays === preset.value
                ? 'bg-accent text-white shadow-sm'
                : 'bg-bg-surface text-text-secondary ring-1 ring-border-subtle hover:ring-border-muted'"
              @click="expiryDays = preset.value"
            >
              {{ preset.label }}
            </button>
          </div>
        </Transition>
      </div>

      <!-- Max Accesses -->
      <div
        class="rounded-xl border border-border-subtle p-4 transition-all"
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
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
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
            class="mt-4 flex flex-wrap gap-2"
          >
            <button
              v-for="preset in accessPresets"
              :key="preset.value"
              type="button"
              class="rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
              :class="maxAccesses === preset.value
                ? 'bg-accent text-white shadow-sm'
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
                class="w-20 rounded-lg border border-border-subtle bg-bg-elevated px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
              <span class="text-sm text-text-muted">custom</span>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Error -->
      <div
        v-if="error && !error.includes('Password')"
        class="rounded-lg bg-error/5 p-3 text-sm text-error ring-1 ring-error/20"
      >
        {{ error }}
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <BaseButton
          variant="secondary"
          @click="close"
        >
          {{ createdShare ? 'Done' : 'Cancel' }}
        </BaseButton>
        <BaseButton
          v-if="!createdShare"
          variant="primary"
          :loading="isCreating"
          @click="handleCreate"
        >
          <Icon
            name="lucide:link"
            class="mr-2 size-4"
          />
          Create Link
        </BaseButton>
        <BaseButton
          v-else
          variant="primary"
          @click="copyShareUrl"
        >
          <Icon
            :name="isCopied ? 'lucide:check' : 'lucide:copy'"
            class="mr-2 size-4"
          />
          {{ isCopied ? 'Copied!' : 'Copy Link' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
