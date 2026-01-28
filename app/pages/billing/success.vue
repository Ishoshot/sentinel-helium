<script setup lang="ts">
import { useWorkspaces } from "~/composables/workspace/useWorkspaces";
import { useAppToast } from "~/composables/shared/useAppToast";

/**
 * Billing success page - handles redirect after Polar checkout
 * Redirects to workspace billing settings with success message
 */

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const router = useRouter();
const toast = useAppToast();
const { fetchWorkspaces } = useWorkspaces();

const isLoading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  const checkoutId = route.query.checkout_id as string;

  if (!checkoutId) {
    error.value = "No checkout information received";
    isLoading.value = false;
    return;
  }

  try {
    // Fetch workspaces to find where to redirect
    const workspaces = await fetchWorkspaces();
    const sortedWorkspaces = [...workspaces].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const workspace = sortedWorkspaces[0];

    if (workspace) {
      // Show success toast and redirect to billing settings
      toast.success("Payment successful! Your subscription is now active.");
      router.push(`/${workspace.slug}/settings/billing`);
    } else {
      error.value = "Could not find your workspace";
      isLoading.value = false;
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Something went wrong";
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <BaseCard class="w-full max-w-md">
      <div class="py-8 text-center">
        <!-- Loading State -->
        <template v-if="isLoading">
          <div class="mb-4 flex justify-center">
            <div
              class="flex size-16 items-center justify-center rounded-full bg-success-light"
            >
              <Icon
                name="lucide:loader-2"
                class="size-8 animate-spin text-success"
              />
            </div>
          </div>
          <h2 class="text-xl font-semibold text-text-primary">
            Processing your payment...
          </h2>
          <p class="mt-2 text-sm text-text-muted">
            Please wait while we confirm your subscription.
          </p>
        </template>

        <!-- Error State -->
        <template v-else-if="error">
          <div class="mb-4 flex justify-center">
            <div
              class="flex size-16 items-center justify-center rounded-full bg-error-light"
            >
              <Icon
                name="lucide:alert-circle"
                class="size-8 text-error"
              />
            </div>
          </div>
          <h2 class="text-xl font-semibold text-text-primary">
            Something went wrong
          </h2>
          <p class="mt-2 text-sm text-text-muted">
            {{ error }}
          </p>
          <div class="mt-6">
            <BaseButton
              variant="primary"
              @click="router.push('/')"
            >
              Go to dashboard
            </BaseButton>
          </div>
        </template>
      </div>
    </BaseCard>
  </div>
</template>
