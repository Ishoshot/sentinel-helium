<script setup lang="ts">
/**
 * Landing page mockup section 
 * Floating UI cards showing the Sentinel dashboard
 */

defineProps<{
  visible: boolean
}>()

// Sample data for the mockup
const findings = [
  { severity: 'critical', message: 'SQL injection vulnerability detected', file: 'UserController.php', line: 45 },
  { severity: 'warning', message: 'Missing null check before method call', file: 'OrderService.php', line: 128 },
  { severity: 'info', message: 'Consider extracting to a separate method', file: 'PaymentGateway.php', line: 67 },
]

const recentRuns = [
  { repo: 'acme/api', pr: '#234', status: 'completed', findings: 3, time: '2m ago' },
  { repo: 'acme/web', pr: '#891', status: 'completed', findings: 0, time: '5m ago' },
  { repo: 'acme/mobile', pr: '#156', status: 'running', findings: null, time: 'Now' },
]
</script>

<template>
  <div
    class="relative transition-all duration-1000 ease-out delay-200"
    :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
  >
    <!-- Subtle shadow effects behind the mockup -->
    <div class="absolute -inset-8 pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-5" />
      <div class="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500 rounded-full blur-[100px] opacity-5" />
    </div>

    <!-- Main dashboard mockup -->
    <div class="relative max-w-5xl mx-auto">
      <!-- Central card - Main findings view -->
      <div class="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-2xl">
        <!-- Window header -->
        <div class="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div class="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div class="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div class="flex-1 text-center">
            <span class="text-xs text-slate-500">Sentinel - Code Review Dashboard</span>
          </div>
        </div>

        <!-- Dashboard content -->
        <div class="p-6">
          <!-- Header row -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Icon
                  name="ph:shield-check-bold"
                  class="w-4 h-4 text-white"
                />
              </div>
              <div>
                <div class="text-sm font-medium text-slate-900">acme/api</div>
                <div class="text-xs text-slate-500">Pull Request #234</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-600">
                3 findings
              </span>
              <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-600">
                Completed
              </span>
            </div>
          </div>

          <!-- Findings list -->
          <div class="space-y-3">
            <div
              v-for="(finding, index) in findings"
              :key="index"
              class="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
            >
              <!-- Severity indicator -->
              <div
                class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                :class="{
                  'bg-red-500': finding.severity === 'critical',
                  'bg-amber-500': finding.severity === 'warning',
                  'bg-blue-400': finding.severity === 'info',
                }"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm text-slate-900 truncate">{{ finding.message }}</div>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-slate-500">{{ finding.file }}</span>
                  <span class="text-xs text-slate-400">line {{ finding.line }}</span>
                </div>
              </div>
              <Icon
                name="ph:arrow-right"
                class="w-4 h-4 text-slate-400 flex-shrink-0"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Floating card - Recent runs (positioned to the left) -->
      <div class="absolute -left-4 lg:-left-20 top-1/2 -translate-y-1/2 hidden lg:block landing-float-delayed z-10">
        <div class="w-64 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xl">
          <div class="px-4 py-3 border-b border-slate-100">
            <div class="text-xs font-medium text-slate-900">Recent Runs</div>
          </div>
          <div class="p-3 space-y-2">
            <div
              v-for="(run, index) in recentRuns"
              :key="index"
              class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div class="flex items-center gap-2 min-w-0">
                <div
                  class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  :class="{
                    'bg-emerald-500': run.status === 'completed',
                    'bg-amber-500 animate-pulse': run.status === 'running',
                  }"
                />
                <div class="min-w-0">
                  <div class="text-xs text-slate-900 truncate">{{ run.repo }}</div>
                  <div class="text-[10px] text-slate-500">{{ run.pr }}</div>
                </div>
              </div>
              <div class="text-[10px] text-slate-400 flex-shrink-0">
                {{ run.time }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating card - Stats (positioned to the right) -->
      <div class="absolute -right-4 lg:-right-16 top-1/3 hidden lg:block landing-float-delayed-2 z-10">
        <div class="w-48 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xl p-4">
          <div class="text-xs text-slate-500 mb-3">This week</div>
          <div class="space-y-3">
            <div>
              <div class="text-2xl font-semibold text-slate-900">127</div>
              <div class="text-xs text-slate-500">Reviews completed</div>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div class="h-full w-[85%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
              </div>
              <span class="text-xs text-emerald-600">85%</span>
            </div>
            <div class="text-xs text-slate-500">issues resolved</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trust section -->
    <div class="mt-16 text-center">
      <p class="text-sm text-slate-500">Trusted by teams who want to ship fast</p>
    </div>
  </div>
</template>
