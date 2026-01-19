<script setup lang="ts">
import type { Achievement } from "~/types";
import { getAchievementIcon, getAchievementStyle } from "~/types/briefings";

interface Props {
  achievements: readonly Achievement[];
  variant?: "grid" | "list" | "compact";
  animated?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: "grid",
  animated: true,
});

// Animation delay for staggered entrance
function getAnimationDelay(index: number): string {
  return `${index * 100}ms`;
}
</script>

<template>
  <div v-if="achievements.length > 0">
    <!-- Grid variant -->
    <div
      v-if="variant === 'grid'"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="(achievement, index) in achievements"
        :key="achievement.id"
        class="group relative overflow-hidden rounded-2xl border bg-bg-elevated p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        :class="[
          getAchievementStyle(achievement).border,
          animated && 'animate-fade-in-up',
          `hover:${getAchievementStyle(achievement).glow}`
        ]"
        :style="animated ? { animationDelay: getAnimationDelay(index) } : undefined"
      >
        <!-- Background gradient -->
        <div
          class="absolute inset-0 opacity-30"
          :class="getAchievementStyle(achievement).bg"
        />

        <!-- Celebration particles -->
        <div
          v-if="animated"
          class="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div
            v-for="i in 6"
            :key="i"
            class="absolute w-1.5 h-1.5 rounded-full animate-float"
            :class="[
              i % 3 === 0 ? 'bg-amber-400' : i % 3 === 1 ? 'bg-blue-400' : 'bg-purple-400',
            ]"
            :style="{
              left: `${15 + (i * 15)}%`,
              top: `${20 + (i * 10)}%`,
              animationDelay: `${i * 0.2}s`,
            }"
          />
        </div>

        <div class="relative">
          <!-- Icon -->
          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
            :class="getAchievementStyle(achievement).bg"
          >
            <Icon
              :name="achievement.icon || getAchievementIcon(achievement)"
              class="w-7 h-7"
              :class="getAchievementStyle(achievement).icon"
            />
          </div>

          <!-- Content -->
          <h3 class="font-semibold text-text-primary mb-1">
            {{ achievement.title }}
          </h3>
          <p class="text-sm text-text-muted line-clamp-2">
            {{ achievement.description }}
          </p>

          <!-- Value badge -->
          <div
            v-if="achievement.value"
            class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
            :class="[getAchievementStyle(achievement).bg, getAchievementStyle(achievement).icon]"
          >
            {{ achievement.value }}
          </div>
        </div>
      </div>
    </div>

    <!-- List variant -->
    <div
      v-else-if="variant === 'list'"
      class="space-y-3"
    >
      <div
        v-for="(achievement, index) in achievements"
        :key="achievement.id"
        class="flex items-center gap-4 p-4 rounded-xl border border-border-subtle bg-bg-elevated transition-all duration-200 hover:shadow-md"
        :class="animated && 'animate-fade-in-up'"
        :style="animated ? { animationDelay: getAnimationDelay(index) } : undefined"
      >
        <div
          class="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
          :class="getAchievementStyle(achievement).bg"
        >
          <Icon
            :name="achievement.icon || getAchievementIcon(achievement)"
            class="w-6 h-6"
            :class="getAchievementStyle(achievement).icon"
          />
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-text-primary">
            {{ achievement.title }}
          </h3>
          <p class="text-sm text-text-muted truncate">
            {{ achievement.description }}
          </p>
        </div>

        <div
          v-if="achievement.value"
          class="shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold"
          :class="[getAchievementStyle(achievement).bg, getAchievementStyle(achievement).icon]"
        >
          {{ achievement.value }}
        </div>
      </div>
    </div>

    <!-- Compact variant (inline badges) -->
    <div
      v-else-if="variant === 'compact'"
      class="flex flex-wrap gap-2"
    >
      <div
        v-for="achievement in achievements"
        :key="achievement.id"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 hover:shadow-sm"
        :class="[
          getAchievementStyle(achievement).bg,
          getAchievementStyle(achievement).border,
          getAchievementStyle(achievement).icon
        ]"
      >
        <Icon
          :name="achievement.icon || getAchievementIcon(achievement)"
          class="w-4 h-4"
        />
        {{ achievement.title }}
        <span
          v-if="achievement.value"
          class="font-bold"
        >
          · {{ achievement.value }}
        </span>
      </div>
    </div>
  </div>

  <!-- Empty state -->
  <div
    v-else
    class="text-center py-8 text-text-muted"
  >
    <Icon
      name="lucide:trophy"
      class="w-10 h-10 mx-auto mb-3 opacity-30"
    />
    <p class="text-sm">
      No achievements yet
    </p>
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out forwards;
  opacity: 0;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) scale(1.2);
    opacity: 1;
  }
}

.animate-float {
  animation: float 2s ease-in-out infinite;
}
</style>
