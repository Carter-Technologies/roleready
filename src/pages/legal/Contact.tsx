import { Link } from "react-router-dom";
import { LegalPage, LegalSection } from "../../components/legal/LegalPage";
import { LEGAL_EMAIL } from "../../lib/legalMeta";

export function Contact() {
  return (
    <LegalPage
      title="Contact"
      description="Contact Copperfield, the operator of Kigho, for support, privacy requests, and general enquiries."
      lastUpdated="June 2026"
    >
      <p>
        Kigho is operated by Copperfield. For questions about your account, billing, privacy, or the
        platform, please get in touch using the details below.
      </p>

      <LegalSection title="General enquiries">
        <p>
          Email:{" "}
          <a href={`mailto:${LEGAL_EMAIL}`} className="font-medium text-olive-700 hover:underline">
            {LEGAL_EMAIL}
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Delete your account">
        <p>
          The fastest way to delete your Kigho account and all associated data is in the app:
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Log in to Kigho.</li>
          <li>
            Go to{" "}
            <Link to="/settings" className="font-medium text-olive-700 hover:underline">
              Account settings
            </Link>
            .
          </li>
          <li>
            Type <strong>DELETE</strong> in the confirmation field and select &ldquo;Delete my
            account permanently&rdquo;.
          </li>
        </ol>
        <p>
          You can also email{" "}
          <a href={`mailto:${LEGAL_EMAIL}`} className="font-medium text-olive-700 hover:underline">
            {LEGAL_EMAIL}
          </a>{" "}
          with the subject line &ldquo;Delete my account&rdquo; from the email address linked to
          your Kigho account.
        </p>
      </LegalSection>

      <LegalSection title="Privacy requests">
        <p>
          To exercise your data protection rights (access, correction, deletion, or other requests
          under GDPR), email us at{" "}
          <a href={`mailto:${LEGAL_EMAIL}`} className="font-medium text-olive-700 hover:underline">
            {LEGAL_EMAIL}
          </a>{" "}
          with the subject line &ldquo;Privacy request&rdquo;.
        </p>
      </LegalSection>

      <LegalSection title="Billing and subscriptions">
        <p>
          For subscription or payment questions, you can also manage billing through your Kigho
          account billing portal. For additional help, contact{" "}
          <a href={`mailto:${LEGAL_EMAIL}`} className="font-medium text-olive-700 hover:underline">
            {LEGAL_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Operator">
        <p>
          Copperfield
          <br />
          Operator of Kigho
        </p>
      </LegalSection>
    </LegalPage>
  );
}
