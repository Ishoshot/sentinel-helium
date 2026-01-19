<script setup lang="ts">
import { planConfigs } from '~/config/plans'

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

// Use shared plan configs as single source of truth
const billingContent = planConfigs.map(plan => ({
  plan: plan.name,
  price: plan.price === 0 ? 'Free' : `$${plan.price}/mo`,
  description: plan.description,
  features: plan.features,
  color: plan.color,
  popular: plan.highlighted,
}))
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Hero section -->
    <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div class="max-w-6xl mx-auto px-6 py-16">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Icon
              name="ph:book-open-bold"
              class="w-5 h-5 text-blue-400"
            />
          </div>
          <span class="text-sm font-medium text-blue-400">Learn Sentinel</span>
        </div>
        <h1 class="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
          Everything you need to know
        </h1>
        <p class="text-lg text-slate-300 max-w-2xl">
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
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'"
              @click="activeCategory = category.id"
            >
              <Icon
                :name="category.icon"
                class="w-5 h-5"
                :class="activeCategory === category.id ? 'text-blue-600' : 'text-slate-400'"
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
              class="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Icon
                    :name="item.icon"
                    class="w-6 h-6 text-blue-600"
                  />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-slate-900 mb-2">{{ item.title }}</h3>
                  <p class="text-slate-600 leading-relaxed">{{ item.description }}</p>
                </div>
              </div>
            </div>

            <!-- Quick tip -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                  <Icon
                    name="ph:lightbulb-filament-bold"
                    class="w-5 h-5 text-white"
                  />
                </div>
                <div>
                  <h4 class="font-semibold text-slate-900 mb-1">Quick Tip</h4>
                  <p class="text-slate-600 text-sm">
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
              class="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div
                class="px-6 py-4 border-b border-slate-100"
                :class="{
                  'bg-blue-50': concept.color === 'blue',
                  'bg-purple-50': concept.color === 'purple',
                  'bg-emerald-50': concept.color === 'emerald',
                  'bg-amber-50': concept.color === 'amber',
                }"
              >
                <div class="flex items-center gap-3">
                  <Icon
                    :name="concept.icon"
                    class="w-5 h-5"
                    :class="{
                      'text-blue-600': concept.color === 'blue',
                      'text-purple-600': concept.color === 'purple',
                      'text-emerald-600': concept.color === 'emerald',
                      'text-amber-600': concept.color === 'amber',
                    }"
                  />
                  <h3 class="text-lg font-semibold text-slate-900">{{ concept.term }}</h3>
                </div>
              </div>
              <div class="p-6 space-y-4">
                <p class="text-slate-600 leading-relaxed">{{ concept.definition }}</p>
                <div class="flex items-start gap-2 text-sm">
                  <Icon
                    name="ph:arrow-bend-down-right"
                    class="w-4 h-4 text-slate-400 mt-0.5 shrink-0"
                  />
                  <p class="text-slate-500 italic">{{ concept.example }}</p>
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
              class="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div
                class="px-6 py-4 border-b border-slate-100"
                :class="{
                  'bg-blue-50': item.color === 'blue',
                  'bg-purple-50': item.color === 'purple',
                  'bg-emerald-50': item.color === 'emerald',
                  'bg-amber-50': item.color === 'amber',
                }"
              >
                <div class="flex items-center gap-3">
                  <Icon
                    :name="item.icon"
                    class="w-5 h-5"
                    :class="{
                      'text-blue-600': item.color === 'blue',
                      'text-purple-600': item.color === 'purple',
                      'text-emerald-600': item.color === 'emerald',
                      'text-amber-600': item.color === 'amber',
                    }"
                  />
                  <h3 class="text-lg font-semibold text-slate-900">{{ item.term }}</h3>
                </div>
              </div>
              <div class="p-6 space-y-4">
                <p class="text-slate-600 leading-relaxed">{{ item.definition }}</p>
                <ul class="space-y-2">
                  <li
                    v-for="detail in item.details"
                    :key="detail"
                    class="flex items-center gap-2 text-sm text-slate-500"
                  >
                    <Icon
                      name="ph:check-bold"
                      class="w-4 h-4 text-emerald-500 shrink-0"
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
                class="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                  <Icon
                    :name="item.icon"
                    class="w-5 h-5 text-slate-600"
                  />
                </div>
                <h3 class="font-semibold text-slate-900 mb-2">{{ item.term }}</h3>
                <p class="text-sm text-slate-600 leading-relaxed">{{ item.definition }}</p>
              </div>
            </div>

            <!-- GitHub setup guide -->
            <div class="bg-slate-900 rounded-2xl p-6 text-white">
              <div class="flex items-center gap-3 mb-4">
                <Icon
                  name="ph:github-logo-bold"
                  class="w-6 h-6"
                />
                <h3 class="font-semibold">Setting up GitHub</h3>
              </div>
              <ol class="space-y-3 text-slate-300 text-sm">
                <li class="flex items-start gap-3">
                  <span class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium shrink-0">1</span>
                  <span>Go to Integrations in your workspace settings</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium shrink-0">2</span>
                  <span>Click "Connect GitHub" to install the Sentinel app</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium shrink-0">3</span>
                  <span>Select which repositories Sentinel should access</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium shrink-0">4</span>
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
                class="relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                :class="{ 'ring-2 ring-blue-500': plan.popular }"
              >
                <div
                  v-if="plan.popular"
                  class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full"
                >
                  Popular
                </div>
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold text-slate-900">{{ plan.plan }}</h3>
                  <span
                    class="text-lg font-bold"
                    :class="{
                      'text-slate-600': plan.color === 'slate',
                      'text-blue-600': plan.color === 'blue',
                      'text-purple-600': plan.color === 'purple',
                      'text-amber-600': plan.color === 'amber',
                    }"
                  >{{ plan.price }}</span>
                </div>
                <p class="text-sm text-slate-500 mb-4">{{ plan.description }}</p>
                <ul class="space-y-2">
                  <li
                    v-for="feature in plan.features"
                    :key="feature"
                    class="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <Icon
                      name="ph:check-bold"
                      class="w-4 h-4 text-emerald-500 shrink-0"
                    />
                    {{ feature }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- BYOK explanation -->
            <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-6">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                  <Icon
                    name="ph:key-bold"
                    class="w-5 h-5 text-white"
                  />
                </div>
                <div>
                  <h4 class="font-semibold text-slate-900 mb-1">About BYOK (Bring Your Own Key)</h4>
                  <p class="text-slate-600 text-sm leading-relaxed">
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
    <div class="bg-white border-t border-slate-200">
      <div class="max-w-6xl mx-auto px-6 py-12 text-center">
        <h2 class="text-xl font-semibold text-slate-900 mb-2">Still have questions?</h2>
        <p class="text-slate-600 mb-6">We're here to help you get the most out of Sentinel.</p>
        <a
          href="mailto:hello@usesentinel.ai"
          class="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
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
