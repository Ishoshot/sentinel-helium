<script setup lang="ts">
/**
 * Landing page features section
 * Dark theme with teal accents
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
    class="py-32 lg:py-48 bg-[#09090b] relative overflow-hidden"
  >
    <div class="relative max-w-7xl mx-auto px-6">
      <!-- Section header -->
      <div class="max-w-3xl mb-16">
        <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
          Speed, simplicity, and quality without the headaches
        </h2>
        <p class="mt-4 text-lg text-zinc-400 leading-relaxed">
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
            <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Icon
                :name="feature.icon"
                class="w-5 h-5 text-teal-400"
              />
            </div>
            <h3 class="text-lg font-semibold text-white">
              {{ feature.title }}
            </h3>
          </div>
          <p class="text-zinc-400 leading-relaxed">
            {{ feature.description }}
          </p>
        </div>
      </div>

      <!-- Simple features grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="feature in simpleFeatures"
          :key="feature.title"
          class="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
        >
          <Icon
            :name="feature.icon"
            class="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5"
          />
          <div>
            <h4 class="text-base font-semibold text-white">
              {{ feature.title }}
            </h4>
            <p class="text-sm text-zinc-500 my-2">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Second features section -->
  <section class="py-24 lg:py-32 bg-[#09090b] relative overflow-hidden">
    <div class="relative max-w-7xl mx-auto px-6">
      <div class="grid lg:grid-cols-2 gap-16 items-start">
        <!-- Left: Content -->
        <div>
          <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
            Security and quality, automatically configured
          </h2>
          <p class="mt-4 text-lg text-zinc-400 leading-relaxed">
            Sentinel provides intelligent code analysis out of the box. No need to configure complex rule sets or spend hours tuning - it's all done for you.
          </p>

          <!-- Security features list -->
          <div class="mt-10 grid sm:grid-cols-2 gap-8">
            <div class="flex items-start gap-3">
              <Icon
                name="ph:shield-check-bold"
                class="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1"
              />
              <div>
                <div class="text-base font-medium text-white">
                  Security scanning
                </div>
                <div class="text-sm text-zinc-500 mt-0.5">
                  Vulnerabilities detected automatically
                </div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <Icon
                name="ph:code-bold"
                class="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1"
              />
              <div>
                <div class="text-base font-medium text-white">
                  Code quality
                </div>
                <div class="text-sm text-zinc-500 mt-0.5">
                  Best practices enforced consistently
                </div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <Icon
                name="ph:certificate-bold"
                class="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1"
              />
              <div>
                <div class="text-base font-medium text-white">
                  Policy compliance
                </div>
                <div class="text-sm text-zinc-500 mt-0.5">
                  Custom rules for your team
                </div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <Icon
                name="ph:lightning-bold"
                class="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1"
              />
              <div>
                <div class="text-base font-medium text-white">
                  Fast reviews
                </div>
                <div class="text-sm text-zinc-500 mt-0.5">
                  Results in seconds, not minutes
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: GitHub PR Comment Mockup (already dark themed) -->
        <div class="relative">
          <div class="rounded-xl overflow-hidden bg-[#0d1117] border border-[#30363d] shadow-xl shadow-black/40 text-[13px]">
            <!-- Comment header -->
            <div class="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                  <span class="text-white text-xs font-bold">S</span>
                </div>
                <span class="font-semibold text-[#e6edf3]">sentinelai</span>
                <span class="px-1.5 py-0.5 text-[10px] font-medium rounded-full border border-[#30363d] text-[#8b949e]">bot</span>
                <span class="text-[#8b949e] text-xs">2 days ago</span>
              </div>
              <Icon
                name="ph:dots-three-bold"
                class="w-4 h-4 text-[#8b949e]"
              />
            </div>

            <!-- Comment body -->
            <div class="p-4 space-y-4">
              <!-- Severity badge -->
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span class="text-[#e6edf3] font-medium">High</span>
                <span class="text-[#8b949e]">|</span>
                <span class="text-[#8b949e]">reliability</span>
              </div>

              <!-- Title -->
              <h4 class="text-base font-semibold text-[#e6edf3]">
                Unsafe repository name parsing without validation
              </h4>

              <!-- File reference -->
              <p class="text-[#8b949e]">
                <code class="px-1.5 py-0.5 rounded bg-[#161b22] text-[#79c0ff] text-xs">PostAutoReviewDisabledComment.php</code>
                <span class="mx-1">line 45:</span>
                <span class="text-[#c9d1d9]">The code uses</span>
                <code class="px-1.5 py-0.5 rounded bg-[#161b22] text-[#79c0ff] text-xs">explode()</code>
                <span class="text-[#c9d1d9]">with list destructuring assuming</span>
                <code class="px-1.5 py-0.5 rounded bg-[#161b22] text-[#79c0ff] text-xs">full_name</code>
                <span class="text-[#c9d1d9]">always contains exactly one forward slash.</span>
              </p>

              <!-- Code snippet -->
              <div class="rounded-md bg-[#161b22] border border-[#30363d] p-3 overflow-x-auto">
                <code class="text-xs text-[#c9d1d9] whitespace-pre">[$owner, $repo] = explode('/', $repository->full_name);</code>
              </div>

              <!-- Explanation -->
              <div class="text-[#c9d1d9] space-y-2">
                <p>
                  If <code class="px-1 py-0.5 rounded bg-[#161b22] text-[#79c0ff] text-xs">$repository->full_name</code> is malformed (no slash, multiple slashes, empty string), this will cause:
                </p>
                <ul class="list-disc list-inside space-y-1 text-[#8b949e]">
                  <li>Array index errors</li>
                  <li>Undefined variables <code class="px-1 py-0.5 rounded bg-[#161b22] text-[#79c0ff] text-xs">$owner</code> or <code class="px-1 py-0.5 rounded bg-[#161b22] text-[#79c0ff] text-xs">$repo</code></li>
                  <li>Silent failures with misleading error messages</li>
                </ul>
              </div>

              <!-- Why section -->
              <p class="text-[#c9d1d9]">
                <strong class="text-[#e6edf3]">Why:</strong>
                Validate the format before destructuring to ensure the repository name contains exactly one slash.
              </p>

              <!-- Suggested change diff -->
              <div class="rounded-md border border-[#30363d] overflow-hidden">
                <div class="px-3 py-2 bg-[#161b22] border-b border-[#30363d] text-xs text-[#8b949e]">
                  Suggested change
                </div>
                <div class="text-xs font-mono">
                  <!-- Removed lines -->
                  <div class="flex bg-[#3d1c20]">
                    <span class="w-8 text-center text-[#f85149] select-none py-0.5 border-r border-[#30363d]">44</span>
                    <span class="w-8 text-center text-[#8b949e] select-none py-0.5 border-r border-[#30363d]">-</span>
                    <span class="flex-1 text-[#f85149] py-0.5 px-2 whitespace-pre">        }</span>
                  </div>
                  <div class="flex bg-[#3d1c20]">
                    <span class="w-8 text-center text-[#f85149] select-none py-0.5 border-r border-[#30363d]">45</span>
                    <span class="w-8 text-center text-[#8b949e] select-none py-0.5 border-r border-[#30363d]">-</span>
                    <span class="flex-1 text-[#f85149] py-0.5 px-2 whitespace-pre" />
                  </div>
                  <div class="flex bg-[#3d1c20]">
                    <span class="w-8 text-center text-[#f85149] select-none py-0.5 border-r border-[#30363d]">46</span>
                    <span class="w-8 text-center text-[#8b949e] select-none py-0.5 border-r border-[#30363d]">-</span>
                    <span class="flex-1 text-[#f85149] py-0.5 px-2 whitespace-pre">        [$owner, $repo] = explode('/', $repository->full_name);</span>
                  </div>
                  <!-- Added lines -->
                  <div class="flex bg-[#1a3d24]">
                    <span class="w-8 text-center text-[#8b949e] select-none py-0.5 border-r border-[#30363d]">44</span>
                    <span class="w-8 text-center text-[#3fb950] select-none py-0.5 border-r border-[#30363d]">+</span>
                    <span class="flex-1 text-[#3fb950] py-0.5 px-2 whitespace-pre">$parts = explode('/', $repository->full_name);</span>
                  </div>
                  <div class="flex bg-[#1a3d24]">
                    <span class="w-8 text-center text-[#8b949e] select-none py-0.5 border-r border-[#30363d]">45</span>
                    <span class="w-8 text-center text-[#3fb950] select-none py-0.5 border-r border-[#30363d]">+</span>
                    <span class="flex-1 text-[#3fb950] py-0.5 px-2 whitespace-pre" />
                  </div>
                  <div class="flex bg-[#1a3d24]">
                    <span class="w-8 text-center text-[#8b949e] select-none py-0.5 border-r border-[#30363d]">46</span>
                    <span class="w-8 text-center text-[#3fb950] select-none py-0.5 border-r border-[#30363d]">+</span>
                    <span class="flex-1 text-[#3fb950] py-0.5 px-2 whitespace-pre">if (count($parts) !== 2) {</span>
                  </div>
                  <div class="flex bg-[#1a3d24]">
                    <span class="w-8 text-center text-[#8b949e] select-none py-0.5 border-r border-[#30363d]">47</span>
                    <span class="w-8 text-center text-[#3fb950] select-none py-0.5 border-r border-[#30363d]">+</span>
                    <span class="flex-1 text-[#3fb950] py-0.5 px-2 whitespace-pre">    return null;</span>
                  </div>
                  <div class="flex bg-[#1a3d24]">
                    <span class="w-8 text-center text-[#8b949e] select-none py-0.5 border-r border-[#30363d]">48</span>
                    <span class="w-8 text-center text-[#3fb950] select-none py-0.5 border-r border-[#30363d]">+</span>
                    <span class="flex-1 text-[#3fb950] py-0.5 px-2 whitespace-pre">}</span>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center justify-end gap-2 pt-2">
                <button class="px-3 py-1.5 text-xs font-medium rounded-md bg-[#238636] text-white flex items-center gap-1.5 hover:bg-[#2ea043] transition-colors">
                  Commit suggestion
                  <Icon
                    name="ph:caret-down-bold"
                    class="w-3 h-3"
                  />
                </button>
                <button class="px-3 py-1.5 text-xs font-medium rounded-md border border-[#30363d] text-[#c9d1d9] hover:bg-[#21262d] transition-colors">
                  Add suggestion to batch
                </button>
              </div>

              <!-- Impact notice -->
              <p class="text-[#8b949e] text-xs italic pt-2 border-t border-[#30363d]">
                <strong class="text-[#e6edf3] not-italic">Impact:</strong>
                A malformed repository name will cause the entire auto-review disabled comment posting to fail silently, leaving users without feedback.
              </p>
            </div>
          </div>

          <!-- Glow effect -->
          <div class="absolute -inset-4 bg-teal-500 rounded-3xl blur-[60px] opacity-5 -z-10" />
        </div>
      </div>
    </div>
  </section>
</template>
