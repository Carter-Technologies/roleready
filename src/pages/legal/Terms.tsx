import { Link } from "react-router-dom";
import { LegalList, LegalPage, LegalSection } from "../../components/legal/LegalPage";
import { LEGAL_EMAIL } from "../../lib/legalMeta";

export function Terms() {
  return (
    <LegalPage
      title="Kigho Terms of Service"
      description="Terms of Service for Kigho, the AI-powered CV and cover letter platform operated by Copperfield."
      lastUpdated="June 2026"
    >
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of Kigho, an
        AI-powered CV and cover letter platform operated by Copperfield.
      </p>
      <p>
        In these Terms, &ldquo;Copperfield&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, and
        &ldquo;our&rdquo; refer to the business responsible for operating Kigho. &ldquo;Kigho&rdquo;
        refers to the product, platform, website, and related services. &ldquo;You&rdquo; refers to
        the individual or entity using Kigho.
      </p>
      <p>
        By creating an account or using Kigho, you agree to these Terms. If you do not agree, do not
        use the service.
      </p>

      <LegalSection title="1. The Service">
        <p>
          Kigho helps users tailor CVs and cover letters, analyse applications, track job
          applications, and access related career tools. Features may vary by plan (free or Pro).
        </p>
        <p>
          We may update, modify, or discontinue features at any time. We will use reasonable efforts
          to notify users of material changes where appropriate.
        </p>
      </LegalSection>

      <LegalSection title="2. Accounts">
        <p>You must provide accurate account information and keep your login credentials secure.</p>
        <p>
          You are responsible for all activity under your account. Notify us immediately if you
          suspect unauthorised access.
        </p>
        <p>You must be at least 16 years old to use Kigho.</p>
      </LegalSection>

      <LegalSection title="3. Subscriptions and Payments">
        <p>
          Paid features are billed on a subscription basis through Stripe. Prices are shown on our{" "}
          <Link to="/pricing" className="font-medium text-olive-700 hover:underline">
            pricing page
          </Link>{" "}
          at the time of purchase.
        </p>
        <p>
          Subscriptions renew automatically unless cancelled before the renewal date. You can manage
          or cancel your subscription through the billing portal in your account.
        </p>
        <p>
          Refunds are handled in accordance with our{" "}
          <Link to="/refunds" className="font-medium text-olive-700 hover:underline">
            Refund Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="4. AI-Generated Content">
        <p>
          Kigho uses artificial intelligence to generate and tailor content. AI output may contain
          errors, omissions, or inaccuracies.
        </p>
        <p>
          You are solely responsible for reviewing, editing, and approving any content before
          submitting it to employers or third parties. Copperfield does not guarantee that
          AI-generated materials will result in interviews, offers, or employment.
        </p>
        <p>
          Do not rely on Kigho as a substitute for professional legal, immigration, or career
          advice.
        </p>
      </LegalSection>

      <LegalSection title="5. Your Content">
        <p>
          You retain ownership of content you upload to Kigho (such as CVs and job descriptions).
          You grant Copperfield a limited licence to process that content solely to provide and
          improve the service.
        </p>
        <p>
          You must not upload content that infringes third-party rights, contains unlawful material,
          or violates these Terms.
        </p>
      </LegalSection>

      <LegalSection title="6. Acceptable Use">
        <p>You agree not to:</p>
        <LegalList
          items={[
            "Misuse the service or attempt to gain unauthorised access",
            "Reverse engineer, scrape, or overload our systems",
            "Use Kigho for unlawful, fraudulent, or harmful purposes",
            "Share account access in a way that violates your plan limits",
            "Upload malware or malicious code",
          ]}
        />
        <p>We may suspend or terminate accounts that violate these Terms.</p>
      </LegalSection>

      <LegalSection title="7. Intellectual Property">
        <p>
          Kigho, including its branding, software, and design, is owned by Copperfield or its
          licensors. These Terms do not grant you any rights to our intellectual property except as
          needed to use the service.
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimer of Warranties">
        <p>
          Kigho is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of
          any kind, whether express or implied, including fitness for a particular purpose or
          non-infringement.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation of Liability">
        <p>
          To the fullest extent permitted by law, Copperfield will not be liable for indirect,
          incidental, special, consequential, or punitive damages, or for loss of profits, data, or
          goodwill arising from your use of Kigho.
        </p>
        <p>
          Our total liability for any claim relating to the service will not exceed the amount you
          paid to Copperfield for Kigho in the twelve months before the claim arose, or €100 if you
          have not paid anything.
        </p>
        <p>Nothing in these Terms limits liability that cannot be limited under applicable law.</p>
      </LegalSection>

      <LegalSection title="10. Termination">
        <p>
          You may stop using Kigho at any time. You can permanently delete your account and data
          from{" "}
          <Link to="/settings" className="font-medium text-olive-700 hover:underline">
            Account settings
          </Link>{" "}
          or by contacting us at{" "}
          <a href={`mailto:${LEGAL_EMAIL}`} className="font-medium text-olive-700 hover:underline">
            {LEGAL_EMAIL}
          </a>
          .
        </p>
        <p>
          We may suspend or terminate access if you breach these Terms or if required for legal,
          security, or operational reasons.
        </p>
        <p>
          Upon termination, your right to use the service ends. Provisions that by their nature
          should survive will remain in effect.
        </p>
      </LegalSection>

      <LegalSection title="11. Governing Law">
        <p>
          These Terms are governed by the laws of Ireland, without regard to conflict-of-law
          principles. Courts in Ireland shall have exclusive jurisdiction, subject to mandatory
          consumer protections in your country of residence where applicable.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes">
        <p>
          We may update these Terms from time to time. The latest version will be posted on this
          page. Continued use of Kigho after changes take effect constitutes acceptance of the
          updated Terms.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>For questions about these Terms, contact:</p>
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
