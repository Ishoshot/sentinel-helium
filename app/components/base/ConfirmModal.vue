<script setup lang="ts">
/**
 * ConfirmModal - Reusable confirmation dialog
 * Replaces browser's native confirm() with a styled modal
 */

interface Props {
  modelValue: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'default',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

function close() {
  if (!props.loading) {
    emit('update:modelValue', false)
    emit('cancel')
  }
}

function confirm() {
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40"
          @click="close"
        />

        <!-- Modal -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="modelValue"
            class="relative bg-bg-elevated rounded-xl shadow-xl max-w-sm w-full overflow-hidden"
          >
            <div class="p-6 text-center">
              <!-- Icon -->
              <div
                class="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4"
                :class="variant === 'danger' ? 'bg-error/10' : 'bg-bg-surface'"
              >
                <Icon
                  :name="variant === 'danger' ? 'lucide:alert-triangle' : 'lucide:help-circle'"
                  class="w-6 h-6"
                  :class="variant === 'danger' ? 'text-error' : 'text-text-muted'"
                />
              </div>

              <!-- Title -->
              <h3 class="text-lg font-semibold text-text-primary mb-2">
                {{ title }}
              </h3>

              <!-- Message -->
              <p
                v-if="message"
                class="text-sm text-text-secondary"
              >
                {{ message }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex border-t border-border-subtle">
              <button
                type="button"
                class="flex-1 px-4 py-3 text-sm font-medium text-text-secondary hover:bg-bg-surface transition-default border-r border-border-subtle"
                :disabled="loading"
                @click="close"
              >
                {{ cancelLabel }}
              </button>
              <button
                type="button"
                class="flex-1 px-4 py-3 text-sm font-medium transition-default disabled:opacity-50"
                :class="variant === 'danger' ? 'text-error hover:bg-error/5' : 'text-accent-primary hover:bg-accent-primary/5'"
                :disabled="loading"
                @click="confirm"
              >
                <span
                  v-if="loading"
                  class="flex items-center justify-center gap-2"
                >
                  <Icon
                    name="lucide:loader-2"
                    class="w-4 h-4 animate-spin"
                  />
                  Loading...
                </span>
                <span v-else>{{ confirmLabel }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
