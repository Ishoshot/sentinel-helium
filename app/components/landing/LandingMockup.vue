<script setup lang="ts">
/**
 * Landing page product mockup
 * Displays a simulated dashboard UI
 */

defineProps<{
  visible: boolean
}>()
</script>

<template>
  <div
    class="mt-16 lg:mt-20 relative transition-all duration-1000 delay-300 ease-out"
    :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
  >
    <!-- Glow effect -->
    <div class="absolute -inset-4 bg-gradient-to-r from-blue-100 via-gray-100 to-blue-100 rounded-3xl blur-2xl opacity-60" />

    <!-- Mock UI -->
    <div class="relative mx-auto max-w-4xl">
      <div class="bg-white rounded-2xl border border-gray-200/80 shadow-2xl shadow-gray-300/40 overflow-hidden">
        <!-- Window chrome -->
        <div class="flex items-center gap-2 px-4 py-3 bg-gray-50/80 border-b border-gray-200/80">
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded-full bg-gray-300/80" />
            <div class="w-3 h-3 rounded-full bg-gray-300/80" />
            <div class="w-3 h-3 rounded-full bg-gray-300/80" />
          </div>
          <div class="flex-1 flex justify-center">
            <div class="flex items-center gap-2 px-4 py-1.5 bg-white rounded-lg border border-gray-200 text-xs text-gray-500">
              <Icon
                name="ph:lock-simple-bold"
                class="w-3 h-3 text-gray-400"
              />
              sentinel.dev/acme-corp/reviews
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 lg:p-8 bg-gradient-to-b from-gray-50/50 to-white">
          <!-- Stats row -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div class="bg-white rounded-xl p-4 border border-gray-200/80 shadow-sm">
              <div class="text-2xl font-semibold text-gray-900 tabular-nums">
                847
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Reviews this month
              </div>
            </div>
            <div class="bg-white rounded-xl p-4 border border-gray-200/80 shadow-sm">
              <div class="text-2xl font-semibold text-green-600 tabular-nums">
                94%
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Actionable findings
              </div>
            </div>
            <div class="bg-white rounded-xl p-4 border border-gray-200/80 shadow-sm">
              <div class="text-2xl font-semibold text-blue-600 tabular-nums">
                2.3h
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Avg. time saved
              </div>
            </div>
          </div>

          <!-- Review item -->
          <div class="bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-2 ring-white shadow-sm">
                  <span class="text-sm font-semibold text-gray-600">SC</span>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    feat: Add user authentication flow
                  </div>
                  <div class="text-xs text-gray-400 mt-0.5">
                    #1284 opened 12 minutes ago
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200/80">
                <Icon
                  name="ph:warning-bold"
                  class="w-3 h-3"
                />
                3 findings
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-start gap-3 p-3.5 bg-red-50/50 rounded-xl border border-red-100">
                <div class="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Icon
                    name="ph:warning-circle-bold"
                    class="w-3.5 h-3.5 text-red-600"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900">
                    Potential SQL injection in user query
                  </div>
                  <div class="text-xs text-gray-500 mt-0.5 font-mono">
                    src/services/user.ts:47
                  </div>
                </div>
                <span class="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-md">Critical</span>
              </div>
              <div class="flex items-start gap-3 p-3.5 bg-amber-50/50 rounded-xl border border-amber-100">
                <div class="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Icon
                    name="ph:warning-bold"
                    class="w-3.5 h-3.5 text-amber-600"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900">
                    Missing error boundary for async operation
                  </div>
                  <div class="text-xs text-gray-500 mt-0.5 font-mono">
                    src/hooks/useAuth.ts:23
                  </div>
                </div>
                <span class="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">Warning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
