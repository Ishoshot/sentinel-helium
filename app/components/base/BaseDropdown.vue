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
  active?: boolean
}

interface Props {
  items?: DropdownItem[]
  options?: { label: string; value: any; icon?: string }[]
  modelValue?: any
  align?: 'left' | 'right'
  direction?: 'down' | 'up'
  placeholder?: string
  searchable?: boolean
  menuWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  options: () => [],
  align: 'right',
  direction: 'down',
  searchable: false,
  menuWidth: 'w-48'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const searchQuery = ref('')

// Computed items combining props.items and props.options
const displayItems = computed<DropdownItem[]>(() => {
  if (props.items.length > 0) return props.items

  if (props.options.length > 0) {
    let opts = props.options
    
    if (props.searchable && searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      opts = opts.filter(o => o.label.toLowerCase().includes(q))
    }

    return opts.map(opt => ({
      label: opt.label,
      icon: opt.icon,
      action: () => emit('update:modelValue', opt.value),
      active: props.modelValue === opt.value
    }))
  }

  return []
})

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
        class="absolute z-[100] w-full min-w-[12rem] max-w-[calc(100vw-2rem)] rounded-xl shadow-elevated overflow-hidden ring-1 ring-border-subtle bg-bg-elevated"
        :class="[alignmentClasses, directionClasses, menuWidth]"
      >
        <!-- Search -->
        <div
          v-if="searchable"
          class="p-2 border-b border-border-subtle"
        >
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="w-full h-8 px-2 text-sm bg-bg-surface border border-border-subtle rounded focus:outline-none focus:border-accent"
            @click.stop
          >
        </div>

        <div class="py-2 max-h-64 overflow-y-auto">
          <slot>
            <template
              v-for="(item, index) in displayItems"
              :key="index"
            >
              <!-- Separator -->
              <div
                v-if="item.separator"
                class="my-2 mx-3 border-t border-border-subtle"
              />

              <!-- Menu item -->
              <button
                v-else
                class="w-full flex items-center justify-between px-3 py-2.5 mx-2 text-sm rounded-lg transition-all duration-150"
                :class="[
                  item.danger
                    ? 'text-error hover:bg-error-light'
                    : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary',
                  item.active ? 'bg-bg-surface font-medium' : ''
                ]"
                style="width: calc(100% - 1rem);"
                @click="handleItemClick(item)"
              >
                <div class="flex items-center gap-3">
                  <Icon
                    v-if="item.icon"
                    :name="item.icon"
                    class="w-4 h-4"
                    :class="item.danger ? '' : 'text-text-muted'"
                  />
                  <span>{{ item.label }}</span>
                </div>
                <Icon
                  v-if="item.active"
                  name="lucide:check"
                  class="w-4 h-4 text-accent"
                />
              </button>
            </template>

            <div
              v-if="displayItems.length === 0 && !($slots.default)"
              class="px-3 py-3 text-sm text-text-muted text-center"
            >
              No results
            </div>
          </slot>
        </div>
      </div>
    </Transition>
  </div>
</template>
