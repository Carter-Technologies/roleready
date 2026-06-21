import { Link } from "react-router-dom";
import { LegalList, LegalPage, LegalSection } from "../../components/legal/LegalPage";
import { LEGAL_EMAIL } from "../../lib/legalMeta";

export function Privacy() {
  return (
    <LegalPage
      title="Kigho Privacy Policy"
      description="Privacy Policy for Kigho, the AI-powered CV and cover letter platform operated by Copperfield."
      lastUpdated="June 2026"
    >
      <p>
        Kigho is an AI-powered CV and cover letter platform operated by Copperfield.
      </p>
      <p>
        In this Privacy Policy, &ldquo;Copperfield&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, and
        &ldquo;our&rdquo; refer to the business responsible for operating Kigho. &ldquo;Kigho&rdquo;
        refers to the product, platform, website, and related services.
      </p>

      <LegalSection title="1. Information We Collect">
        <p>We may collect the following information:</p>
        <p className="font-medium text-slate-800">Account information:</p>
        <LegalList items={["Name", "Email address", "Login details"]} />
        <p className="font-medium text-slate-800">Application information:</p>
        <LegalList
          items={[
            "CVs and resumes uploaded by users",
            "Cover letters uploaded by users",
            "Job descriptions submitted by users",
            "AI-generated CVs, cover letters, and related application materials",
          ]}
        />
        <p className="font-medium text-slate-800">Payment information:</p>
        <LegalList
          items={[
            "Subscription plan",
            "Billing status",
            "Transaction details provided by our payment processor",
          ]}
        />
        <p>
          Copperfield does not store full card details. Payments are processed by Stripe or another
          secure payment provider.
        </p>
        <p className="font-medium text-slate-800">Technical information:</p>
        <LegalList
          items={[
            "IP address",
            "Browser type",
            "Device information",
            "Usage data",
            "Log data",
            "Cookies or similar technologies where applicable",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <p>We use your information to:</p>
        <LegalList
          items={[
            "Provide the Kigho service",
            "Generate tailored CVs and cover letters",
            "Manage user accounts",
            "Process subscriptions and payments",
            "Provide support",
            "Improve our product",
            "Prevent misuse, fraud, and security issues",
            "Comply with legal obligations",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Legal Basis for Processing">
        <p>Where GDPR applies, we process personal data on the following legal bases:</p>
        <LegalList
          items={[
            "Performance of a contract",
            "Legitimate interests",
            "Legal obligations",
            "Consent, where required",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. AI Processing">
        <p>
          Kigho uses artificial intelligence to help generate and tailor job application materials.
        </p>
        <p>
          Information you submit, such as CVs and job descriptions, may be processed by third-party
          AI providers solely to provide the service.
        </p>
        <p>
          You should not upload highly sensitive personal information unless it is necessary for your
          use of the platform.
        </p>
      </LegalSection>

      <LegalSection title="5. Third-Party Providers">
        <p>We may use trusted third-party providers, including:</p>
        <LegalList
          items={[
            "Stripe for payments",
            "Supabase for authentication and database services",
            "OpenRouter and AI model providers for AI generation",
            "Hosting and infrastructure providers",
            "Analytics providers, where applicable",
          ]}
        />
        <p>These providers only process data as needed to provide their services to Copperfield.</p>
      </LegalSection>

      <LegalSection title="6. Data Retention and Deletion">
        <p>
          We retain personal data only for as long as necessary to provide Kigho, comply with legal
          obligations, resolve disputes, and enforce our agreements.
        </p>
        <p className="font-medium text-slate-800">Delete your account in Kigho</p>
        <p>
          You can permanently delete your account and associated data at any time from your account
          settings:
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Log in to Kigho.</li>
          <li>
            Open{" "}
            <Link to="/settings" className="font-medium text-olive-700 hover:underline">
              Account settings
            </Link>
            .
          </li>
          <li>
            In &ldquo;Delete your account&rdquo;, type <strong>DELETE</strong> and confirm.
          </li>
        </ol>
        <p>This removes your profile, saved CVs, generation history, and job tracker data.</p>
        <p>
          If you have an active Pro subscription, it will be cancelled as part of account deletion.
        </p>
        <p className="font-medium text-slate-800">Request deletion by email</p>
        <p>
          Alternatively, email{" "}
          <a href={`mailto:${LEGAL_EMAIL}`} className="font-medium text-olive-700 hover:underline">
            {LEGAL_EMAIL}
          </a>{" "}
          from your account email with the subject line &ldquo;Delete my account&rdquo;. We will
          verify your request and complete deletion within 30 days.
        </p>
      </LegalSection>

      <LegalSection title="7. Your Rights">
        <p>
          If you are located in the EU, EEA, UK, or another region with applicable privacy rights,
          you may have the right to:
        </p>
        <LegalList
          items={[
            "Access your personal data",
            "Correct inaccurate data",
            "Request deletion",
            "Restrict processing",
            "Object to processing",
            "Request data portability",
            "Withdraw consent where processing is based on consent",
          ]}
        />
        <p>To exercise these rights, use Account settings to delete your data or contact us using the details below.</p>
      </LegalSection>

      <LegalSection title="8. Security">
        <p>We use reasonable technical and organisational measures to protect your information.</p>
        <p>However, no online service can guarantee complete security.</p>
      </LegalSection>

      <LegalSection title="9. Children">
        <p>Kigho is not intended for children under 16.</p>
      </LegalSection>

      <LegalSection title="10. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. The latest version will be posted on
          this page.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>For privacy requests, contact:</p>
        <p>
          Copperfield
          <br />
          Operator of Kigho
          <br />
          Email:{" "}
          <a href={`mailto:${LEGAL_EMAIL}`} className="font-medium text-olive-700 hover:underline">
            {LEGAL_EMAIL}
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
