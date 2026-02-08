<script setup lang="ts">
/**
 * IntegrationCard - Premium+ integration placeholder card
 * Refined design with gradient icons and polished interactions
 */

interface Props {
  name: string
  description: string
  icon: string
  iconGradient?: string
  iconBg?: string
  iconColor?: string
  status?: 'available' | 'coming_soon' | 'beta'
  features?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  iconGradient: '',
  iconBg: 'bg-bg-surface',
  iconColor: 'text-text-secondary',
  status: 'coming_soon',
  features: () => [],
})

const isHovered = ref(false)

const statusConfig = computed(() => {
  switch (props.status) {
    case 'available':
      return {
        label: 'Available',
        bg: 'bg-emerald-500/10',
        color: 'text-emerald-400',
        dot: 'bg-emerald-400',
      }
    case 'beta':
      return {
        label: 'Beta',
        bg: 'bg-blue-500/10',
        color: 'text-blue-400',
        dot: 'bg-blue-400',
      }
    case 'coming_soon':
    default:
      return {
        label: 'Soon',
        bg: 'bg-bg-surface',
        color: 'text-text-muted',
        dot: 'bg-text-muted',
      }
  }
})
</script>

<template>
  <div
    class="group relative cursor-pointer"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div
      class="relative overflow-hidden rounded-xl border bg-bg-elevated transition-all duration-300"
      :class="[
        status === 'coming_soon'
          ? 'border-border-subtle hover:border-border-muted'
          : 'border-border-subtle hover:border-border-muted',
      ]"
    >
      <div class="relative p-4">
        <div class="flex items-center gap-4">
          <!-- Icon with gradient -->
          <div
            class="relative flex size-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300"
            :class="[
              iconGradient
                ? `bg-gradient-to-br ${iconGradient}`
                : iconBg,
              status === 'coming_soon' ? 'opacity-60 saturate-50 group-hover:opacity-100 group-hover:saturate-100' : '',
            ]"
          >
            <Icon
              :name="icon"
              class="size-5 transition-colors duration-300"
              :class="iconGradient ? 'text-white' : iconColor"
            />
          </div>

          <!-- Content -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-semibold text-text-primary">
                {{ name }}
              </h3>
              <!-- Status Badge -->
              <span
                class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                :class="[statusConfig.bg, statusConfig.color]"
              >
                <span
                  class="size-1.5 rounded-full"
                  :class="statusConfig.dot"
                />
                {{ statusConfig.label }}
              </span>
            </div>
            <p class="mt-0.5 truncate text-xs text-text-muted">
              {{ description }}
            </p>
          </div>

          <!-- Arrow indicator on hover -->
          <div
            class="flex size-8 items-center justify-center rounded-lg text-text-muted opacity-0 transition-all duration-200 group-hover:opacity-100"
            :class="status === 'coming_soon' ? '' : 'bg-bg-surface text-text-secondary'"
          >
            <Icon
              v-if="status !== 'coming_soon'"
              name="lucide:arrow-right"
              class="size-4"
            />
            <Icon
              v-else
              name="lucide:clock"
              class="size-4"
            />
          </div>
        </div>

        <!-- Features preview (expandable on hover) -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-24"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 max-h-24"
          leave-to-class="opacity-0 max-h-0"
        >
          <div
            v-if="isHovered && features.length > 0"
            class="mt-3 overflow-hidden border-t border-border-subtle pt-3"
          >
            <div class="flex flex-wrap gap-2">
              <span
                v-for="feature in features.slice(0, 3)"
                :key="feature"
                class="inline-flex items-center gap-1 rounded-md bg-bg-surface px-2 py-1 text-[11px] text-text-secondary"
              >
                <Icon
                  name="lucide:check"
                  class="size-3 text-text-muted"
                />
                {{ feature }}
              </span>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
