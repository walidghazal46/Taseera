// Pricing Constants per Country for Area-based calculation (Price per m2)

// Maps Arabic country names (from CountryPicker) to internal country codes
export const COUNTRY_NAME_TO_CODE = {
  "السعودية": "sa",
  "مصر": "eg",
  "الإمارات": "ae",
  sa: "sa",
  eg: "eg",
  ae: "ae",
};

// Currency info per country code
export const CURRENCY_INFO = {
  sa: { code: "SAR", symbol: "ر.س", name: "ريال سعودي" },
  eg: { code: "EGP", symbol: "ج.م", name: "جنيه مصري" },
  ae: { code: "AED", symbol: "د.إ", name: "درهم إماراتي" },
};

export const AREA_PRICING_BASE = {
  sa: {
    baseRate: 2000, // Average SAR per m2 for standard residential
    finishFactors: { economic: 0.8, medium: 1.0, good: 1.3, luxury: 1.8, ultra: 2.5 },
    typeFactors: { residential: 1.0, commercial: 1.2, office: 1.1, villa: 1.4, industrial: 0.9 },
    distribution: { structural: 0.45, architectural: 0.30, electrical: 0.12, mechanical: 0.13 }
  },
  eg: {
    baseRate: 22000, // EGP per m2 — وسطي سكني 2025 بعد التضخم
    finishFactors: { economic: 0.75, medium: 1.0, good: 1.4, luxury: 2.0, ultra: 3.0 },
    typeFactors: { residential: 1.0, commercial: 1.3, office: 1.2, villa: 1.5, industrial: 0.85 },
    distribution: { structural: 0.40, architectural: 0.35, electrical: 0.10, mechanical: 0.15 }
  },
  ae: {
    baseRate: 2800, // AED per m2 — وسطي سكني 2025
    finishFactors: { economic: 0.85, medium: 1.0, good: 1.25, luxury: 1.7, ultra: 2.3 },
    typeFactors: { residential: 1.0, commercial: 1.25, office: 1.15, villa: 1.45, industrial: 0.95 },
    distribution: { structural: 0.42, architectural: 0.32, electrical: 0.11, mechanical: 0.15 }
  }
};

// MARKET_RATES = أسعار السوق الكاملة (مواد + عمالة + معدات + هامش مقاول) لكل وحدة 2025
// هذه الأسعار تمثل ما يدفعه السوق فعلياً — يُقارن بها سعر التحليل
export const MARKET_RATES = {
  // SAR — المملكة العربية السعودية 2025 (أسعار شاملة موردة ومركبة)
  sa: {
    earthwork: 55,    // م³ — حفر آلي في تربة رملية، شامل قلابات
    concrete: 1050,   // م³ — خرسانة مسلحة C35 كاملة (خرسانة+حديد+شدات+عمالة)
    masonry: 160,     // م² — مباني بلوك 20سم مورد ومركب بالمونة
    finishes: 280,    // م² — متوسط تشطيبات (بلاط+دهانات) مورد ومركب
    steel: 7500,      // طن — هياكل معدنية مورد ومركب وملحق
    openings: 1500,   // عدد — أبواب/شبابيك متوسط مورد ومركب
    electrical: 230,  // م² — أعمال كهربائية لكل م² مبنى
    plumbing: 265,    // م² — أعمال صحية لكل م² مبنى
    hvac: 480,        // م² — تكييف ومعالجة هواء
    thermal: 120,     // م² — عزل مائي وحراري مركب
    fire: 155,        // م² — نظام إنذار ومكافحة حريق
  },
  // EGP — مصر 2025 (بعد تعويم الجنيه، USD/EGP ~50)
  eg: {
    earthwork: 700,
    concrete: 13000,  // م³ — خرسانة مسلحة C35 كاملة
    masonry: 1800,    // م² — بلوك 20سم مورد ومركب
    finishes: 1500,   // م² — تشطيبات متوسطة
    steel: 52000,     // طن — هياكل معدنية
    openings: 22000,
    electrical: 3800,
    plumbing: 4500,
    hvac: 11000,
    thermal: 2200,
    fire: 3200,
  },
  // AED — الإمارات 2025 (قريب من SAR مع هامش عمالة أعلى)
  ae: {
    earthwork: 60,
    concrete: 1150,   // م³ — خرسانة مسلحة C35 كاملة
    masonry: 175,     // م² — بلوك مورد ومركب
    finishes: 310,    // م² — تشطيبات متوسطة
    steel: 8500,      // طن — هياكل معدنية
    openings: 1800,
    electrical: 260,
    plumbing: 295,
    hvac: 530,
    thermal: 130,
    fire: 170,
  },
};

export const COUNTRIES = {
  sa: { name: "المملكة العربية السعودية", flag: "🇸🇦", currency: CURRENCY_INFO.sa.symbol, currencyCode: CURRENCY_INFO.sa.code, currencyName: CURRENCY_INFO.sa.name, rateKey: "sa", rates: MARKET_RATES.sa },
  eg: { name: "جمهورية مصر العربية", flag: "🇪🇬", currency: CURRENCY_INFO.eg.symbol, currencyCode: CURRENCY_INFO.eg.code, currencyName: CURRENCY_INFO.eg.name, rateKey: "eg", rates: MARKET_RATES.eg },
  ae: { name: "الإمارات العربية المتحدة", flag: "🇦🇪", currency: CURRENCY_INFO.ae.symbol, currencyCode: CURRENCY_INFO.ae.code, currencyName: CURRENCY_INFO.ae.name, rateKey: "ae", rates: MARKET_RATES.ae },
};

export const CSI_DIVISIONS = [
  {
    num: "02", ar: "أعمال الموقع والتربة", en: "Sitework / Earthwork", rateKey: "earthwork", unit: "م³",
    items: [
      { num: "02 31 10", ar: "حفر في تربة رملية", unit: "م³" },
      { num: "02 31 20", ar: "حفر في تربة صخرية", unit: "م³" },
      { num: "02 32 10", ar: "ردم بتربة مختارة (سب-بيس)", unit: "م³" },
      { num: "02 32 20", ar: "ردم بالرمل النظيف المورد", unit: "م³" },
    ],
  },
  {
    num: "03", ar: "الخرسانة", en: "Concrete", rateKey: "concrete", unit: "م³",
    items: [
      { num: "03 31 10", ar: "خرسانة عادية للقواعد (فرشة)", unit: "م³" },
      { num: "03 31 20", ar: "خرسانة مسلحة للقواعد C35", unit: "م³" },
      { num: "03 31 30", ar: "خرسانة مسلحة للأعمدة ورقابها", unit: "م³" },
      { num: "03 31 40", ar: "خرسانة مسلحة للأسقف (بلاطات)", unit: "م³" },
      { num: "03 31 50", ar: "خرسانة مسلحة هوردي (بلوك مفرغ)", unit: "م²" },
    ],
  },
  {
    num: "04", ar: "أعمال المباني", en: "Masonry", rateKey: "masonry", unit: "م²",
    items: [
      { num: "04 21 10", ar: "مباني بلوك إسمنتي مقاس 20سم", unit: "م²" },
      { num: "04 21 20", ar: "مباني بلوك أحمر فخاري 20سم", unit: "م²" },
      { num: "04 22 10", ar: "مباني بلوك معزول (أبيض) سيبوركس", unit: "م²" },
      { num: "04 23 10", ar: "مباني قرميد للديكور", unit: "م²" },
    ],
  },
  {
    num: "05", ar: "المعادن والحديد", en: "Metals", rateKey: "steel", unit: "كجم",
    items: [
      { num: "05 12 10", ar: "هياكل حديدية إنشائية (مورد ومركب)", unit: "طن" },
      { num: "05 52 10", ar: "درابزين حديد مشغول", unit: "م.ط" },
      { num: "05 53 10", ar: "درابزين ألمنيوم وزجاج", unit: "م.ط" },
    ],
  },
  {
    num: "07", ar: "العزل والحرارة", en: "Thermal & Moisture", rateKey: "thermal", unit: "م²",
    items: [
      { num: "07 11 10", ar: "عزل مائي بيتومين سائل (بارد)", unit: "م²" },
      { num: "07 12 10", ar: "عزل مائي لفائف (ممبرين) 4مم", unit: "م²" },
      { num: "07 21 10", ar: "عزل حراري (ألواح بولسترين)", unit: "م²" },
    ],
  },
  {
    num: "08", ar: "الأبواب والشبابيك", en: "Openings", rateKey: "openings", unit: "عدد",
    items: [
      { num: "08 11 10", ar: "أبواب خشب سولد (مورد ومركب)", unit: "عدد" },
      { num: "08 11 20", ar: "أبواب حديد مقاومة للحريق", unit: "عدد" },
      { num: "08 51 10", ar: "شبابيك ألمنيوم دبل جلاس", unit: "م²" },
    ],
  },
  {
    num: "09", ar: "التشطيبات", en: "Finishes", rateKey: "finishes", unit: "م²",
    items: [
      { num: "09 21 10", ar: "لياسة (محارة) داخلية ناعمة", unit: "م²" },
      { num: "09 31 10", ar: "تركيب بلاط سيراميك للأرضيات", unit: "م²" },
      { num: "09 31 20", ar: "تركيب بورسلان مقاس كبير (غراء)", unit: "م²" },
      { num: "09 91 10", ar: "دهانات داخلية (وجهين ومعجون)", unit: "م²" },
      { num: "09 91 20", ar: "دهانات خارجية (بروفايل)", unit: "م²" },
    ],
  },
  {
    num: "22", ar: "السباكة والصرف", en: "Plumbing", rateKey: "plumbing", unit: "م²",
    items: [
      { num: "22 11 10", ar: "شبكة تغذية مياه داخلية (PPR)", unit: "م.ط" },
      { num: "22 13 10", ar: "شبكة صرف صحي داخلية (PVC)", unit: "م.ط" },
      { num: "22 41 10", ar: "أطقم صحية (مورد ومركب)", unit: "عدد" },
      { num: "22 33 10", ar: "سخان مياه مركزي 300 لتر", unit: "عدد" },
      { num: "22 11 20", ar: "مضخات مياه مع لوحة التحكم", unit: "بند" },
      { num: "22 01 10", ar: "تأسيس خزان مياه أرضي خرساني", unit: "م³" },
    ],
  },
  {
    num: "23", ar: "التدفئة والتهوية والتكييف", en: "HVAC", rateKey: "hvac", unit: "م²",
    items: [
      { num: "23 62 10", ar: "وحدة تكييف VRF متعدد السرعات 40 طن", unit: "عدد" },
      { num: "23 62 20", ar: "وحدة تكييف VRF متعدد السرعات 50 طن", unit: "عدد" },
      { num: "23 62 30", ar: "وحدة تكييف VRF متعدد السرعات 60 طن", unit: "عدد" },
      { num: "23 74 10", ar: "وحدة مخفية Ducted Concealed 18,000 BTU", unit: "عدد" },
      { num: "23 74 20", ar: "وحدة مخفية Ducted Concealed 48,000 BTU", unit: "عدد" },
      { num: "23 74 30", ar: "وحدة مخفية Ducted Concealed 60,000 BTU", unit: "عدد" },
      { num: "23 64 10", ar: "وحدة تكييف Package Unit 25 طن تبريد", unit: "عدد" },
      { num: "23 64 20", ar: "وحدة سبليت جدارية 30,000 BTU", unit: "عدد" },
      { num: "23 34 10", ar: "مروحة سحب هواء Inline Fan 400 CFM", unit: "عدد" },
      { num: "23 34 20", ar: "مروحة سحب هواء Inline Fan 1000 CFM", unit: "عدد" },
      { num: "23 31 10", ar: "مجاري هواء صاج مجلفن G90 SUPPLY/RETURN SMACNA", unit: "م.ط" },
      { num: "23 31 20", ar: "مجاري هواء دائرية Spiral SMACNA", unit: "م.ط" },
      { num: "23 37 10", ar: "مخارج هواء Supply Square Diffuser ألمنيوم", unit: "عدد" },
      { num: "23 37 20", ar: "مخارج هواء Return Square Diffuser ألمنيوم", unit: "عدد" },
      { num: "23 37 30", ar: "مخارج هواء خطية Supply Linear Slot Diffuser", unit: "عدد" },
      { num: "23 40 10", ar: "أعمال اختبار وموازنة نظام التكييف ASHRAE/SMACNA", unit: "عدد" },
    ],
  },
  {
    num: "26", ar: "الأعمال الكهربائية", en: "Electrical", rateKey: "electrical", unit: "م²",
    items: [
      { num: "26 12 10", ar: "محول كهربائي 1500 KVA مع إجراءات شركة الكهرباء", unit: "عدد" },
      { num: "26 32 10", ar: "مولد كهربائي 300 KVA", unit: "عدد" },
      { num: "26 56 10", ar: "أعمدة إنارة موقع عام نوع PL2", unit: "عدد" },
      { num: "26 51 10", ar: "أجهزة إنارة داخلية أنواع متعددة L1, BH, D1", unit: "عدد" },
      { num: "26 52 10", ar: "أجهزة إنارة طوارئ EM1", unit: "عدد" },
      { num: "26 27 10", ar: "إبريز كهربائي مفرد 230V مع قطب أرضي", unit: "عدد" },
      { num: "26 27 20", ar: "إبريز كهربائي مزدوج 230V مع قطب أرضي", unit: "عدد" },
      { num: "26 51 20", ar: "كابلات نحاسية مسلحة 4Cx240mm² XLPE/PVC", unit: "م.ط" },
      { num: "26 51 30", ar: "كابلات نحاسية مسلحة 4Cx120mm² XLPE/PVC", unit: "م.ط" },
      { num: "26 51 40", ar: "كابلات نحاسية مسلحة مقاومة حريق FIRE RATED", unit: "م.ط" },
      { num: "26 22 10", ar: "لوحة كهربائية DB-PR-HALL 30KVA-36 WAY غرفة المضخات", unit: "عدد" },
      { num: "26 41 10", ar: "نظام تأريض وحماية من الصواعق للمبنى", unit: "عدد" },
      { num: "28 31 10", ar: "نظام إنذار حريق — كاشف دخان كهروضوئي", unit: "عدد" },
      { num: "28 31 20", ar: "نظام إنذار حريق — كاشف متعدد دخان وحراري", unit: "عدد" },
      { num: "28 32 10", ar: "نظام إنذار حريق — كاسر زجاجي مقاوم للعوامل الجوية", unit: "عدد" },
    ],
  },
];

// ===== أسعار الموارد المعتمدة لكل دولة 2025 =====
export const RESOURCE_PRICES = {
  sa: {
    concrete_c20: 200, concrete_c35: 275,
    steel_rebar: 2800, structural_steel: 3500, block_piece: 2.3,
    lab_carpenter: 220, lab_steelfixer: 230, lab_mason: 180,
    lab_finisher: 190, lab_electrician: 210, lab_plumber: 205,
    lab_hvac: 230, lab_site: 160, lab_metal: 240,
    eq_excavator_hr: 185, eq_dump_hr: 65, eq_pump_hr: 140,
    eq_scaffold_day: 80, eq_compactor_day: 120, eq_mixer_day: 95,
    eq_crane_day: 160, eq_vibrator: 20,
  },
  eg: {
    // مواد (EGP) — سوق مصر 2025 بعد تعويم الجنيه (USD/EGP ~50)
    concrete_c20: 2500, concrete_c35: 3200,
    steel_rebar: 28000, structural_steel: 32000, block_piece: 13,
    // عمالة (EGP/يومية) — أجور محلية منخفضة نسبياً
    lab_carpenter: 600, lab_steelfixer: 650, lab_mason: 500,
    lab_finisher: 500, lab_electrician: 550, lab_plumber: 550,
    lab_hvac: 600, lab_site: 380, lab_metal: 650,
    // معدات (EGP) — مرتفعة نسبياً بسبب الوقود والاستيراد
    eq_excavator_hr: 3500, eq_dump_hr: 900, eq_pump_hr: 4000,
    eq_scaffold_day: 2000, eq_compactor_day: 1500, eq_mixer_day: 1200,
    eq_crane_day: 3000, eq_vibrator: 350,
  },
  ae: {
    // مواد (AED) — قريب من SAR (كلاهما مربوط بالدولار)
    concrete_c20: 215, concrete_c35: 290,
    steel_rebar: 3000, structural_steel: 3600, block_piece: 3.0,
    // عمالة (AED/يومية) — أعلى من SA بسبب تكلفة المعيشة
    lab_carpenter: 280, lab_steelfixer: 290, lab_mason: 230,
    lab_finisher: 240, lab_electrician: 265, lab_plumber: 260,
    lab_hvac: 285, lab_site: 210, lab_metal: 300,
    eq_excavator_hr: 200, eq_dump_hr: 70, eq_pump_hr: 155,
    eq_scaffold_day: 95, eq_compactor_day: 130, eq_mixer_day: 103,
    eq_crane_day: 175, eq_vibrator: 25,
  },
};

// Enhanced Resource Calculator — country-aware pricing
export function getDefaultResources(item, div, mktRates, countryCode = "sa") {
  const r = Math.round;
  const mkt = mktRates[div.rateKey] || 1000;
  const unit = (item.unit || div.unit).trim();
  const name = item.ar.toLowerCase();
  const p = RESOURCE_PRICES[countryCode] || RESOURCE_PRICES.sa;

  // 02 SITEWORK / EARTHWORK
  // حفار 100م³/ساعة → 0.01 ساعة/م³ — قلاب 5 رد/يوم لـ200م³ → 0.025 رد/م³
  if (div.rateKey === "earthwork") {
    if (name.includes("حفر")) {
      return {
        مواد: [],
        عمالة: [
          { name: "مراقب موقع", qty: 0.01, unit: "يومية", rate: p.lab_mason, badge: "lab", icon: "👷" },
          { name: "عمال تنظيف وترقيم", qty: 0.04, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" }
        ],
        معدات: [
          { name: "بوكلين / حفار جنزير 200HP", qty: 0.03, unit: "ساعة", rate: p.eq_excavator_hr, badge: "eqp", icon: "🚜" },
          { name: "قلاب لنقل التربة", qty: 0.30, unit: "ساعة", rate: p.eq_dump_hr, badge: "eqp", icon: "🚛" }
        ],
      };
    }
    if (name.includes("ردم")) {
      return {
        مواد: [
          { name: "تربة ردم مختارة (Sub-base)", qty: 1.15, unit: "م³", rate: r(mkt * 0.35), badge: "mat", icon: "⏳" },
          { name: "مياه للرش والدمك", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "mat", icon: "💧" }
        ],
        عمالة: [{ name: "فريق ردم ودحل", qty: 0.05, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" }],
        معدات: [
          { name: "رصاصة (هراص) 10 طن", qty: 0.06, unit: "ساعة", rate: p.eq_compactor_day, badge: "eqp", icon: "🚜" },
          { name: "وايت مياه", qty: 0.01, unit: "رد", rate: r(mkt * 0.3), badge: "eqp", icon: "🚛" }
        ],
      };
    }
  }

  // 03 CONCRETE
  if (div.rateKey === "concrete") {
    if (name.includes("عادية") || name.includes("فرشة")) {
      const q = unit === "م²" ? 0.11 : 1.05;
      return {
        مواد: [
          { name: "خرسانة جاهزة C20/C25", qty: q, unit: "م³", rate: p.concrete_c20, badge: "mat", icon: "🧱" },
          { name: "نايلون بلاستيك تحت الخرسانة", qty: 1.1, unit: "م²", rate: r(mkt * 0.02), badge: "mat", icon: "📜" }
        ],
        عمالة: [
          { name: "فورمجي صب وتخشيب", qty: 0.15, unit: "يومية", rate: p.lab_carpenter, badge: "lab", icon: "👷" }
        ],
        معدات: [
          { name: "هزاز ميكانيكي", qty: 1, unit: "بند", rate: p.eq_vibrator, badge: "eqp", icon: "🛠️" }
        ],
      };
    }
    // نسبة حديد: أساسات 90 كجم/م³ — أسقف وأعمدة 110 كجم/م³
    const qWastage = 1.03;
    const steelRatio = name.includes("أساسات") ? 0.09 : 0.11;
    return {
      مواد: [
        { name: "خرسانة جاهزة C35 OP", qty: qWastage, unit: "م³", rate: p.concrete_c35, badge: "mat", icon: "🧱" },
        { name: "حديد تسليح عالي المقاومة", qty: steelRatio, unit: "طن", rate: p.steel_rebar, badge: "mat", icon: "⚙️" },
        { name: "خشب شدات (معدل استهلاك)", qty: 1, unit: "بند", rate: r(mkt * 0.04), badge: "mat", icon: "🪵" },
        { name: "إكسسوارات (بسكويت/مرابط)", qty: 1, unit: "بند", rate: r(mkt * 0.01), badge: "mat", icon: "🔩" }
      ],
      عمالة: [
        { name: "نجار مسلح متخصص", qty: 0.35, unit: "يومية", rate: p.lab_carpenter, badge: "lab", icon: "👷" },
        { name: "حداد مسلح محترف", qty: 0.3, unit: "يومية", rate: p.lab_steelfixer, badge: "lab", icon: "👷" },
        { name: "عمال صب وهزاز", qty: 0.2, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" }
      ],
      معدات: [
        { name: "مضخة خرسانة (بامب)", qty: 0.12, unit: "ساعة", rate: p.eq_pump_hr, badge: "eqp", icon: "🚛" },
        { name: "هزاز ميكانيكي + لوازم", qty: 1, unit: "بند", rate: p.eq_vibrator, badge: "eqp", icon: "🏗️" }
      ],
    };
  }

  // 04 MASONRY
  if (div.rateKey === "masonry") {
    return {
      مواد: [
        { name: "بلوك إسمنتي 20سم", qty: 13.2, unit: "حبة", rate: p.block_piece, badge: "mat", icon: "🧱" },
        { name: "إسمنت بورتلاندي", qty: 0.2, unit: "كيس", rate: r(mkt * 0.15), badge: "mat", icon: "🪣" },
        { name: "رمل مغسول", qty: 0.03, unit: "م³", rate: r(mkt * 0.05), badge: "mat", icon: "⏳" },
        { name: "شبك زوايا وسلم", qty: 1, unit: "م.ط", rate: r(mkt * 0.02), badge: "mat", icon: "⛓️" }
      ],
      عمالة: [
        { name: "معلم بناء بلوك", qty: 0.22, unit: "يومية", rate: p.lab_mason, badge: "lab", icon: "👷" },
        { name: "عامل خلط ومناولة", qty: 0.25, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" }
      ],
      معدات: [
        // السقالة تخدم ~12م²/يوم، الخلاطة تخدم ~20م²/يوم
        { name: "سقالات معدنية (إيجار)", qty: 0.08, unit: "يوم", rate: p.eq_scaffold_day, badge: "eqp", icon: "🏗️" },
        { name: "خلاطة مونة صغيرة", qty: 0.05, unit: "بند", rate: p.eq_mixer_day, badge: "eqp", icon: "🛠️" }
      ],
    };
  }

  // 05 METALS
  if (div.rateKey === "steel") {
    const isTon = unit === "طن";
    return {
      مواد: [
        { name: "مقاطع حديدية / ألواح صلب", qty: isTon ? 1.05 : 1.1, unit: unit, rate: p.structural_steel, badge: "mat", icon: "⚙️" },
        { name: "مواد لحام ودهان أساس", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "mat", icon: "🧪" }
      ],
      عمالة: [
        { name: "فني حداد وتفصيل", qty: isTon ? 1.2 : 0.25, unit: "يومية", rate: p.lab_metal, badge: "lab", icon: "👷" },
        { name: "فني تركيبات ميدانية", qty: isTon ? 0.8 : 0.15, unit: "يومية", rate: p.lab_metal, badge: "lab", icon: "👷" }
      ],
      معدات: [
        { name: "كرين / ونش رفع", qty: 0.1, unit: "يوم", rate: p.eq_crane_day, badge: "eqp", icon: "🏗️" },
        { name: "مكينة لحام وعدة يدوية", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "eqp", icon: "🛠️" }
      ],
    };
  }

  // 08 OPENINGS
  if (div.rateKey === "openings") {
    return {
      مواد: [
        { name: `بند ${item.ar} (توريد)`, qty: 1, unit: unit, rate: r(mkt * 0.8), badge: "mat", icon: "🚪" },
        { name: "إكسسوارات ومواد تثبيت", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "mat", icon: "🔩" }
      ],
      عمالة: [
        { name: "فني تركيب متخصص", qty: 0.15, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }
      ],
      معدات: [
        { name: "أدوات يدوية وكهربائية", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "eqp", icon: "🛠️" }
      ],
    };
  }

  // 07 THERMAL & MOISTURE
  if (div.rateKey === "thermal") {
    return {
      مواد: [
        { name: "لفائف بيتومين 4مم ساب", qty: 1.15, unit: "م²", rate: r(mkt * 0.6), badge: "mat", icon: "💧" },
        { name: "بريمر أساس (دهان)", qty: 0.3, unit: "لتر", rate: r(mkt * 0.1), badge: "mat", icon: "🖌️" },
        { name: "حماية عزل (ألواح حماية)", qty: 1, unit: "م²", rate: r(mkt * 0.2), badge: "mat", icon: "🛡️" }
      ],
      عمالة: [{ name: "فني عزل وتلحيم", qty: 0.08, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
      معدات: [{ name: "أسطوانات غاز وبوري", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "eqp", icon: "🔥" }],
    };
  }

  // 09 FINISHES
  if (div.rateKey === "finishes") {
    if (name.includes("بلاط") || name.includes("بورسلان")) {
      return {
        مواد: [
          // البلاط ~58% من سعر الوحدة، الغراء والرمل ~5% فقط
          { name: "بلاط / سيراميك نخب أول", qty: 1.08, unit: "م²", rate: r(mkt * 0.58), badge: "mat", icon: "▫️" },
          { name: "غراء تركيب + ترويبة", qty: 1, unit: "بند", rate: r(mkt * 0.04), badge: "mat", icon: "🧴" },
          { name: "رمل ناعم وفرشة تسوية", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "mat", icon: "⏳" }
        ],
        عمالة: [
          { name: "مبلط محترف", qty: 0.1, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" },
          { name: "عامل تنظيف وترويبة", qty: 0.08, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" }
        ],
        معدات: [{ name: "ماكينة قص ديسك + لوازم", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "eqp", icon: "✂️" }],
      };
    }
    if (name.includes("دهان")) {
      return {
        مواد: [
          // معجون + بريمر + دهانين = ~55% من سعر الوحدة
          { name: "معجون داخلي وجهين", qty: 1, unit: "بند", rate: r(mkt * 0.18), badge: "mat", icon: "🎨" },
          { name: "دهان أساس (بريمر)", qty: 1, unit: "بند", rate: r(mkt * 0.12), badge: "mat", icon: "🎨" },
          { name: "دهان نهائي (وجهين) نخب أول", qty: 1, unit: "بند", rate: r(mkt * 0.25), badge: "mat", icon: "🎨" }
        ],
        عمالة: [{ name: "معلم دهان محترف", qty: 0.06, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
        معدات: [{ name: "سقالات داخلية + أدوات", qty: 0.06, unit: "يوم", rate: p.eq_scaffold_day, badge: "eqp", icon: "🪜" }],
      };
    }
  }

  // MEP (22, 23, 26, 28)
  if (["electrical", "plumbing", "hvac", "fire"].includes(div.rateKey)) {
    const labRate = div.rateKey === "plumbing" ? p.lab_plumber
                  : div.rateKey === "hvac" ? p.lab_hvac
                  : p.lab_electrician;
    return {
      مواد: [
        { name: "الأجهزة والمكونات الرئيسية", qty: 1, unit: "بند", rate: r(mkt * 0.6), badge: "mat", icon: "📦" },
        { name: "إكسسوارات تمديدات وربط", qty: 1, unit: "بند", rate: r(mkt * 0.15), badge: "mat", icon: "🔩" }
      ],
      عمالة: [
        { name: "فني تمديدات وأنظمة", qty: 0.15, unit: "يومية", rate: labRate, badge: "lab", icon: "👷" },
        { name: "عامل مساعد MEP", qty: 0.15, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" }
      ],
      معدات: [{ name: "أدوات قياس واختبار", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "eqp", icon: "🧪" }],
    };
  }

  // Fallback
  return {
    مواد: [
      { name: `مواد أساسية لبند ${div.ar}`, qty: 1, unit: unit || "بند", rate: r(mkt * 0.65), badge: "mat", icon: "📦" },
    ],
    عمالة: [
      { name: "عمالة ماهرة", qty: 0.2, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" },
      { name: "عمالة مساعدة", qty: 0.2, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" },
    ],
    معدات: [
      { name: "أدوات ومعدات تشغيل", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "eqp", icon: "🛠️" },
    ],
  };
}
