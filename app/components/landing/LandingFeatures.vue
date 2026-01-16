<script setup lang="ts">
/**
 * Landing page features section 
 * Light background with headline + description left, UI mockups right
 */

const mainFeatures = [
  {
    title: 'Get started under 60 seconds',
    description: 'No code changes, extra packages, or CLI tools needed - just connect your GitHub account, select a repo, and you\'re ready to go.',
    icon: 'ph:rocket-launch-bold',
  },
  {
    title: 'Multiple AI providers',
    description: 'Bring your own API keys for OpenAI, Anthropic, or other providers. You control your AI spend with complete transparency.',
    icon: 'ph:brain-bold',
  },
  {
    title: 'For individuals and teams',
    description: 'Great for indie devs, great for businesses. Invite your team members to collaborate, and manage their permissions with ease.',
    icon: 'ph:users-three-bold',
  },
]

const simpleFeatures = [
  { title: 'Push to review', description: 'Automatic reviews on every pull request.', icon: 'ph:git-pull-request-bold' },
  { title: 'Custom guidelines', description: 'Define policies your team should follow.', icon: 'ph:file-text-bold' },
  { title: 'Inline comments', description: 'Findings appear right in your PR.', icon: 'ph:chat-centered-text-bold' },
  { title: 'BYOK model', description: 'Use your own AI provider API keys.', icon: 'ph:key-bold' },
]
</script>

<template>
  <section
    id="product"
    class="py-32 lg:py-48 bg-white"
  >
    <div class="max-w-7xl mx-auto px-6">
      <!-- Section header -->
      <div class="max-w-3xl mb-16">
        <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
          Speed, simplicity, and quality without the headaches
        </h2>
        <p class="mt-4 text-lg text-slate-600 leading-relaxed">
          Built specifically for engineering teams, Sentinel eliminates configuration hassles and review inconsistency. So you can focus on building, not reviewing.
        </p>
      </div>

      <!-- Main features grid with mockups -->
      <div class="grid lg:grid-cols-3 gap-6 mb-16">
        <!-- Feature cards -->
        <div
          v-for="feature in mainFeatures"
          :key="feature.title"
          class="landing-feature-card p-6"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Icon
                :name="feature.icon"
                class="w-5 h-5 text-blue-600"
              />
            </div>
            <h3 class="text-lg font-semibold text-slate-900">{{ feature.title }}</h3>
          </div>
          <p class="text-slate-600 leading-relaxed">{{ feature.description }}</p>
        </div>
      </div>

      <!-- Simple features grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="feature in simpleFeatures"
          :key="feature.title"
          class="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100"
        >
          <Icon
            :name="feature.icon"
            class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
          />
          <div>
            <h4 class="text-base font-semibold text-slate-900">{{ feature.title }}</h4>
            <p class="text-sm text-slate-600 my-2">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Second features section - Light background -->
  <section class="py-24 lg:py-32 bg-slate-50">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <!-- Left: Content -->
        <div>
          <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
            Security and quality, automatically configured
          </h2>
          <p class="mt-4 text-lg text-slate-600 leading-relaxed">
            Sentinel provides intelligent code analysis out of the box. No need to configure complex rule sets or spend hours tuning - it's all done for you.
          </p>

          <!-- Security features list -->
          <div class="mt-10 grid sm:grid-cols-2 gap-4">
            <div class="flex items-start gap-3">
              <Icon
                name="ph:shield-check-bold"
                class="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
              />
              <div>
                <div class="text-sm font-medium text-slate-900">Security scanning</div>
                <div class="text-xs text-slate-500 mt-0.5">Vulnerabilities detected automatically</div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <Icon
                name="ph:code-bold"
                class="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
              />
              <div>
                <div class="text-sm font-medium text-slate-900">Code quality</div>
                <div class="text-xs text-slate-500 mt-0.5">Best practices enforced consistently</div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <Icon
                name="ph:certificate-bold"
                class="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
              />
              <div>
                <div class="text-sm font-medium text-slate-900">Policy compliance</div>
                <div class="text-xs text-slate-500 mt-0.5">Custom rules for your team</div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <Icon
                name="ph:lightning-bold"
                class="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
              />
              <div>
                <div class="text-sm font-medium text-slate-900">Fast reviews</div>
                <div class="text-xs text-slate-500 mt-0.5">Results in seconds, not minutes</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Mockup -->
        <div class="relative">
          <!-- Security findings mockup card -->
          <div class="rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xl">
            <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div class="text-xs font-medium text-slate-900">Security Scan Results</div>
              <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-50 text-emerald-600">Passed</span>
            </div>
            <div class="p-4 space-y-3">
              <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div class="flex items-center gap-3">
                  <Icon
                    name="ph:check-circle-bold"
                    class="w-4 h-4 text-emerald-500"
                  />
                  <span class="text-sm text-slate-900">SQL Injection</span>
                </div>
                <span class="text-xs text-emerald-600">No issues</span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div class="flex items-center gap-3">
                  <Icon
                    name="ph:check-circle-bold"
                    class="w-4 h-4 text-emerald-500"
                  />
                  <span class="text-sm text-slate-900">XSS Vulnerabilities</span>
                </div>
                <span class="text-xs text-emerald-600">No issues</span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div class="flex items-center gap-3">
                  <Icon
                    name="ph:warning-bold"
                    class="w-4 h-4 text-amber-500"
                  />
                  <span class="text-sm text-slate-900">Hardcoded Secrets</span>
                </div>
                <span class="text-xs text-amber-600">1 warning</span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div class="flex items-center gap-3">
                  <Icon
                    name="ph:check-circle-bold"
                    class="w-4 h-4 text-emerald-500"
                  />
                  <span class="text-sm text-slate-900">Dependency Audit</span>
                </div>
                <span class="text-xs text-emerald-600">No issues</span>
              </div>
            </div>
          </div>

          <!-- Subtle shadow effect -->
          <div class="absolute -inset-4 bg-blue-500 rounded-3xl blur-[60px] opacity-5 -z-10" />
        </div>
      </div>
    </div>
  </section>
</template>
