<script setup lang="ts">
/**
 * Landing page dashboard mockup - EXACT replica
 * Full dashboard UI matching the actual Sentinel app
 * Interactive hover states to feel real and alive
 */

defineProps<{
  visible: boolean
}>()
</script>

<template>
  <div
    class="relative transition-all duration-1000 ease-out delay-200"
    :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
  >
    <!-- Dashboard Mockup -->
    <div class="max-w-[1400px] mx-auto px-4">
      <div class="relative">
        <!-- Glow effect -->
        <div class="absolute -inset-4 bg-gradient-to-r from-teal-500/20 via-cyan-500/10 to-teal-500/20 rounded-3xl blur-3xl opacity-40" />

        <!-- Browser container -->
        <div class="relative rounded-xl overflow-hidden border border-[#232328] shadow-2xl shadow-black/60 bg-[#1c1c1e]">
          <!-- Browser chrome bar -->
          <div class="h-11 bg-[#2a2a2c] border-b border-[#3a3a3c] flex items-center px-4 relative">
            <!-- macOS traffic light buttons -->
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] hover:brightness-110 transition-all cursor-pointer" />
              <div class="w-3 h-3 rounded-full bg-[#febc2e] border border-[#dea123] hover:brightness-110 transition-all cursor-pointer" />
              <div class="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] hover:brightness-110 transition-all cursor-pointer" />
            </div>

            <!-- URL bar - absolutely centered -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="flex items-center gap-2 px-4 py-1.5 bg-[#1c1c1e] rounded-md pointer-events-auto">
                <Icon name="ph:lock-simple-fill" class="w-3 h-3 text-zinc-500" />
                <span class="text-[12px] text-zinc-400">app.usesentinel.ai</span>
              </div>
            </div>
          </div>

          <!-- Dashboard frame -->
          <div class="relative">
          <!-- Top header bar - full width -->
          <div class="h-[56px] bg-[#18181b] border-b border-[#232328] flex items-center">
            <!-- Logo section (sidebar width) -->
            <div class="w-[200px] h-full px-4 flex items-center gap-2 border-r border-[#232328]">
              <SentinelLogo size="sm" :show-text="true" />
            </div>
            <!-- Workspace section -->
            <div class="flex-1 h-full px-4 flex items-center justify-between">
              <!-- Workspace switcher - interactive -->
              <button class="flex items-center gap-2 px-2 py-1.5 -ml-2 rounded-lg cursor-pointer hover:bg-zinc-800/50 transition-all duration-150 group">
                <div class="w-7 h-7 rounded-lg bg-[#134e4a] text-teal-400 flex items-center justify-center text-[11px] font-bold group-hover:bg-[#166b5c] transition-colors">HW</div>
                <span class="text-[14px] text-zinc-400 group-hover:text-zinc-300 transition-colors">Hydrogenn Work...</span>
                <Icon name="ph:caret-up-down" class="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                <span class="text-[14px] text-zinc-300 ml-1">Hydrogenn Workspace</span>
              </button>
              <div class="flex items-center gap-1">
                <button class="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all duration-150 cursor-pointer">
                  <Icon name="ph:gear" class="w-[22px] h-[22px]" />
                </button>
                <button class="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all duration-150 cursor-pointer">
                  <Icon name="ph:bell" class="w-[22px] h-[22px]" />
                </button>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="flex">
            <!-- Sidebar -->
            <div class="hidden lg:flex w-[200px] flex-col bg-[#18181b] border-r border-[#232328]">
              <!-- Nav items -->
              <nav class="flex-1 py-3">
                <!-- Overview - Active -->
                <a href="#" class="mx-2 mb-1 flex items-center gap-3 px-3 py-2.5 rounded-lg bg-teal-500/15 text-teal-400 cursor-pointer transition-all duration-150 hover:bg-teal-500/20">
                  <Icon name="ph:squares-four-fill" class="w-[20px] h-[20px]" />
                  <span class="text-[14px] font-medium">Overview</span>
                </a>
                <!-- Repositories -->
                <a href="#" class="mx-2 mb-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 cursor-pointer transition-all duration-150 hover:bg-zinc-800/50 hover:text-zinc-200">
                  <Icon name="ph:git-branch" class="w-[20px] h-[20px]" />
                  <span class="text-[14px]">Repositories</span>
                </a>
                <!-- Code Reviews -->
                <a href="#" class="mx-2 mb-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 cursor-pointer transition-all duration-150 hover:bg-zinc-800/50 hover:text-zinc-200">
                  <Icon name="ph:git-pull-request" class="w-[20px] h-[20px]" />
                  <span class="text-[14px]">Code Reviews</span>
                </a>
                <!-- Briefings -->
                <a href="#" class="mx-2 mb-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 cursor-pointer transition-all duration-150 hover:bg-zinc-800/50 hover:text-zinc-200">
                  <Icon name="ph:sparkle" class="w-[20px] h-[20px]" />
                  <span class="text-[14px]">Briefings</span>
                </a>

                <!-- WORKSPACE label -->
                <div class="mt-6 mb-2 px-5">
                  <span class="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">Workspace</span>
                </div>
                <!-- Members -->
                <a href="#" class="mx-2 mb-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 cursor-pointer transition-all duration-150 hover:bg-zinc-800/50 hover:text-zinc-200">
                  <Icon name="ph:users" class="w-[20px] h-[20px]" />
                  <span class="text-[14px]">Members</span>
                </a>
                <!-- Settings -->
                <a href="#" class="mx-2 mb-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 cursor-pointer transition-all duration-150 hover:bg-zinc-800/50 hover:text-zinc-200">
                  <Icon name="ph:gear" class="w-[20px] h-[20px]" />
                  <span class="text-[14px]">Settings</span>
                </a>
                <!-- Integrations -->
                <a href="#" class="mx-2 mb-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 cursor-pointer transition-all duration-150 hover:bg-zinc-800/50 hover:text-zinc-200">
                  <Icon name="ph:plug" class="w-[20px] h-[20px]" />
                  <span class="text-[14px]">Integrations</span>
                </a>
                <!-- API Keys -->
                <a href="#" class="mx-2 mb-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 cursor-pointer transition-all duration-150 hover:bg-zinc-800/50 hover:text-zinc-200">
                  <Icon name="ph:key" class="w-[20px] h-[20px]" />
                  <span class="text-[14px]">API Keys</span>
                </a>
                <!-- Billing -->
                <a href="#" class="mx-2 mb-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 cursor-pointer transition-all duration-150 hover:bg-zinc-800/50 hover:text-zinc-200">
                  <Icon name="ph:credit-card" class="w-[20px] h-[20px]" />
                  <span class="text-[14px]">Billing</span>
                </a>

                <!-- Spacer -->
                <div class="flex-1 min-h-[40px]" />

                <!-- Learn -->
                <a href="#" class="mx-2 mb-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 cursor-pointer transition-all duration-150 hover:bg-zinc-800/50 hover:text-zinc-200">
                  <Icon name="ph:book-open" class="w-[20px] h-[20px]" />
                  <span class="text-[14px]">Learn</span>
                </a>
              </nav>

              <!-- User section - interactive -->
              <button class="p-3 border-t border-[#232328] cursor-pointer hover:bg-zinc-800/30 transition-all duration-150 w-full text-left">
                <div class="flex items-center gap-2.5 px-1">
                  <div class="relative flex-shrink-0">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500" />
                    <div class="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#18181b]" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-[13px] font-medium text-zinc-200 truncate">Oluwatobi Ishola</div>
                    <div class="text-[11px] text-zinc-500 truncate">ishoshot@gmail.c...</div>
                  </div>
                  <Icon name="ph:caret-up-down" class="w-4 h-4 text-zinc-600 flex-shrink-0" />
                </div>
              </button>

              <!-- Bottom toggle - interactive -->
              <button class="px-4 py-3 border-t border-[#232328] flex justify-center cursor-pointer hover:bg-zinc-800/30 transition-all duration-150">
                <Icon name="ph:sidebar-simple" class="w-5 h-5 text-zinc-600 hover:text-zinc-400 transition-colors" />
              </button>
            </div>

            <!-- Main content -->
            <div class="flex-1 min-w-0 bg-[#0e0e10]">
              <div class="p-6 lg:p-8">
                <!-- Page title -->
                <h2 class="text-[28px] font-semibold text-white mb-6">Overview</h2>

                <!-- Stats row - interactive cards -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <!-- Total Runs -->
                  <div class="p-5 rounded-xl bg-[#18181b] border border-[#232328] cursor-pointer transition-all duration-200 hover:border-[#333338] hover:bg-[#1a1a1e] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
                    <div class="flex items-start justify-between mb-3">
                      <span class="text-[13px] text-zinc-500">Total Runs</span>
                      <div class="w-9 h-9 rounded-full bg-teal-500/10 flex items-center justify-center">
                        <Icon name="ph:play-fill" class="w-5 h-5 text-teal-400" />
                      </div>
                    </div>
                    <div class="text-[40px] font-bold text-white leading-none tracking-tight">13</div>
                    <div class="text-[12px] text-zinc-600 mt-2">Code reviews executed</div>
                  </div>

                  <!-- Total Findings -->
                  <div class="p-5 rounded-xl bg-[#18181b] border border-[#232328] cursor-pointer transition-all duration-200 hover:border-[#333338] hover:bg-[#1a1a1e] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
                    <div class="flex items-start justify-between mb-3">
                      <span class="text-[13px] text-zinc-500">Total Findings</span>
                      <div class="w-9 h-9 rounded-full bg-cyan-500/10 flex items-center justify-center">
                        <Icon name="ph:info" class="w-5 h-5 text-cyan-400" />
                      </div>
                    </div>
                    <div class="text-[40px] font-bold text-white leading-none tracking-tight">25</div>
                    <div class="text-[12px] text-zinc-600 mt-2">Issues discovered</div>
                  </div>

                  <!-- Avg Duration -->
                  <div class="p-5 rounded-xl bg-[#18181b] border border-[#232328] cursor-pointer transition-all duration-200 hover:border-[#333338] hover:bg-[#1a1a1e] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
                    <div class="flex items-start justify-between mb-3">
                      <span class="text-[13px] text-zinc-500">Avg Duration</span>
                      <div class="w-9 h-9 rounded-full bg-teal-500/10 flex items-center justify-center">
                        <Icon name="ph:clock" class="w-5 h-5 text-teal-400" />
                      </div>
                    </div>
                    <div class="text-[40px] font-bold text-white leading-none tracking-tight">1m</div>
                    <div class="text-[12px] text-zinc-600 mt-2">Average review time</div>
                  </div>

                  <!-- Active Repositories -->
                  <div class="p-5 rounded-xl bg-[#18181b] border border-[#232328] cursor-pointer transition-all duration-200 hover:border-[#333338] hover:bg-[#1a1a1e] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
                    <div class="flex items-start justify-between mb-3">
                      <span class="text-[13px] text-zinc-500">Active Repositories</span>
                      <div class="w-9 h-9 rounded-full bg-teal-500/10 flex items-center justify-center">
                        <Icon name="ph:git-branch" class="w-5 h-5 text-teal-400" />
                      </div>
                    </div>
                    <div class="text-[40px] font-bold text-white leading-none tracking-tight">3</div>
                    <div class="text-[12px] text-zinc-600 mt-2">Repositories with recent activity</div>
                  </div>
                </div>

                <!-- Get started - interactive -->
                <button class="w-full p-5 rounded-xl bg-[#18181b] border border-[#232328] flex items-center justify-between mb-8 cursor-pointer transition-all duration-200 hover:border-[#333338] hover:bg-[#1a1a1e] text-left">
                  <div class="flex items-center gap-4">
                    <div class="relative w-12 h-12">
                      <svg class="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="#232328" stroke-width="3" />
                        <circle cx="24" cy="24" r="20" fill="none" stroke="#14b8a6" stroke-width="3" stroke-dasharray="83.8 125.6" stroke-linecap="round" />
                      </svg>
                      <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-[13px] font-bold text-teal-400">2/3</span>
                      </div>
                    </div>
                    <div>
                      <div class="text-[15px] font-semibold text-white">Get started</div>
                      <div class="text-[13px] text-zinc-500">1 step remaining</div>
                    </div>
                  </div>
                  <Icon name="ph:caret-down" class="w-5 h-5 text-zinc-500" />
                </button>

                <!-- ANALYTICS -->
                <div class="mb-5">
                  <span class="text-[12px] font-semibold text-zinc-600 uppercase tracking-wider">Analytics</span>
                </div>

                <!-- Charts - interactive -->
                <div class="grid lg:grid-cols-2 gap-4">
                  <!-- Run Activity -->
                  <div class="p-5 rounded-xl bg-[#18181b] border border-[#232328] transition-all duration-200 hover:border-[#2a2a30]">
                    <div class="mb-6">
                      <h4 class="text-[16px] font-semibold text-white">Run Activity</h4>
                      <p class="text-[13px] text-zinc-500">Successful and failed runs over time</p>
                    </div>

                    <div class="relative h-[220px]">
                      <!-- Y axis -->
                      <div class="absolute left-0 top-0 bottom-8 w-5 flex flex-col justify-between text-[11px] text-zinc-600">
                        <span>3</span>
                        <span>2</span>
                        <span>1</span>
                        <span>0</span>
                      </div>

                      <!-- Chart -->
                      <div class="ml-6 h-[calc(100%-32px)] relative">
                        <!-- Grid -->
                        <div class="absolute inset-0 flex flex-col justify-between">
                          <div class="border-b border-zinc-800/40" />
                          <div class="border-b border-zinc-800/40" />
                          <div class="border-b border-zinc-800/40" />
                          <div class="border-b border-zinc-800/40" />
                        </div>

                        <!-- Lines SVG -->
                        <svg class="absolute inset-0 w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                          <!-- Teal line (successful) - bell curve shape -->
                          <path
                            d="M0,170 C60,165 100,155 150,130 C200,100 230,60 270,40 C310,20 350,30 390,60 C440,95 480,140 500,155"
                            fill="none"
                            stroke="#14b8a6"
                            stroke-width="2.5"
                            class="drop-shadow-[0_0_8px_rgba(20,184,166,0.4)]"
                          />
                          <!-- Rose line (failed) - smaller bump -->
                          <path
                            d="M0,175 C70,172 120,168 170,155 C210,145 240,130 280,138 C330,148 390,165 450,172 C480,175 500,176 500,176"
                            fill="none"
                            stroke="#f43f5e"
                            stroke-width="2.5"
                            class="drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                          />
                        </svg>
                      </div>

                      <!-- X axis -->
                      <div class="absolute bottom-0 left-6 right-0 flex justify-between text-[11px] text-zinc-600">
                        <span>2026-01-14</span>
                        <span>2026-01-16</span>
                        <span>2026-01-27</span>
                        <span>2026-01-30</span>
                      </div>
                    </div>

                    <!-- Legend -->
                    <div class="flex items-center justify-center gap-6 mt-2">
                      <div class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <div class="w-3 h-3 rounded-full bg-teal-500 shadow-lg shadow-teal-500/30" />
                        <span class="text-[12px] text-zinc-400">Successful</span>
                      </div>
                      <div class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <div class="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/30" />
                        <span class="text-[12px] text-zinc-400">Failed</span>
                      </div>
                    </div>

                    <!-- Chart icon -->
                    <div class="flex justify-end mt-2">
                      <button class="p-1 rounded hover:bg-zinc-800/50 transition-colors cursor-pointer">
                        <Icon name="ph:chart-line" class="w-5 h-5 text-zinc-600 hover:text-zinc-400 transition-colors" />
                      </button>
                    </div>
                  </div>

                  <!-- Findings by Severity -->
                  <div class="p-5 rounded-xl bg-[#18181b] border border-[#232328] transition-all duration-200 hover:border-[#2a2a30]">
                    <div class="mb-6">
                      <h4 class="text-[16px] font-semibold text-white">Findings by Severity</h4>
                      <p class="text-[13px] text-zinc-500">Distribution of findings across severity levels</p>
                    </div>

                    <div class="relative h-[220px]">
                      <!-- Y axis (0 to 1) -->
                      <div class="absolute left-0 top-0 bottom-8 w-5 flex flex-col justify-between text-[10px] text-zinc-600">
                        <span>1</span>
                        <span>0.9</span>
                        <span>0.8</span>
                        <span>0.7</span>
                        <span>0.6</span>
                        <span>0.5</span>
                        <span>0.4</span>
                        <span>0.3</span>
                        <span>0.2</span>
                        <span>0.1</span>
                        <span>0</span>
                      </div>

                      <!-- Donut + Legend -->
                      <div class="ml-8 h-[calc(100%-32px)] flex items-center justify-center gap-8">
                        <!-- Donut -->
                        <div class="relative w-[150px] h-[150px] flex-shrink-0 cursor-pointer group">
                          <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90 transition-transform duration-300 group-hover:scale-105">
                            <!-- Critical (rose) -->
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#f43f5e" stroke-width="12" stroke-dasharray="40 211" stroke-dashoffset="0" class="drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]" />
                            <!-- High (orange) -->
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" stroke-width="12" stroke-dasharray="60 191" stroke-dashoffset="-40" class="drop-shadow-[0_0_6px_rgba(249,115,22,0.4)]" />
                            <!-- Medium (yellow) -->
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#eab308" stroke-width="12" stroke-dasharray="50 201" stroke-dashoffset="-100" class="drop-shadow-[0_0_6px_rgba(234,179,8,0.4)]" />
                            <!-- Low (blue) -->
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" stroke-width="12" stroke-dasharray="101 150" stroke-dashoffset="-150" class="drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]" />
                          </svg>
                        </div>

                        <!-- Legend -->
                        <div class="space-y-3">
                          <div class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <div class="w-4 h-3 rounded-sm bg-rose-500 shadow-sm shadow-rose-500/30" />
                            <span class="text-[12px] text-zinc-400">Critical</span>
                          </div>
                          <div class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <div class="w-4 h-3 rounded-sm bg-orange-500 shadow-sm shadow-orange-500/30" />
                            <span class="text-[12px] text-zinc-400">High</span>
                          </div>
                          <div class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <div class="w-4 h-3 rounded-sm bg-blue-500 shadow-sm shadow-blue-500/30" />
                            <span class="text-[12px] text-zinc-400">Low</span>
                          </div>
                          <div class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <div class="w-4 h-3 rounded-sm bg-yellow-500 shadow-sm shadow-yellow-500/30" />
                            <span class="text-[12px] text-zinc-400">Medium</span>
                          </div>
                        </div>
                      </div>

                      <!-- X axis -->
                      <div class="absolute bottom-0 left-8 right-0 flex justify-between text-[11px] text-zinc-600 pr-4">
                        <span>0</span>
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        <!-- Bottom fade -->
        <div class="absolute -bottom-24 left-0 right-0 h-40 bg-gradient-to-b from-transparent via-[#09090b]/90 to-[#09090b] pointer-events-none" />
      </div>
    </div>
  </div>
</template>
