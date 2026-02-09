<script setup lang="ts">
import { useSharedBriefing } from "~/composables/briefings/useSharedBriefing";

definePageMeta({
  layout: "public",
});

const route = useRoute();
const token = computed(() => {
  const value = route.params.token;
  if (Array.isArray(value)) {
    return value[0];
  }
  return value as string | undefined;
});

const password = ref("");

const {
  generation,
  isLoading,
  requiresPassword,
  error,
  fetchSharedBriefing,
} = useSharedBriefing();

watch(
  () => token.value,
  (value) => {
    if (value) {
      fetchSharedBriefing(value);
    }
  },
  { immediate: true }
);

async function handleUnlock() {
  if (!token.value) return;
  await fetchSharedBriefing(token.value, password.value || null);
}
</script>

<template>
  <div>
    <div
      v-if="isLoading"
      class="mx-auto max-w-3xl rounded-2xl border border-border-subtle bg-bg-elevated p-8 shadow-elevated"
    >
      <div class="space-y-4">
        <BaseSkeleton class="h-6 w-40" />
        <BaseSkeleton class="h-8 w-64" />
        <BaseSkeleton class="h-4 w-full" />
        <BaseSkeleton class="h-4 w-5/6" />
        <BaseSkeleton class="h-4 w-4/6" />
      </div>
    </div>

    <div
      v-else-if="!token"
      class="mx-auto max-w-lg rounded-2xl border border-warning/20 bg-bg-elevated p-8 shadow-elevated"
    >
      <div class="flex items-start gap-4">
        <div class="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
          <Icon
            name="lucide:link-2"
            class="h-5 w-5"
          />
        </div>
        <div>
          <h2 class="text-lg font-semibold tracking-tight text-text-primary">
            Missing share token
          </h2>
          <p class="mt-2 text-sm text-text-muted">
            This share link is incomplete. Please check the URL and try again.
          </p>
        </div>
      </div>
    </div>

    <div
      v-else-if="requiresPassword"
      class="mx-auto max-w-md rounded-2xl border border-border-subtle bg-bg-elevated p-6 shadow-elevated"
    >
      <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
        <Icon
          name="lucide:shield"
          class="h-3.5 w-3.5"
        />
        Protected share
      </div>

      <h1 class="text-xl font-semibold tracking-tight text-text-primary">
        This briefing is protected
      </h1>
      <p class="mt-2 text-sm leading-relaxed text-text-muted">
        Enter the password to view this briefing.
      </p>

      <div class="mt-5 space-y-3">
        <BaseInput
          v-model="password"
          type="password"
          label="Password"
          placeholder="Enter password"
          @keyup.enter="handleUnlock"
        />

        <p
          v-if="error"
          class="text-sm text-error"
        >
          {{ error }}
        </p>

        <BaseButton
          variant="primary"
          class="w-full"
          @click="handleUnlock"
        >
          Unlock Briefing
        </BaseButton>
      </div>
    </div>

    <div
      v-else-if="error"
      class="mx-auto max-w-lg rounded-2xl border border-error/20 bg-bg-elevated p-8 shadow-elevated"
    >
      <div class="flex items-start gap-4">
        <div class="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-error/10 text-error">
          <Icon
            name="lucide:alert-circle"
            class="h-5 w-5"
          />
        </div>
        <div>
          <h2 class="text-lg font-semibold tracking-tight text-text-primary">
            Unable to load briefing
          </h2>
          <p class="mt-2 text-sm text-text-muted">
            {{ error }}
          </p>
        </div>
      </div>
    </div>

    <section
      v-else-if="generation"
      class="overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated shadow-elevated"
    >
      <header class="border-b border-border-subtle bg-bg-surface px-6 py-4">
        <div class="flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <span class="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 font-medium text-accent">
            <Icon
              name="lucide:globe"
              class="h-3.5 w-3.5"
            />
            Public share
          </span>
          <span>This briefing was shared with you via secure link.</span>
        </div>
      </header>

      <div class="p-6 sm:p-8">
        <BriefingsBriefingNarrative
          :generation="generation"
          :show-achievements="true"
          :show-excerpts="false"
        />
      </div>
    </section>
  </div>
</template>
