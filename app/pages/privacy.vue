<script setup lang="ts">
import { hasToken } from "~/services/core/api";

/**
 * Privacy Policy Page
 *
 * Comprehensive privacy policy explaining data collection,
 * processing, and protection practices for Sentinel.
 */

definePageMeta({
  layout: false,
});

useHead({
  title: "Privacy Policy - Sentinel",
  htmlAttrs: {
    class: "scroll-smooth",
  },
  bodyAttrs: {
    class: "bg-white",
  },
});

const isCheckingAuth = ref(true);
const isAuthenticated = ref(false);
const scrolled = ref(false);

onMounted(async () => {
  if (hasToken()) {
    isAuthenticated.value = true;
  }
  isCheckingAuth.value = false;

  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

function handleScroll() {
  scrolled.value = window.scrollY > 20;
}

const lastUpdated = "January 18, 2026";
const effectiveDate = "January 18, 2026";

const sections = [
  { id: "introduction", label: "Introduction" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use-information", label: "How We Use Information" },
  { id: "code-and-repository-data", label: "Code & Repository Data" },
  { id: "ai-and-third-party-processors", label: "AI & Third-Party Processors" },
  { id: "data-retention", label: "Data Retention" },
  { id: "security-measures", label: "Security Measures" },
  { id: "cookies-and-analytics", label: "Cookies & Analytics" },
  { id: "user-rights", label: "Your Rights" },
  { id: "contact", label: "Contact Us" },
];

const activeSection = ref("introduction");

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    activeSection.value = id;
  }
}
</script>

<template>
  <!-- Loading state -->
  <div
    v-if="isCheckingAuth"
    class="landing-light min-h-screen flex items-center justify-center"
  >
    <div class="flex flex-col items-center gap-4">
      <div
        class="w-8 h-8 border-2 border-[var(--landing-border-subtle)] border-t-[var(--landing-accent)] rounded-full animate-spin"
      />
      <span class="text-[var(--landing-text-muted)] text-sm">Loading...</span>
    </div>
  </div>

  <!-- Privacy Policy page -->
  <div
    v-else
    class="landing-light min-h-screen antialiased"
  >
    <!-- Navigation -->
    <LandingNav
      :scrolled="scrolled"
      :is-authenticated="isAuthenticated"
    />

    <!-- Hero -->
    <section class="pt-32 lg:pt-40 pb-12 lg:pb-16 bg-slate-50 border-b border-slate-200">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 mb-6">
          <Icon
            name="lucide:shield-check"
            class="w-3.5 h-3.5"
          />
          Legal
        </div>
        <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">
          Privacy Policy
        </h1>
        <p class="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          How we collect, use, and protect your information
        </p>
        <div class="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500">
          <span class="flex items-center gap-1.5">
            <Icon
              name="lucide:calendar"
              class="w-4 h-4"
            />
            Effective: {{ effectiveDate }}
          </span>
          <span class="flex items-center gap-1.5">
            <Icon
              name="lucide:refresh-cw"
              class="w-4 h-4"
            />
            Updated: {{ lastUpdated }}
          </span>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-12 lg:py-16">
      <div class="max-w-7xl mx-auto px-6">
        <div class="lg:grid lg:grid-cols-12 lg:gap-12">
          <!-- Sidebar Navigation -->
          <aside class="hidden lg:block lg:col-span-3">
            <div class="sticky top-28">
              <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                On this page
              </h3>
              <nav class="space-y-1">
                <button
                  v-for="section in sections"
                  :key="section.id"
                  type="button"
                  class="block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors"
                  :class="activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
                  @click="scrollToSection(section.id)"
                >
                  {{ section.label }}
                </button>
              </nav>
            </div>
          </aside>

          <!-- Content -->
          <article class="lg:col-span-9 prose prose-slate max-w-none">
            <!-- Introduction -->
            <section id="introduction">
              <h2>Introduction</h2>
              <p>
                Sentinel ("we," "our," or "us") provides an AI-powered code review platform designed to help development teams maintain high-quality, secure codebases. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
              </p>
              <p>
                We are committed to protecting your privacy and ensuring you understand how your data is handled. By using Sentinel, you agree to the collection and use of information in accordance with this policy.
              </p>

              <h3>Data Controller</h3>
              <p>
                Sentinel is operated from Nigeria. For the purposes of applicable data protection laws, including the Nigeria Data Protection Act 2023 and GDPR (where applicable), we act as the data controller for personal information collected through our services.
              </p>
            </section>

            <!-- Information We Collect -->
            <section id="information-we-collect">
              <h2>Information We Collect</h2>

              <h3>Account Information</h3>
              <p>When you create an account, we collect:</p>
              <ul>
                <li>Name and email address</li>
                <li>Profile information from OAuth providers (GitHub)</li>
                <li>Profile picture (if provided)</li>
                <li>Workspace and team membership data</li>
              </ul>

              <h3>Repository and Code Data</h3>
              <p>To provide code review services, we access:</p>
              <ul>
                <li>Repository metadata (names, visibility settings)</li>
                <li>Pull request information and diffs</li>
                <li>Code content submitted for review</li>
                <li>Commit history relevant to pull requests</li>
              </ul>

              <h3>Usage Data</h3>
              <p>We automatically collect:</p>
              <ul>
                <li>Review run timestamps and status</li>
                <li>Feature usage patterns</li>
                <li>Performance metrics</li>
                <li>Device and browser information</li>
                <li>IP addresses and approximate location</li>
              </ul>

              <h3>Billing Information</h3>
              <p>
                Payment processing is handled by our payment provider (Polar). We do not store complete credit card numbers. We receive confirmation of successful payments and subscription status.
              </p>
            </section>

            <!-- How We Use Information -->
            <section id="how-we-use-information">
              <h2>How We Use Information</h2>
              <p>We use your information to:</p>
              <ul>
                <li>
                  <strong>Provide our services:</strong> Perform code reviews, generate findings, and deliver results
                </li>
                <li>
                  <strong>Improve our platform:</strong> Analyze usage patterns to enhance features and performance
                </li>
                <li>
                  <strong>Communicate with you:</strong> Send service updates, security alerts, and support responses
                </li>
                <li>
                  <strong>Ensure security:</strong> Detect, prevent, and address technical issues and abuse
                </li>
                <li>
                  <strong>Process payments:</strong> Manage subscriptions and billing
                </li>
                <li>
                  <strong>Comply with legal obligations:</strong> Meet regulatory and legal requirements
                </li>
              </ul>
            </section>

            <!-- Code and Repository Data -->
            <section id="code-and-repository-data">
              <h2>Code & Repository Data</h2>

              <div class="not-prose my-8 p-6 bg-blue-50 border border-blue-100 rounded-xl">
                <div class="flex items-start gap-4">
                  <div class="shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Icon
                      name="lucide:lock"
                      class="w-5 h-5 text-blue-600"
                    />
                  </div>
                  <div>
                    <h4 class="font-semibold text-slate-900 mb-2">
                      Our Code Privacy Commitment
                    </h4>
                    <p class="text-slate-700 leading-relaxed">
                      Sentinel processes source code and repository data solely for the purpose of providing code review and analysis services. <strong>Customer code is not used to train public machine learning models.</strong>
                    </p>
                  </div>
                </div>
              </div>

              <h3>How We Handle Your Code</h3>
              <ul>
                <li>
                  <strong>Purpose-limited processing:</strong> Code is accessed only to perform reviews you request
                </li>
                <li>
                  <strong>No model training:</strong> Your code is never used to train AI models that could expose your intellectual property
                </li>
                <li>
                  <strong>Minimal retention:</strong> Code content is cached temporarily for review processing and then removed
                </li>
                <li>
                  <strong>Access logging:</strong> All access to code data is logged for security and compliance
                </li>
                <li>
                  <strong>Encryption:</strong> Code is encrypted in transit (TLS) and at rest (AES-256)
                </li>
              </ul>

              <h3>BYOK (Bring Your Own Key)</h3>
              <p>
                When you use your own AI provider API keys, your code is sent directly to your chosen provider under your account. We do not store or access the raw responses in these cases. Please review your AI provider's privacy policy for their data handling practices.
              </p>
            </section>

            <!-- AI and Third-Party Processors -->
            <section id="ai-and-third-party-processors">
              <h2>AI & Third-Party Processors</h2>

              <h3>AI Service Providers</h3>
              <p>
                To perform code analysis, we may use third-party AI providers including:
              </p>
              <ul>
                <li>Anthropic (Claude)</li>
                <li>OpenAI (when selected)</li>
                <li>Google (Gemini, when selected)</li>
              </ul>
              <p>
                These providers process code content to generate review findings. Each provider has their own privacy policies and data handling practices. When using our platform-provided AI, we have contractual agreements ensuring your code is not used for model training.
              </p>

              <h3>Other Service Providers</h3>
              <p>We work with trusted providers for:</p>
              <ul>
                <li>
                  <strong>Infrastructure:</strong> Cloud hosting and storage
                </li>
                <li>
                  <strong>Payment processing:</strong> Subscription billing (Polar)
                </li>
                <li>
                  <strong>Analytics:</strong> Usage statistics (anonymized)
                </li>
                <li>
                  <strong>Email:</strong> Transactional notifications
                </li>
              </ul>
            </section>

            <!-- Data Retention -->
            <section id="data-retention">
              <h2>Data Retention</h2>
              <p>We retain different types of data for different periods:</p>

              <div class="not-prose my-6 overflow-hidden rounded-xl border border-slate-200">
                <table class="w-full text-sm">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="text-left py-3 px-4 font-semibold text-slate-900">
                        Data Type
                      </th>
                      <th class="text-left py-3 px-4 font-semibold text-slate-900">
                        Retention Period
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200">
                    <tr>
                      <td class="py-3 px-4 text-slate-700">
                        Account information
                      </td>
                      <td class="py-3 px-4 text-slate-600">
                        Until account deletion
                      </td>
                    </tr>
                    <tr>
                      <td class="py-3 px-4 text-slate-700">
                        Code content (review processing)
                      </td>
                      <td class="py-3 px-4 text-slate-600">
                        Temporary (during review)
                      </td>
                    </tr>
                    <tr>
                      <td class="py-3 px-4 text-slate-700">
                        Review findings
                      </td>
                      <td class="py-3 px-4 text-slate-600">
                        90 days (configurable)
                      </td>
                    </tr>
                    <tr>
                      <td class="py-3 px-4 text-slate-700">
                        Audit logs
                      </td>
                      <td class="py-3 px-4 text-slate-600">
                        1 year
                      </td>
                    </tr>
                    <tr>
                      <td class="py-3 px-4 text-slate-700">
                        Billing records
                      </td>
                      <td class="py-3 px-4 text-slate-600">
                        As required by law (typically 7 years)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Security Measures -->
            <section id="security-measures">
              <h2>Security Measures</h2>
              <p>
                We implement comprehensive security measures to protect your data:
              </p>
              <ul>
                <li>
                  <strong>Encryption:</strong> TLS 1.3 for data in transit, AES-256 for data at rest
                </li>
                <li>
                  <strong>Access controls:</strong> Role-based access, principle of least privilege
                </li>
                <li>
                  <strong>Infrastructure security:</strong> SOC 2 compliant cloud providers
                </li>
                <li>
                  <strong>Monitoring:</strong> Real-time threat detection and logging
                </li>
                <li>
                  <strong>Incident response:</strong> Documented procedures for security events
                </li>
                <li>
                  <strong>Regular audits:</strong> Periodic security assessments and penetration testing
                </li>
              </ul>
            </section>

            <!-- Cookies and Analytics -->
            <section id="cookies-and-analytics">
              <h2>Cookies & Analytics</h2>

              <h3>Cookies We Use</h3>
              <ul>
                <li>
                  <strong>Essential cookies:</strong> Required for authentication and basic functionality
                </li>
                <li>
                  <strong>Preference cookies:</strong> Remember your settings and preferences
                </li>
                <li>
                  <strong>Analytics cookies:</strong> Help us understand usage patterns (can be opted out)
                </li>
              </ul>

              <h3>Analytics</h3>
              <p>
                We use privacy-respecting analytics to understand how our service is used. Analytics data is aggregated and does not identify individual users. We do not sell analytics data to third parties.
              </p>
            </section>

            <!-- User Rights -->
            <section id="user-rights">
              <h2>Your Rights</h2>
              <p>
                Depending on your location, you may have the following rights:
              </p>

              <h3>For All Users</h3>
              <ul>
                <li>
                  <strong>Access:</strong> Request a copy of your personal data
                </li>
                <li>
                  <strong>Correction:</strong> Update inaccurate information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your account and data
                </li>
                <li>
                  <strong>Export:</strong> Receive your data in a portable format
                </li>
              </ul>

              <h3>NDPR Rights (Nigeria)</h3>
              <p>
                Under the Nigeria Data Protection Regulation (NDPR) and Nigeria Data Protection Act 2023, you have the right to:
              </p>
              <ul>
                <li>Be informed about the collection and use of your personal data</li>
                <li>Access your personal data held by us</li>
                <li>Request rectification of inaccurate personal data</li>
                <li>Request erasure of your personal data</li>
                <li>Restrict or object to processing of your personal data</li>
                <li>Data portability (receive your data in a structured format)</li>
                <li>Withdraw consent at any time</li>
                <li>Lodge a complaint with the Nigeria Data Protection Commission (NDPC)</li>
              </ul>

              <h3>GDPR Rights (EEA/UK)</h3>
              <p>
                If you are in the European Economic Area or United Kingdom, you additionally have the right to:
              </p>
              <ul>
                <li>Restrict processing of your data</li>
                <li>Object to certain types of processing</li>
                <li>Withdraw consent at any time</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>

              <h3>Other Jurisdictions</h3>
              <p>
                Users in other jurisdictions may have similar rights under applicable local data protection laws. We are committed to honoring data subject rights regardless of location.
              </p>

              <div class="not-prose my-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p class="text-sm text-slate-600">
                  <strong>Note:</strong> Sentinel does not sell personal information. We process personal data only as described in this policy.
                </p>
              </div>
            </section>

            <!-- Contact -->
            <section id="contact">
              <h2>Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul>
                <li>
                  <strong>Email:</strong>
                  <a href="mailto:privacy@usesentinel.ai">privacy@usesentinel.ai</a>
                </li>
                <li>
                  <strong>General inquiries:</strong>
                  <a href="mailto:hello@usesentinel.ai">hello@usesentinel.ai</a>
                </li>
              </ul>
              <p>
                We will respond to requests within 30 days. For GDPR or CCPA requests, we may need to verify your identity before processing.
              </p>

              <h3>Changes to This Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. For significant changes, we will provide additional notice via email.
              </p>
            </section>
          </article>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <LandingFooter />
  </div>
</template>

<style scoped>
/* Prose customizations for legal content */
.prose h2 {
  @apply text-2xl font-semibold text-slate-900 mt-12 mb-4 pb-2 border-b border-slate-200 first:mt-0;
  scroll-margin-top: 6rem;
}

.prose h3 {
  @apply text-lg font-semibold text-slate-900 mt-8 mb-3;
}

.prose p {
  @apply text-slate-600 leading-relaxed mb-4;
}

.prose ul {
  @apply mb-4 pl-6 space-y-2;
}

.prose li {
  @apply text-slate-600;
}

.prose a {
  @apply text-blue-600 hover:text-blue-700 underline;
}

.prose strong {
  @apply font-semibold text-slate-800;
}

/* Add IDs for scroll targeting */
.prose section {
  scroll-margin-top: 6rem;
}
</style>
