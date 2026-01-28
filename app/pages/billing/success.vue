<script setup lang="ts">
import { useWorkspaces } from "~/composables/workspace/useWorkspaces";

/**
 * Billing success page - handles redirect after Polar checkout
 * Immediately redirects to workspace billing settings with checkout params
 */

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const router = useRouter();
const { fetchWorkspaces } = useWorkspaces();

onMounted(async () => {
  const checkoutId = route.query.checkout_id as string;

  try {
    // Fetch workspaces to find where to redirect
    const workspaces = await fetchWorkspaces();
    const sortedWorkspaces = [...workspaces].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const workspace = sortedWorkspaces[0];

    if (workspace) {
      // Redirect to billing settings with checkout params
      const query = checkoutId ? { checkout_id: checkoutId } : {};
      router.replace({
        path: `/${workspace.slug}/settings/billing`,
        query,
      });
    } else {
      // Fallback to dashboard if no workspace found
      router.replace("/");
    }
  } catch {
    // Fallback to dashboard on error
    router.replace("/");
  }
});
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <div class="text-center">
      <Icon
        name="lucide:loader-2"
        class="mx-auto size-8 animate-spin text-text-muted"
      />
      <p class="mt-4 text-sm text-text-muted">
        Redirecting...
      </p>
    </div>
  </div>
</template>
