<script setup lang="ts">
import { hasToken } from "~/services/core/api";

/**
 * Terms of Service Page
 *
 * Comprehensive terms governing the use of Sentinel,
 * including acceptable use, liability limitations, and legal terms.
 */

definePageMeta({
  layout: false,
});

useHead({
  title: "Terms of Service - Sentinel",
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
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "description", label: "Service Description" },
  { id: "eligibility", label: "Eligibility" },
  { id: "accounts", label: "Accounts & Access" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "subscription", label: "Subscription & Billing" },
  { id: "byok", label: "BYOK Responsibility" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "ai-limitations", label: "AI Limitations" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing Law" },
  { id: "contact", label: "Contact" },
];

const activeSection = ref("acceptance");

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

  <!-- Terms of Service page -->
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
            name="lucide:file-text"
            class="w-3.5 h-3.5"
          />
          Legal
        </div>
        <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">
          Terms of Service
        </h1>
        <p class="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          The rules and guidelines governing your use of Sentinel
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
            <!-- Acceptance of Terms -->
            <section id="acceptance">
              <h2>Acceptance of Terms</h2>
              <p>
                Welcome to Sentinel. These Terms of Service ("Terms") govern your access to and use of Sentinel's AI-powered code review platform, including our website, applications, and services (collectively, the "Service").
              </p>
              <p>
                By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service. If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
              </p>
            </section>

            <!-- Service Description -->
            <section id="description">
              <h2>Service Description</h2>
              <p>
                Sentinel is an AI-powered code review platform that:
              </p>
              <ul>
                <li>Integrates with code repositories (e.g., GitHub)</li>
                <li>Analyzes pull requests and code changes using AI</li>
                <li>Provides automated feedback, suggestions, and findings</li>
                <li>Generates briefings and reports about development activity</li>
                <li>Supports team collaboration on code quality</li>
              </ul>

              <div class="not-prose my-8 p-6 bg-amber-50 border border-amber-100 rounded-xl">
                <div class="flex items-start gap-4">
                  <div class="shrink-0 w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Icon
                      name="lucide:alert-triangle"
                      class="w-5 h-5 text-amber-600"
                    />
                  </div>
                  <div>
                    <h4 class="font-semibold text-slate-900 mb-2">
                      Important Notice
                    </h4>
                    <p class="text-slate-700 leading-relaxed">
                      Sentinel provides automated and advisory analysis only. Outputs are informational and do not replace human review, professional judgment, or security audits.
                    </p>
                  </div>
                </div>
              </div>

              <h3>Human Review Recommended</h3>
              <p>
                Like any AI-powered tool, Sentinel's suggestions should be reviewed before implementation. We recommend using your professional judgment when deciding which suggestions to accept. AI can occasionally make mistakes or provide recommendations that may not fit your specific context. You remain in control of what changes are applied to your codebase.
              </p>

              <h3>Beta Features</h3>
              <p>
                We may offer beta, experimental, or preview features. These features are provided "as is" without any warranties. Beta features may be modified, suspended, or discontinued at any time without notice. Your use of beta features is at your own risk.
              </p>
            </section>

            <!-- Eligibility -->
            <section id="eligibility">
              <h2>Eligibility</h2>
              <p>To use Sentinel, you must:</p>
              <ul>
                <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
                <li>Have the legal capacity to enter into a binding agreement</li>
                <li>Not be barred from receiving services under applicable law</li>
                <li>Have authorization to access any code repositories you connect</li>
              </ul>
              <p>
                If you are using the Service on behalf of a company or organization, you represent and warrant that you have authority to bind that entity to these Terms.
              </p>
            </section>

            <!-- Accounts and Access -->
            <section id="accounts">
              <h2>Accounts & Access</h2>

              <h3>Account Creation</h3>
              <p>
                To use Sentinel, you must create an account by authenticating through a supported identity provider (e.g., GitHub). You agree to provide accurate information and keep your account credentials secure.
              </p>

              <h3>Workspaces</h3>
              <p>
                Your account may be associated with one or more Workspaces. Each Workspace has its own settings, team members, and billing. You are responsible for:
              </p>
              <ul>
                <li>Managing access to your Workspaces</li>
                <li>Actions taken by team members you invite</li>
                <li>Maintaining appropriate permissions and roles</li>
              </ul>

              <h3>Account Security</h3>
              <p>
                You are responsible for maintaining the security of your account. You must immediately notify us of any unauthorized access or security breaches. We are not liable for any loss or damage from unauthorized account access.
              </p>
            </section>

            <!-- Acceptable Use -->
            <section id="acceptable-use">
              <h2>Acceptable Use</h2>
              <p>You agree to use the Service only for lawful purposes. You must not:</p>
              <ul>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Submit malicious code designed to harm the Service or other users</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Interfere with or disrupt the Service's operation</li>
                <li>Use the Service to develop competing products</li>
                <li>Reverse engineer, decompile, or disassemble the Service</li>
                <li>Use automated tools to scrape or extract data from the Service</li>
                <li>Share your account credentials with unauthorized parties</li>
                <li>Exceed rate limits or abuse API access</li>
              </ul>

              <p>
                We reserve the right to suspend or terminate accounts that violate these terms without prior notice.
              </p>
            </section>

            <!-- Subscription and Billing -->
            <section id="subscription">
              <h2>Subscription & Billing</h2>

              <h3>Plans</h3>
              <p>
                Sentinel offers multiple subscription plans with varying features and limits. Current plans include Foundation (free), Illuminate, Orchestrate, and Sanctum. Features and pricing are described on our pricing page and may change with notice.
              </p>

              <h3>Billing</h3>
              <ul>
                <li>Paid subscriptions are billed monthly or annually in advance</li>
                <li>Payment is processed through our payment provider (Polar)</li>
                <li>You authorize us to charge your payment method for applicable fees</li>
                <li>Failed payments may result in service suspension</li>
              </ul>

              <h3>Plan Changes</h3>
              <ul>
                <li>
                  <strong>Upgrades:</strong> Take effect immediately with prorated billing
                </li>
                <li>
                  <strong>Downgrades:</strong> Take effect at the next billing cycle
                </li>
                <li>
                  <strong>Cancellations:</strong> Access continues until the end of the current billing period
                </li>
              </ul>

              <h3>Refunds</h3>
              <p>
                We generally do not provide refunds for subscription fees. Exceptions may be made at our discretion for service outages or billing errors. Contact support for refund requests.
              </p>

              <h3>Usage Limits</h3>
              <p>
                Each plan includes specific usage limits (e.g., reviews per month, team members). When limits are reached, additional reviews will be gracefully skipped until the next billing period or until you upgrade.
              </p>
            </section>

            <!-- BYOK Responsibility -->
            <section id="byok">
              <h2>BYOK (Bring Your Own Key) Responsibility</h2>
              <p>
                Sentinel allows you to use your own AI provider API keys ("BYOK"). When using BYOK:
              </p>
              <ul>
                <li>
                  <strong>Your responsibility:</strong> You are responsible for your API key security, usage, and associated costs
                </li>
                <li>
                  <strong>Provider terms:</strong> You must comply with your AI provider's terms of service
                </li>
                <li>
                  <strong>Rate limits:</strong> Your provider's rate limits apply; we do not guarantee availability
                </li>
                <li>
                  <strong>Data handling:</strong> Code is sent directly to your provider; review their privacy policy
                </li>
                <li>
                  <strong>Key storage:</strong> Your keys are encrypted at rest; you can revoke them at any time
                </li>
              </ul>
              <p>
                We are not liable for charges incurred on your AI provider accounts or for service interruptions caused by your API keys.
              </p>
            </section>

            <!-- Intellectual Property -->
            <section id="intellectual-property">
              <h2>Intellectual Property</h2>

              <h3>Our Intellectual Property</h3>
              <p>
                Sentinel, including its software, features, design, and documentation, is owned by us and protected by intellectual property laws. Your subscription grants you a limited, non-exclusive, non-transferable license to use the Service.
              </p>

              <h3>Your Content</h3>
              <div class="not-prose my-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p class="text-slate-700 font-medium">
                  You retain all ownership rights to your code and content. We claim no intellectual property rights over the code you submit for review.
                </p>
              </div>
              <p>
                By using the Service, you grant us a limited license to access and process your code solely for the purpose of providing the Service. This license is:
              </p>
              <ul>
                <li>Non-exclusive and revocable</li>
                <li>Limited to providing the requested services</li>
                <li>Not a transfer of ownership</li>
              </ul>

              <h3>Feedback</h3>
              <p>
                If you provide feedback, suggestions, or ideas about the Service, we may use them without obligation or compensation to you.
              </p>
            </section>

            <!-- AI Limitations -->
            <section id="ai-limitations">
              <h2>AI Limitations & Disclaimers</h2>

              <div class="not-prose my-8 p-6 bg-blue-50 border border-blue-100 rounded-xl">
                <h4 class="font-semibold text-slate-900 mb-3">
                  How to Get the Best Results
                </h4>
                <ul class="space-y-2 text-slate-700">
                  <li class="flex items-start gap-2">
                    <Icon
                      name="lucide:check-circle"
                      class="w-4 h-4 text-blue-500 mt-1 shrink-0"
                    />
                    <span>Review AI suggestions before merging - you know your codebase best</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <Icon
                      name="lucide:check-circle"
                      class="w-4 h-4 text-blue-500 mt-1 shrink-0"
                    />
                    <span>Use Sentinel alongside your existing review process for best coverage</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <Icon
                      name="lucide:check-circle"
                      class="w-4 h-4 text-blue-500 mt-1 shrink-0"
                    />
                    <span>Configure custom guidelines to tailor suggestions to your team's standards</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <Icon
                      name="lucide:info"
                      class="w-4 h-4 text-blue-500 mt-1 shrink-0"
                    />
                    <span>For security-critical code, pair AI review with dedicated security audits</span>
                  </li>
                </ul>
              </div>

              <p>
                By using the Service, you understand that:
              </p>
              <ul>
                <li>AI-generated findings are advisory suggestions to assist your development workflow</li>
                <li>You have full discretion over which suggestions to accept, modify, or decline</li>
                <li>The Service is designed to complement your existing code review process, not replace it entirely</li>
                <li>As with any automated tool, AI may occasionally miss issues or suggest changes that don't fit your specific context</li>
                <li>Final implementation decisions remain with you and your team</li>
              </ul>

              <h3>Third-Party AI Providers</h3>
              <p>
                The Service relies on third-party AI providers (such as Anthropic, OpenAI, and Google) to generate code analysis. We do not control these providers and are not responsible for:
              </p>
              <ul>
                <li>The accuracy, quality, or appropriateness of their outputs</li>
                <li>Their availability, uptime, or service interruptions</li>
                <li>Changes to their services, APIs, or pricing</li>
                <li>Their data handling practices (refer to their respective privacy policies)</li>
              </ul>
            </section>

            <!-- Limitation of Liability -->
            <section id="liability">
              <h2>Limitation of Liability</h2>

              <h3>Service Provided "As Is"</h3>
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>

              <h3>Limitation of Damages</h3>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR:
              </p>
              <ul>
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, data, use, or goodwill</li>
                <li>Service interruptions or errors</li>
                <li>Actions taken based on AI-generated suggestions</li>
                <li>Unauthorized access to your account</li>
                <li>Third-party services or content</li>
              </ul>

              <h3>Maximum Liability</h3>
              <p>
                Our total liability for any claims arising from your use of the Service shall not exceed the greater of: (a) the amount you paid us in the 12 months preceding the claim, or (b) the Nigerian Naira equivalent of $100 USD at the prevailing exchange rate.
              </p>

              <h3>No Uptime Guarantee</h3>
              <p>
                We do not guarantee any specific level of service availability or uptime. The Service may be unavailable due to maintenance, updates, or circumstances beyond our control. We are not liable for any losses resulting from service interruptions.
              </p>

              <h3>Force Majeure</h3>
              <p>
                We shall not be liable for any failure or delay in performing our obligations due to circumstances beyond our reasonable control, including but not limited to: natural disasters, acts of government, power outages, internet service provider failures, cyberattacks, pandemics, or failures of third-party AI providers.
              </p>

              <h3>Indemnification</h3>
              <p>
                You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from: (a) your use of the Service, (b) your violation of these Terms, or (c) your violation of any third-party rights.
              </p>
            </section>

            <!-- Termination -->
            <section id="termination">
              <h2>Termination</h2>

              <h3>By You</h3>
              <p>
                You may terminate your account at any time by contacting support or using the account deletion feature. Upon termination:
              </p>
              <ul>
                <li>Your access to the Service will end immediately</li>
                <li>Your data will be deleted according to our retention policies</li>
                <li>No refunds will be provided for unused subscription time</li>
              </ul>

              <h3>By Us</h3>
              <p>
                We may suspend or terminate your access at any time for:
              </p>
              <ul>
                <li>Violation of these Terms</li>
                <li>Abuse of the Service or other users</li>
                <li>Non-payment of fees</li>
                <li>Legal requirements</li>
                <li>Business reasons with reasonable notice</li>
              </ul>

              <h3>Effect of Termination</h3>
              <p>
                Termination does not affect any rights or obligations that accrued before termination. Sections that by their nature should survive termination will survive (e.g., intellectual property, limitation of liability, indemnification).
              </p>
            </section>

            <!-- Governing Law -->
            <section id="governing-law">
              <h2>Governing Law & Disputes</h2>

              <h3>Governing Law</h3>
              <p>
                These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to conflict of law principles.
              </p>

              <h3>Dispute Resolution</h3>
              <p>
                Any disputes arising from these Terms or the Service shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes will be resolved through binding arbitration under the Arbitration and Mediation Act 2023 of Nigeria. The seat of arbitration shall be Lagos, Nigeria.
              </p>

              <h3>Jurisdiction</h3>
              <p>
                For matters not subject to arbitration, the courts of the Federal Republic of Nigeria shall have exclusive jurisdiction. Either party may seek injunctive relief in any court of competent jurisdiction for violations of intellectual property rights or confidentiality obligations.
              </p>

              <h3>Changes to Terms</h3>
              <p>
                We may update these Terms from time to time. We will notify you of material changes via email or through the Service. Continued use after changes take effect constitutes acceptance of the new Terms.
              </p>
            </section>

            <!-- Contact -->
            <section id="contact">
              <h2>Contact</h2>
              <p>
                For questions about these Terms of Service, please contact us:
              </p>
              <ul>
                <li>
                  <strong>Email:</strong>
                  <a href="mailto:legal@usesentinel.ai">legal@usesentinel.ai</a>
                </li>
                <li>
                  <strong>General inquiries:</strong>
                  <a href="mailto:hello@usesentinel.ai">hello@usesentinel.ai</a>
                </li>
              </ul>

              <h3>Severability</h3>
              <p>
                If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
              </p>

              <h3>Entire Agreement</h3>
              <p>
                These Terms, together with our Privacy Policy and any other agreements referenced herein, constitute the entire agreement between you and Sentinel regarding the Service.
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
