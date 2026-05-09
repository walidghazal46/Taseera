import { MANUAL_PAYMENT_DETAILS, PAYMENT_METHODS, PLAN_DEFINITIONS } from "./subscriptionService";

function encode(value) {
  return encodeURIComponent(String(value || ""));
}

export function buildPaymentReceiptEmail({
  language = "ar",
  userName = "",
  userEmail = "",
  userCode = "",
  selectedPlan = "monthly",
  amount = 0,
  paymentMethod = "bank_transfer",
  paymentDate = new Date(),
}) {
  const plan = PLAN_DEFINITIONS[selectedPlan];
  const method = PAYMENT_METHODS[paymentMethod];
  const date = paymentDate instanceof Date ? paymentDate : new Date(paymentDate);
  const paymentDateText = Number.isNaN(date.getTime()) ? new Date().toLocaleDateString("en-GB") : date.toLocaleString("en-GB");
  const subject = `Payment Receipt - ${userCode || "USER"} - ${selectedPlan}`;
  const bodyLines = [
    "User Name:",
    userName || "",
    "",
    "User Email:",
    userEmail || "",
    "",
    "User Code:",
    userCode || "",
    "",
    "Selected Plan:",
    plan?.titleEn || selectedPlan,
    "",
    "Amount:",
    `${amount} SAR`,
    "",
    "Payment Method:",
    method?.labelEn || paymentMethod,
    "",
    "Payment Date:",
    paymentDateText,
    "",
    "Please find attached the payment receipt for subscription activation.",
  ];

  return {
    to: MANUAL_PAYMENT_DETAILS.supportEmail,
    subject,
    body: bodyLines.join("\n"),
    mailto: `mailto:${MANUAL_PAYMENT_DETAILS.supportEmail}?subject=${encode(subject)}&body=${encode(bodyLines.join("\n"))}`,
    message:
      language === "en"
        ? "Email has been opened to send the payment receipt. Please attach the receipt image and send it. The plan will be reviewed and activated within 48 hours after receipt."
        : "تم فتح البريد الإلكتروني لإرسال إيصال الدفع. يرجى إرفاق صورة الإيصال وإرساله. سيتم مراجعة الإيصال وتفعيل الباقة خلال 48 ساعة بعد استلامه.",
  };
}

export function openPaymentReceiptEmail({ systemBridge, ...payload }) {
  const email = buildPaymentReceiptEmail(payload);
  if (systemBridge?.openEmail) {
    systemBridge.openEmail(email.to, email.subject, email.body);
  } else if (typeof window !== "undefined") {
    window.location.href = email.mailto;
  }
  return email;
}
