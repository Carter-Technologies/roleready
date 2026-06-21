import { Link } from "react-router-dom";
import { LegalList, LegalPage, LegalSection } from "../../components/legal/LegalPage";
import { LEGAL_EMAIL } from "../../lib/legalMeta";

export function Refunds() {
  return (
    <LegalPage
      title="Kigho Refund Policy"
      description="Refund and cancellation policy for Kigho Pro subscriptions operated by Copperfield."
      lastUpdated="June 2026"
    >
      <p>
        This Refund Policy applies to paid subscriptions for Kigho, operated by Copperfield. By
        subscribing to Kigho Pro, you agree to this policy in addition to our{" "}
        <Link to="/terms" className="font-medium text-olive-700 hover:underline">
          Terms of Service
        </Link>
        .
      </p>

      <LegalSection title="1. Subscriptions">
        <p>
          Kigho Pro is billed on a recurring monthly basis through Stripe. Your subscription
          renews automatically unless you cancel before the next billing date.
        </p>
      </LegalSection>

      <LegalSection title="2. Cancelling your subscription">
        <p>
          You can cancel at any time from your account billing portal. After cancellation, you will
          retain Pro access until the end of your current billing period. You will not be charged
          again unless you resubscribe.
        </p>
      </LegalSection>

      <LegalSection title="3. Refunds">
        <p>
          Unless required by applicable law, subscription fees are generally non-refundable once a
          billing period has started.
        </p>
        <p>We may issue a refund at our discretion in cases such as:</p>
        <LegalList
          items={[
            "Duplicate or erroneous charges",
            "Technical issues that prevented meaningful use of Pro features",
            "Other exceptional circumstances reviewed on a case-by-case basis",
          ]}
        />
        <p>
          If you believe you are entitled to a refund, contact us at{" "}
          <a href={`mailto:${LEGAL_EMAIL}`} className="font-medium text-olive-700 hover:underline">
            {LEGAL_EMAIL}
          </a>{" "}
          within 14 days of the charge, including your account email and transaction details.
        </p>
      </LegalSection>

      <LegalSection title="4. EU and UK consumers">
        <p>
          If you are a consumer in the European Union or United Kingdom, you may have a statutory
          right to withdraw from a distance contract within 14 days of purchase. If you have already
          used Pro features during that period, a proportionate amount may be deducted from any
          refund as permitted by law.
        </p>
      </LegalSection>

      <LegalSection title="5. Chargebacks">
        <p>
          If you have a billing issue, please contact us before initiating a chargeback so we can
          help resolve it promptly.
        </p>
      </LegalSection>

      <LegalSection title="6. Contact">
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
