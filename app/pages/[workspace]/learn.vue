<script setup lang="ts">
import { usePlans } from '~/composables/billing/usePlans'

/**
 * Help Center / Learn page
 * Explains Sentinel concepts and terminology
 */

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Learn Sentinel',
})

const { plans, fetchPlans } = usePlans()

// Fetch plans on mount
onMounted(() => {
  fetchPlans()
})

const activeCategory = ref('getting-started')

const categories = [
  { id: 'getting-started', label: 'Getting Started', icon: 'ph:rocket-launch-bold' },
  { id: 'core-concepts', label: 'Core Concepts', icon: 'ph:cube-bold' },
  { id: 'reviews', label: 'Reviews & Findings', icon: 'ph:magnifying-glass-bold' },
  { id: 'integrations', label: 'Integrations', icon: 'ph:plug-bold' },
  { id: 'billing', label: 'Plans & Billing', icon: 'ph:credit-card-bold' },
]

const gettingStartedContent = [
  {
    title: 'What is Sentinel?',
    description: 'Sentinel is an AI-powered code review platform that automatically analyzes your pull requests and provides intelligent feedback. It helps teams maintain code quality, catch security vulnerabilities, and enforce coding standards consistently.',
    icon: 'ph:shield-check-bold',
  },
  {
    title: 'How does it work?',
    description: 'When you open or update a pull request, Sentinel automatically runs a review using AI. It analyzes your code changes, identifies potential issues, and posts findings directly to your PR as comments. No manual triggering needed.',
    icon: 'ph:lightning-bold',
  },
  {
    title: 'BYOK Model',
    description: 'Sentinel uses a Bring-Your-Own-Key (BYOK) model for AI providers. You provide your own API keys for services like OpenAI or Anthropic, giving you full control over costs and complete transparency into AI usage.',
    icon: 'ph:key-bold',
  },
]

const coreConceptsContent = [
  {
    term: 'Workspace',
    definition: 'The primary organizational unit in Sentinel. A Workspace represents your organization, company, or team account. All your repositories, team members, settings, and billing are scoped to a Workspace.',
    example: 'Think of it like a GitHub organization - it\'s the container for everything your team does in Sentinel.',
    icon: 'ph:buildings-bold',
    color: 'blue',
  },
  {
    term: 'Team',
    definition: 'The membership container within a Workspace. Each Workspace has exactly one Team that defines which users have access. Team members can have different roles like Owner, Admin, or Member.',
    example: 'Your engineering team members who need access to view reviews and manage repositories.',
    icon: 'ph:users-three-bold',
    color: 'purple',
  },
  {
    term: 'Member',
    definition: 'A user who belongs to a Team within a Workspace. Members have roles that define their permissions - Owners can manage billing, Admins can manage settings, and Members can view reviews.',
    example: 'John is a Member of Acme Corp\'s Workspace with the Admin role.',
    icon: 'ph:user-bold',
    color: 'emerald',
  },
  {
    term: 'Repository',
    definition: 'A source code repository connected to Sentinel via GitHub. Repositories can be enabled or disabled for automatic reviews and have configurable settings.',
    example: 'Your "acme/api" repository is connected and will receive automatic reviews on every PR.',
    icon: 'ph:folder-notch-bold',
    color: 'amber',
  },
]

const reviewsContent = [
  {
    term: 'Run',
    definition: 'A single execution of Sentinel\'s review process. When you open or update a pull request, Sentinel creates a Run to analyze the changes. Runs are immutable once completed and contain all the review data.',
    details: [
      'Created automatically on PR events',
      'Contains metadata, findings, and metrics',
      'Includes a policy snapshot for auditability',
      'Cannot be modified after completion',
    ],
    icon: 'ph:play-bold',
    color: 'blue',
  },
  {
    term: 'Finding',
    definition: 'A discrete issue, observation, or recommendation identified during a Run. Findings are the primary unit of insight in Sentinel - each one represents something the AI noticed about your code.',
    details: [
      'Has a severity level (critical, warning, info)',
      'References specific file and line locations',
      'May include a suggested fix',
      'Can be surfaced as PR comments',
    ],
    icon: 'ph:lightbulb-bold',
    color: 'amber',
  },
  {
    term: 'Annotation',
    definition: 'A representation of a Finding surfaced back to GitHub. Not all Findings become Annotations - Sentinel decides which ones are important enough to comment on based on your settings.',
    details: [
      'Appears as inline comments on your PR',
      'Can include code suggestions',
      'Respects your comment limit settings',
      'Links back to the full Run for context',
    ],
    icon: 'ph:chat-circle-text-bold',
    color: 'purple',
  },
  {
    term: 'Policy',
    definition: 'A collection of rules and thresholds that govern how Sentinel reviews code. Policies define which checks are enabled, severity thresholds, and enforcement behavior.',
    details: [
      'Can be configured per repository',
      'Includes custom guidelines you define',
      'Captured as a snapshot with each Run',
      'Ensures consistent review behavior',
    ],
    icon: 'ph:scroll-bold',
    color: 'emerald',
  },
]

const integrationsContent = [
  {
    term: 'Provider',
    definition: 'An external source control platform supported by Sentinel. Currently GitHub is supported, with GitLab coming soon.',
    icon: 'ph:git-branch-bold',
  },
  {
    term: 'Connection',
    definition: 'A logical link between your Workspace and a Provider. When you connect GitHub, Sentinel gains authorization to interact with your repositories.',
    icon: 'ph:link-bold',
  },
  {
    term: 'Installation',
    definition: 'An instance of the Sentinel GitHub App installed on your organization or user account. The installation grants Sentinel access to selected repositories.',
    icon: 'ph:download-bold',
  },
  {
    term: 'Provider Key',
    definition: 'Your BYOK credential for an AI provider like OpenAI or Anthropic. Provider Keys are stored securely and scoped to your Workspace.',
    icon: 'ph:key-bold',
  },
]

// Use plans from API as single source of truth
const billingContent = computed(() => plans.value.map(plan => ({
  plan: plan.name ?? plan.tier,
  price: plan.price_monthly_cents === 0 || plan.price_monthly_cents === null ? 'Free' : `$${(plan.price_monthly_cents ?? 0) / 100}/mo`,
  description: plan.description,
  features: plan.feature_list ?? [],
  color: plan.color ?? 'slate',
  popular: plan.highlighted ?? false,
})))
</script>

<template>
  <div class="min-h-screen bg-bg-app">
    <!-- Hero section -->
    <div class="bg-gradient-to-br from-bg-elevated via-bg-surface to-bg-elevated">
      <div class="max-w-6xl mx-auto px-6 py-16">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Icon
              name="ph:book-open-bold"
              class="w-5 h-5 text-accent"
            />
          </div>
          <span class="text-sm font-medium text-accent">Learn Sentinel</span>
        </div>
        <h1 class="text-3xl lg:text-4xl font-semibold tracking-tight mb-4 text-text-primary">
          Everything you need to know
        </h1>
        <p class="text-lg text-text-secondary max-w-2xl">
          Understand how Sentinel works, learn the terminology, and get the most out of your code reviews.
        </p>
      </div>
    </div>

    <!-- Main content -->
    <div class="max-w-6xl mx-auto px-6 py-12">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar navigation -->
        <nav class="lg:w-64 shrink-0">
          <div class="lg:sticky lg:top-24 space-y-1">
            <button
              v-for="category in categories"
              :key="category.id"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              :class="activeCategory === category.id
                ? 'bg-bg-elevated text-text-primary shadow-sm'
                : 'text-text-muted hover:bg-bg-surface hover:text-text-primary'"
              @click="activeCategory = category.id"
            >
              <Icon
                :name="category.icon"
                class="w-5 h-5"
                :class="activeCategory === category.id ? 'text-accent' : 'text-text-muted'"
              />
              {{ category.label }}
            </button>
          </div>
        </nav>

        <!-- Content area -->
        <div class="flex-1 min-w-0">
          <!-- Getting Started -->
          <div
            v-show="activeCategory === 'getting-started'"
            class="space-y-6"
          >
            <div
              v-for="item in gettingStartedContent"
              :key="item.title"
              class="bg-bg-elevated rounded-2xl border border-border-subtle p-6 hover:border-border-muted transition-all"
            >
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon
                    :name="item.icon"
                    class="w-6 h-6 text-accent"
                  />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-text-primary mb-2">
                    {{ item.title }}
                  </h3>
                  <p class="text-text-secondary leading-relaxed">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Quick tip -->
            <div class="bg-gradient-to-r from-accent/10 to-teal-600/10 rounded-2xl border border-accent/20 p-6">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-accent to-teal-600 flex items-center justify-center shrink-0">
                  <Icon
                    name="ph:lightbulb-filament-bold"
                    class="w-5 h-5 text-white"
                  />
                </div>
                <div>
                  <h4 class="font-semibold text-text-primary mb-1">
                    Quick Tip
                  </h4>
                  <p class="text-text-secondary text-sm">
                    Start by connecting your GitHub account and selecting a repository. Sentinel will automatically review your next pull request!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Core Concepts -->
          <div
            v-show="activeCategory === 'core-concepts'"
            class="space-y-6"
          >
            <div
              v-for="concept in coreConceptsContent"
              :key="concept.term"
              class="bg-bg-elevated rounded-2xl border border-border-subtle overflow-hidden hover:border-border-muted transition-all"
            >
              <div
                class="px-6 py-4 border-b border-border-subtle"
                :class="{
                  'bg-blue-500/10': concept.color === 'blue',
                  'bg-purple-500/10': concept.color === 'purple',
                  'bg-emerald-500/10': concept.color === 'emerald',
                  'bg-amber-500/10': concept.color === 'amber',
                }"
              >
                <div class="flex items-center gap-3">
                  <Icon
                    :name="concept.icon"
                    class="w-5 h-5"
                    :class="{
                      'text-blue-400': concept.color === 'blue',
                      'text-purple-400': concept.color === 'purple',
                      'text-emerald-400': concept.color === 'emerald',
                      'text-amber-400': concept.color === 'amber',
                    }"
                  />
                  <h3 class="text-lg font-semibold text-text-primary">
                    {{ concept.term }}
                  </h3>
                </div>
              </div>
              <div class="p-6 space-y-4">
                <p class="text-text-secondary leading-relaxed">
                  {{ concept.definition }}
                </p>
                <div class="flex items-start gap-2 text-sm">
                  <Icon
                    name="ph:arrow-bend-down-right"
                    class="w-4 h-4 text-text-muted mt-0.5 shrink-0"
                  />
                  <p class="text-text-muted italic">
                    {{ concept.example }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Reviews & Findings -->
          <div
            v-show="activeCategory === 'reviews'"
            class="space-y-6"
          >
            <div
              v-for="item in reviewsContent"
              :key="item.term"
              class="bg-bg-elevated rounded-2xl border border-border-subtle overflow-hidden hover:border-border-muted transition-all"
            >
              <div
                class="px-6 py-4 border-b border-border-subtle"
                :class="{
                  'bg-blue-500/10': item.color === 'blue',
                  'bg-purple-500/10': item.color === 'purple',
                  'bg-emerald-500/10': item.color === 'emerald',
                  'bg-amber-500/10': item.color === 'amber',
                }"
              >
                <div class="flex items-center gap-3">
                  <Icon
                    :name="item.icon"
                    class="w-5 h-5"
                    :class="{
                      'text-blue-400': item.color === 'blue',
                      'text-purple-400': item.color === 'purple',
                      'text-emerald-400': item.color === 'emerald',
                      'text-amber-400': item.color === 'amber',
                    }"
                  />
                  <h3 class="text-lg font-semibold text-text-primary">
                    {{ item.term }}
                  </h3>
                </div>
              </div>
              <div class="p-6 space-y-4">
                <p class="text-text-secondary leading-relaxed">
                  {{ item.definition }}
                </p>
                <ul class="space-y-2">
                  <li
                    v-for="detail in item.details"
                    :key="detail"
                    class="flex items-center gap-2 text-sm text-text-muted"
                  >
                    <Icon
                      name="ph:check-bold"
                      class="w-4 h-4 text-emerald-400 shrink-0"
                    />
                    {{ detail }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Integrations -->
          <div
            v-show="activeCategory === 'integrations'"
            class="space-y-6"
          >
            <div class="grid sm:grid-cols-2 gap-4">
              <div
                v-for="item in integrationsContent"
                :key="item.term"
                class="bg-bg-elevated rounded-2xl border border-border-subtle p-6 hover:border-border-muted transition-all"
              >
                <div class="w-10 h-10 rounded-xl bg-bg-surface flex items-center justify-center mb-4">
                  <Icon
                    :name="item.icon"
                    class="w-5 h-5 text-text-secondary"
                  />
                </div>
                <h3 class="font-semibold text-text-primary mb-2">
                  {{ item.term }}
                </h3>
                <p class="text-sm text-text-secondary leading-relaxed">
                  {{ item.definition }}
                </p>
              </div>
            </div>

            <!-- GitHub setup guide -->
            <div class="bg-bg-surface rounded-2xl p-6 border border-border-subtle">
              <div class="flex items-center gap-3 mb-4">
                <Icon
                  name="ph:github-logo-bold"
                  class="w-6 h-6 text-text-primary"
                />
                <h3 class="font-semibold text-text-primary">
                  Setting up GitHub
                </h3>
              </div>
              <ol class="space-y-3 text-text-secondary text-sm">
                <li class="flex items-start gap-3">
                  <span class="w-6 h-6 rounded-full bg-bg-hover flex items-center justify-center text-xs font-medium shrink-0 text-text-secondary">1</span>
                  <span>Go to Integrations in your workspace settings</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="w-6 h-6 rounded-full bg-bg-hover flex items-center justify-center text-xs font-medium shrink-0 text-text-secondary">2</span>
                  <span>Click "Connect GitHub" to install the Sentinel app</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="w-6 h-6 rounded-full bg-bg-hover flex items-center justify-center text-xs font-medium shrink-0 text-text-secondary">3</span>
                  <span>Select which repositories Sentinel should access</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="w-6 h-6 rounded-full bg-bg-hover flex items-center justify-center text-xs font-medium shrink-0 text-text-secondary">4</span>
                  <span>Enable reviews for your repositories and you're done!</span>
                </li>
              </ol>
            </div>
          </div>

          <!-- Plans & Billing -->
          <div
            v-show="activeCategory === 'billing'"
            class="space-y-6"
          >
            <div class="grid sm:grid-cols-2 gap-4">
              <div
                v-for="plan in billingContent"
                :key="plan.plan"
                class="relative bg-bg-elevated rounded-2xl border border-border-subtle p-6 hover:border-border-muted transition-all"
                :class="{ 'ring-2 ring-accent': plan.popular }"
              >
                <div
                  v-if="plan.popular"
                  class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-accent to-teal-600 text-white text-xs font-medium rounded-full"
                >
                  Popular
                </div>
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold text-text-primary">
                    {{ plan.plan }}
                  </h3>
                  <span
                    class="text-lg font-bold"
                    :class="{
                      'text-text-secondary': plan.color === 'slate',
                      'text-blue-400': plan.color === 'blue',
                      'text-purple-400': plan.color === 'purple',
                      'text-amber-400': plan.color === 'amber',
                    }"
                  >{{ plan.price }}</span>
                </div>
                <p class="text-sm text-text-muted mb-4">
                  {{ plan.description }}
                </p>
                <ul class="space-y-2">
                  <li
                    v-for="feature in plan.features"
                    :key="feature"
                    class="flex items-center gap-2 text-sm text-text-secondary"
                  >
                    <Icon
                      name="ph:check-bold"
                      class="w-4 h-4 text-emerald-400 shrink-0"
                    />
                    {{ feature }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- BYOK explanation -->
            <div class="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20 p-6">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                  <Icon
                    name="ph:key-bold"
                    class="w-5 h-5 text-white"
                  />
                </div>
                <div>
                  <h4 class="font-semibold text-text-primary mb-1">
                    About BYOK (Bring Your Own Key)
                  </h4>
                  <p class="text-text-secondary text-sm leading-relaxed">
                    All plans use a BYOK model for AI providers. You provide your own API keys for OpenAI, Anthropic, or other providers. This means you have complete control over your AI costs and full transparency into usage. Sentinel never charges you for AI tokens - you pay your provider directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Help CTA -->
    <div class="bg-bg-elevated border-t border-border-subtle">
      <div class="max-w-6xl mx-auto px-6 py-12 text-center">
        <h2 class="text-xl font-semibold text-text-primary mb-2">
          Still have questions?
        </h2>
        <p class="text-text-secondary mb-6">
          We're here to help you get the most out of Sentinel.
        </p>
        <a
          href="mailto:hello@usesentinel.ai"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-teal-600 text-white text-sm font-medium rounded-xl hover:shadow-glow transition-all"
        >
          <Icon
            name="ph:envelope-bold"
            class="w-4 h-4"
          />
          Contact Support
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hover\:shadow-glow:hover {
  box-shadow: 0 0 20px -5px rgba(20, 184, 166, 0.4);
}
</style>
