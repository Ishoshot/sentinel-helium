<script setup lang="ts">
/**
 * BaseDropdown - Dropdown menu component
 * Uses PrimeVue Menu with Tailwind styling
 */

interface DropdownItem {
  label: string
  icon?: string
  action?: () => void
  separator?: boolean
  danger?: boolean
}

interface Props {
  items: DropdownItem[]
  align?: 'left' | 'right'
  direction?: 'down' | 'up'
}

const props = withDefaults(defineProps<Props>(), {
  align: 'right',
  direction: 'down',
})

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

function toggle() {
  isOpen.value = !isOpen.value
}

function handleItemClick(item: DropdownItem) {
  if (item.action) {
    item.action()
  }
  isOpen.value = false
}

const alignmentClasses = computed(() => {
  return props.align === 'right' ? 'right-0' : 'left-0'
})

const directionClasses = computed(() => {
  return props.direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
})
</script>

<template>
  <div
    ref="dropdownRef"
    class="relative inline-block"
  >
    <!-- Trigger slot -->
    <div @click="toggle">
      <slot name="trigger" />
    </div>

    <!-- Dropdown menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 w-48 bg-bg-elevated border border-border-subtle rounded-lg shadow-elevated overflow-hidden"
        :class="[alignmentClasses, directionClasses]"
      >
        <div class="py-1">
          <template
            v-for="(item, index) in items"
            :key="index"
          >
            <!-- Separator -->
            <div
              v-if="item.separator"
              class="my-1 border-t border-border-subtle"
            />

            <!-- Menu item -->
            <button
              v-else
              class="w-full flex items-center gap-2 px-3 py-2 text-sm transition-default"
              :class="[
                item.danger
                  ? 'text-error hover:bg-error-light'
                  : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary'
              ]"
              @click="handleItemClick(item)"
            >
              <Icon
                v-if="item.icon"
                :name="item.icon"
                class="w-4 h-4"
              />
              <span>{{ item.label }}</span>
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>
