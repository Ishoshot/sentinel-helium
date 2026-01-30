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
  iconBg: 'bg-slate-100',
  iconColor: 'text-slate-600',
  status: 'coming_soon',
  features: () => [],
})

const isHovered = ref(false)

const statusConfig = computed(() => {
  switch (props.status) {
    case 'available':
      return {
        label: 'Available',
        bg: 'bg-emerald-50',
        color: 'text-emerald-600',
        dot: 'bg-emerald-500',
      }
    case 'beta':
      return {
        label: 'Beta',
        bg: 'bg-blue-50',
        color: 'text-blue-600',
        dot: 'bg-blue-500',
      }
    case 'coming_soon':
    default:
      return {
        label: 'Soon',
        bg: 'bg-slate-100',
        color: 'text-slate-500',
        dot: 'bg-slate-400',
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
      class="relative overflow-hidden rounded-xl border bg-white transition-all duration-300"
      :class="[
        status === 'coming_soon'
          ? 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md',
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
              <h3 class="text-sm font-semibold text-slate-900">
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
            <p class="mt-0.5 truncate text-xs text-slate-500">
              {{ description }}
            </p>
          </div>

          <!-- Arrow indicator on hover -->
          <div
            class="flex size-8 items-center justify-center rounded-lg text-slate-300 opacity-0 transition-all duration-200 group-hover:opacity-100"
            :class="status === 'coming_soon' ? '' : 'bg-slate-50 text-slate-400'"
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
            class="mt-3 overflow-hidden border-t border-slate-100 pt-3"
          >
            <div class="flex flex-wrap gap-2">
              <span
                v-for="feature in features.slice(0, 3)"
                :key="feature"
                class="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-[11px] text-slate-600"
              >
                <Icon
                  name="lucide:check"
                  class="size-3 text-slate-400"
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
