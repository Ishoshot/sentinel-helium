<script setup lang="ts">
/**
 * IntegrationCard - Premium integration placeholder card
 * Displays coming soon integrations with visual appeal
 */

interface Props {
  name: string
  description: string
  icon: string
  iconBg?: string
  iconColor?: string
  status?: 'available' | 'coming_soon' | 'beta'
  features?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  iconBg: 'bg-bg-surface',
  iconColor: 'text-text-primary',
  status: 'coming_soon',
  features: () => [],
})

const isHovered = ref(false)

const statusConfig = computed(() => {
  switch (props.status) {
    case 'available':
      return {
        label: 'Available',
        bg: 'bg-success/10',
        color: 'text-success',
        border: 'border-success/20',
      }
    case 'beta':
      return {
        label: 'Beta',
        bg: 'bg-accent/10',
        color: 'text-accent',
        border: 'border-accent/20',
      }
    case 'coming_soon':
    default:
      return {
        label: 'Coming Soon',
        bg: 'bg-bg-surface',
        color: 'text-text-muted',
        border: 'border-border-subtle',
      }
  }
})
</script>

<template>
  <div
    class="group relative"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div
      class="relative overflow-hidden rounded-xl border transition-all duration-300 h-full"
      :class="[
        status === 'coming_soon'
          ? 'border-dashed border-border-muted bg-bg-elevated/50'
          : 'border-border-subtle bg-bg-elevated hover:border-border-muted hover:shadow-elevated',
        status === 'coming_soon' ? 'opacity-75 hover:opacity-100' : '',
      ]"
    >
      <!-- Subtle pattern overlay for coming soon -->
      <div
        v-if="status === 'coming_soon'"
        class="absolute inset-0 pointer-events-none opacity-[0.02]"
        style="background-image: repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%); background-size: 10px 10px;"
      />

      <div class="relative p-5">
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-start gap-3">
            <!-- Icon -->
            <div
              class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
              :class="[
                iconBg,
                status === 'coming_soon' ? 'grayscale group-hover:grayscale-0' : '',
              ]"
            >
              <Icon
                :name="icon"
                class="w-6 h-6 transition-colors duration-300"
                :class="iconColor"
              />
            </div>

            <!-- Title -->
            <div>
              <h3 class="text-base font-semibold text-text-primary">
                {{ name }}
              </h3>
              <p class="text-sm text-text-muted mt-0.5 line-clamp-2">
                {{ description }}
              </p>
            </div>
          </div>

          <!-- Status Badge -->
          <div
            class="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border"
            :class="[statusConfig.bg, statusConfig.color, statusConfig.border]"
          >
            {{ statusConfig.label }}
          </div>
        </div>

        <!-- Features preview (if provided) -->
        <div
          v-if="features.length > 0"
          class="space-y-2"
        >
          <div
            v-for="feature in features.slice(0, 3)"
            :key="feature"
            class="flex items-center gap-2 text-sm text-text-muted"
          >
            <Icon
              name="lucide:check"
              class="w-3.5 h-3.5 text-text-muted/50 flex-shrink-0"
            />
            <span>{{ feature }}</span>
          </div>
        </div>

        <!-- Coming soon CTA -->
        <div
          v-if="status === 'coming_soon'"
          class="mt-4 pt-4 border-t border-border-subtle"
        >
          <button
            disabled
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-text-muted bg-bg-surface rounded-lg cursor-not-allowed"
          >
            <Icon
              name="lucide:bell"
              class="w-4 h-4"
            />
            Notify me when available
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
