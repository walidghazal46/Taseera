export const SUPER_ADMIN_EMAIL = "walidghazal46@gmail.com";

export const PACKAGES = {
  monthly: {
    id: "monthly",
    nameAr: "الباقة الشهرية",
    nameEn: "Monthly",
    price: 49,
    currency: "SAR",
    durationMonths: 1,
    durationLabel: { ar: "شهر واحد", en: "1 Month" },
    badge: null,
    highlight: false,
    featuresAr: [
      "وصول كامل لجميع ميزات التطبيق",
      "تسعير مفصّل لبنود الأعمال",
      "دليل الشركات والموردين",
      "حفظ وتصدير التحليلات",
      "دعم فني عبر البريد الإلكتروني",
    ],
    featuresEn: [
      "Full access to all app features",
      "Detailed work item pricing",
      "Companies & suppliers directory",
      "Save and export analyses",
      "Email technical support",
    ],
  },
  six_months: {
    id: "six_months",
    nameAr: "باقة 6 أشهر",
    nameEn: "6 Months",
    price: 199,
    currency: "SAR",
    durationMonths: 6,
    durationLabel: { ar: "ستة أشهر", en: "6 Months" },
    badge: null,
    highlight: false,
    featuresAr: [
      "جميع مميزات الباقة الشهرية",
      "توفير 17% مقارنة بالاشتراك الشهري",
      "تسعير مفصّل لبنود الأعمال",
      "دليل الشركات والموردين",
      "حفظ وتصدير التحليلات",
      "دعم فني عبر البريد الإلكتروني",
    ],
    featuresEn: [
      "Everything in Monthly",
      "Save 17% vs monthly billing",
      "Detailed work item pricing",
      "Companies & suppliers directory",
      "Save and export analyses",
      "Email technical support",
    ],
  },
  yearly: {
    id: "yearly",
    nameAr: "الباقة السنوية",
    nameEn: "Yearly",
    price: 299,
    currency: "SAR",
    durationMonths: 12,
    durationLabel: { ar: "سنة كاملة", en: "12 Months" },
    badge: { ar: "خصم 50% · عرض محدود", en: "50% Off · Limited Offer" },
    highlight: true,
    featuresAr: [
      "جميع مميزات باقة 6 أشهر",
      "توفير 49% مقارنة بالاشتراك الشهري",
      "أولوية في الدعم الفني",
      "وصول مبكر للميزات الجديدة",
      "تسعير مفصّل لجميع البنود",
      "دليل الشركات والموردين",
      "حفظ وتصدير التحليلات",
    ],
    featuresEn: [
      "Everything in 6 Months",
      "Save 49% vs monthly billing",
      "Priority technical support",
      "Early access to new features",
      "All detailed pricing items",
      "Companies & suppliers directory",
      "Save and export analyses",
    ],
  },
};

export const PACKAGES_LIST = Object.values(PACKAGES);

export const SUBSCRIPTION_STATUS = {
  GUEST_TRIAL: "guest_trial",
  REGISTERED_TRIAL: "registered_trial",
  TRIAL_EXPIRED: "trial_expired",
  PENDING_PAYMENT: "pending_payment",
  ACTIVE: "active",
  EXPIRED: "expired",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
};

export const GUEST_TRIAL_DAYS = 7;
export const REGISTERED_TRIAL_DAYS = 14;
