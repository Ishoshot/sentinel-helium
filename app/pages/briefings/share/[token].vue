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
      class="space-y-4"
    >
      <BaseSkeleton class="h-8 w-64" />
      <BaseSkeleton class="h-4 w-full" />
      <BaseSkeleton class="h-4 w-5/6" />
      <BaseSkeleton class="h-4 w-4/6" />
    </div>

    <div
      v-else-if="!token"
      class="mx-auto max-w-lg rounded-2xl border border-border-subtle bg-bg-elevated p-8 text-center"
    >
      <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-warning/10 text-warning">
        <Icon
          name="lucide:link-2"
          class="size-6"
        />
      </div>
      <h2 class="mt-4 text-lg font-semibold text-text-primary">
        Missing share token
      </h2>
      <p class="mt-2 text-sm text-text-muted">
        This share link is incomplete. Please check the URL and try again.
      </p>
    </div>

    <div
      v-else-if="requiresPassword"
      class="mx-auto max-w-md rounded-2xl border border-border-subtle bg-bg-elevated p-6"
    >
      <h1 class="text-lg font-semibold text-text-primary">
        This briefing is protected
      </h1>
      <p class="mt-2 text-sm text-text-muted">
        Enter the password to view this briefing.
      </p>

      <div class="mt-4 space-y-3">
        <BaseInput
          v-model="password"
          type="password"
          label="Password"
          placeholder="Enter password"
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
      class="mx-auto max-w-lg rounded-2xl border border-border-subtle bg-bg-elevated p-8 text-center"
    >
      <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-error/10 text-error">
        <Icon
          name="lucide:alert-circle"
          class="size-6"
        />
      </div>
      <h2 class="mt-4 text-lg font-semibold text-text-primary">
        Unable to load briefing
      </h2>
      <p class="mt-2 text-sm text-text-muted">
        {{ error }}
      </p>
    </div>

    <div v-else-if="generation">
      <BriefingsBriefingNarrative
        :generation="generation"
        :show-achievements="true"
        :show-excerpts="false"
      />
    </div>
  </div>
</template>
