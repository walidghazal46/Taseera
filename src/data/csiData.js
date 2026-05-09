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
    general: 45,      // م² — متطلبات عامة (مكاتب مؤقتة+سياج+لوحات+سلامة)
    wood: 380,        // م² — أعمال خشب/MDF/PVC مورد ومركب
    specialties: 850, // عدد — تجهيزات ثابتة (حواجز+خزائن+مظلات)
    equipment: 5000,  // بند — معدات متخصصة (حسب النوع والحجم)
    conveying: 165000, // عدد — مصعد ركاب 6 أشخاص / 4 محطات كامل التركيب
    fire_supp: 120,   // م² — نظام رشاشات sprinkler مورد ومركب
    comms: 220,       // نقطة — شبكة بيانات Cat6 شاملة Patch Panel
    security: 1200,   // عدد — كاميرا CCTV IP 4K مورد ومركب
  },
  // EGP — مصر 2025 (بعد تعويم الجنيه، USD/EGP ~50)
  eg: {
    earthwork: 700,
    concrete: 22000,  // م³ — خرسانة مسلحة C35 كاملة
    masonry: 1800,    // م² — بلوك 20سم مورد ومركب
    finishes: 3500,   // م² — تشطيبات متوسطة
    steel: 52000,     // طن — هياكل معدنية
    openings: 22000,
    electrical: 3800,
    plumbing: 4500,
    hvac: 11000,
    thermal: 2200,
    fire: 3200,
    general: 580,
    wood: 4900,
    specialties: 11000,
    equipment: 65000,
    conveying: 2000000,
    fire_supp: 1550,
    comms: 2850,
    security: 15600,
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
    general: 50,
    wood: 420,
    specialties: 950,
    equipment: 5500,
    conveying: 185000,
    fire_supp: 135,
    comms: 240,
    security: 1350,
  },
};

export const COUNTRIES = {
  sa: { name: "المملكة العربية السعودية", flag: "🇸🇦", currency: CURRENCY_INFO.sa.symbol, currencyCode: CURRENCY_INFO.sa.code, currencyName: CURRENCY_INFO.sa.name, rateKey: "sa", rates: MARKET_RATES.sa },
  eg: { name: "جمهورية مصر العربية", flag: "🇪🇬", currency: CURRENCY_INFO.eg.symbol, currencyCode: CURRENCY_INFO.eg.code, currencyName: CURRENCY_INFO.eg.name, rateKey: "eg", rates: MARKET_RATES.eg },
  ae: { name: "الإمارات العربية المتحدة", flag: "🇦🇪", currency: CURRENCY_INFO.ae.symbol, currencyCode: CURRENCY_INFO.ae.code, currencyName: CURRENCY_INFO.ae.name, rateKey: "ae", rates: MARKET_RATES.ae },
};

export const CSI_DIVISIONS = [
  {
    num: "01", ar: "المتطلبات العامة", en: "General Requirements", rateKey: "general", unit: "م²",
    items: [
      { num: "01 50 13", ar: "مكتب مقاول مؤقت (كرفان مجهز بالأثاث)", unit: "بند" },
      { num: "01 51 10", ar: "سياج موقع مؤقت (ألواح ألمنيوم معدني)", unit: "م.ط" },
      { num: "01 52 10", ar: "لوحة معلومات المشروع (مطبوعة UV)", unit: "عدد" },
      { num: "01 74 10", ar: "تنظيف موقع دوري وإزالة مخلفات البناء", unit: "م²" },
      { num: "01 35 10", ar: "خطة إدارة جودة وسلامة (QA/HSE Plan)", unit: "بند" },
      { num: "01 56 10", ar: "متطلبات السلامة والتصاريح الحكومية", unit: "بند" },
    ],
  },
  {
    num: "02", ar: "أعمال الموقع والتربة", en: "Sitework / Earthwork", rateKey: "earthwork", unit: "م³",
    items: [
      { num: "02 20 10", ar: "تسوية موقع وتشكيل رقاب (Grading)", unit: "م²" },
      { num: "02 31 10", ar: "حفر في تربة رملية", unit: "م³" },
      { num: "02 31 20", ar: "حفر في تربة صخرية", unit: "م³" },
      { num: "02 31 30", ar: "حفر في تربة طينية صلبة (Hard Clay)", unit: "م³" },
      { num: "02 32 10", ar: "ردم بتربة مختارة (سب-بيس)", unit: "م³" },
      { num: "02 32 20", ar: "ردم بالرمل النظيف المورد", unit: "م³" },
      { num: "02 41 10", ar: "هدم مبنى قائم وإزالة مخلفاته", unit: "م²" },
      { num: "02 65 10", ar: "معالجة التربة الضعيفة (استبدال وتحسين)", unit: "م³" },
      { num: "02 74 10", ar: "تمديد صرف مياه أمطار (مواسير PVC+مناهل)", unit: "م.ط" },
      { num: "02 82 10", ar: "نقل تربة زائدة خارج الموقع (قلابات)", unit: "م³" },
    ],
  },
  {
    num: "03", ar: "الخرسانة", en: "Concrete", rateKey: "concrete", unit: "م³",
    items: [
      { num: "03 11 10", ar: "حديد تسليح (ريبار) مورد ومركب", unit: "طن" },
      { num: "03 15 10", ar: "حوائط خرسانية استنادية (Retaining Wall)", unit: "م²" },
      { num: "03 31 10", ar: "خرسانة عادية للقواعد (فرشة)", unit: "م³" },
      { num: "03 31 20", ar: "خرسانة مسلحة للقواعد C35", unit: "م³" },
      { num: "03 31 30", ar: "خرسانة مسلحة للأعمدة ورقابها", unit: "م³" },
      { num: "03 31 40", ar: "خرسانة مسلحة للأسقف (بلاطات)", unit: "م³" },
      { num: "03 31 50", ar: "خرسانة مسلحة هوردي (بلوك مفرغ)", unit: "م²" },
      { num: "03 31 60", ar: "خرسانة مسلحة للجوائز والكمرات C35", unit: "م³" },
      { num: "03 31 70", ar: "سلم خرساني مسلح (درج داخلي)", unit: "م.ط" },
      { num: "03 35 10", ar: "أرضية خرسانة مشطوفة بالجلاخة (Polished)", unit: "م²" },
      { num: "03 37 10", ar: "خرسانة مضخوخة بمضخة طيار", unit: "م³" },
      { num: "03 52 10", ar: "بلاطة خرسانية مسبقة الصنع (Precast)", unit: "م²" },
    ],
  },
  {
    num: "04", ar: "أعمال المباني", en: "Masonry", rateKey: "masonry", unit: "م²",
    items: [
      { num: "04 21 10", ar: "مباني بلوك إسمنتي مقاس 20سم", unit: "م²" },
      { num: "04 21 20", ar: "مباني بلوك أحمر فخاري 20سم", unit: "م²" },
      { num: "04 21 30", ar: "مباني بلوك إسمنتي 10سم (حواجز فاصلة)", unit: "م²" },
      { num: "04 22 10", ar: "مباني بلوك معزول (أبيض) سيبوركس", unit: "م²" },
      { num: "04 22 20", ar: "بلوك خرساني ثقيل 25سم (Hollow Block)", unit: "م²" },
      { num: "04 23 10", ar: "مباني قرميد للديكور", unit: "م²" },
      { num: "04 43 10", ar: "مباني حجر طبيعي صماء (بناء حجري)", unit: "م²" },
      { num: "04 71 10", ar: "حقن فراغات وتدعيم أساسات (Grouting)", unit: "م³" },
    ],
  },
  {
    num: "05", ar: "المعادن والحديد", en: "Metals", rateKey: "steel", unit: "كجم",
    items: [
      { num: "05 12 10", ar: "هياكل حديدية إنشائية (مورد ومركب)", unit: "طن" },
      { num: "05 12 20", ar: "كمرات صلب IPN / IPE (مورد ومركب)", unit: "طن" },
      { num: "05 31 10", ar: "بلاطة صاج مموج (Deck Slab) مورد ومركب", unit: "م²" },
      { num: "05 50 10", ar: "أعمال حداد عام (بوابات وشبابيك حديد)", unit: "م²" },
      { num: "05 51 10", ar: "سلالم حديدية داخلية (مورد ومركب)", unit: "رقية" },
      { num: "05 52 10", ar: "درابزين حديد مشغول", unit: "م.ط" },
      { num: "05 53 10", ar: "درابزين ألمنيوم وزجاج", unit: "م.ط" },
      { num: "05 58 10", ar: "شبك سياج حديدي مجلفن + أعمدة", unit: "م.ط" },
      { num: "05 75 10", ar: "هنجر / ورشة هيكل حديد خفيف مورد ومركب", unit: "م²" },
    ],
  },
  {
    num: "06", ar: "الأخشاب والبلاستيك والمركبات", en: "Wood, Plastics & Composites", rateKey: "wood", unit: "م²",
    items: [
      { num: "06 10 10", ar: "قوالب صب خرسانة (شدة خشبية)", unit: "م²" },
      { num: "06 20 10", ar: "أعمال نجارة باطونيه داخلية (ديكور+إطارات)", unit: "م²" },
      { num: "06 41 10", ar: "أرضيات خشبية طبيعية باركيه (مورد ومركب)", unit: "م²" },
      { num: "06 41 20", ar: "أرضيات خشبية هندسية Engineered Wood", unit: "م²" },
      { num: "06 41 30", ar: "أرضيات لامينيت (مورد ومركب)", unit: "م²" },
      { num: "06 44 10", ar: "ألواح MDF للديكور الداخلي (مدهون)", unit: "م²" },
      { num: "06 45 10", ar: "خزائن مطبخ MDF ميلامين (مورد ومركب)", unit: "م.ط" },
      { num: "06 46 10", ar: "أبواب MDF مدهونة داخلية (مورد ومركب)", unit: "عدد" },
      { num: "06 62 10", ar: "كلادينج PVC للجدران الداخلية", unit: "م²" },
      { num: "06 62 20", ar: "ديكور وينسكوتينج خشبي للجدران (Wall Panel)", unit: "م²" },
    ],
  },
  {
    num: "07", ar: "العزل والحرارة", en: "Thermal & Moisture", rateKey: "thermal", unit: "م²",
    items: [
      { num: "07 11 10", ar: "عزل مائي بيتومين سائل (بارد)", unit: "م²" },
      { num: "07 11 20", ar: "عزل مائي سيليكون للأسطح المستوية", unit: "م²" },
      { num: "07 12 10", ar: "عزل مائي لفائف (ممبرين) 4مم", unit: "م²" },
      { num: "07 21 10", ar: "عزل حراري (ألواح بولسترين)", unit: "م²" },
      { num: "07 21 20", ar: "عزل حراري XPS صلب للأسطح (5سم)", unit: "م²" },
      { num: "07 22 10", ar: "رغوة PU بالرش (Spray Foam) في الفراغات", unit: "م²" },
      { num: "07 41 10", ar: "شيت ستيل مموج للأسقف الصناعية (Roof Sheet)", unit: "م²" },
      { num: "07 84 10", ar: "عزل صوتي ألياف زجاجية (Glass Wool 50مم)", unit: "م²" },
      { num: "07 92 10", ar: "حشو فواصل التمدد (Expansion Joint Sealant)", unit: "م.ط" },
    ],
  },
  {
    num: "08", ar: "الأبواب والشبابيك", en: "Openings", rateKey: "openings", unit: "عدد",
    items: [
      { num: "08 11 10", ar: "أبواب خشب سولد (مورد ومركب)", unit: "عدد" },
      { num: "08 11 20", ar: "أبواب حديد مقاومة للحريق", unit: "عدد" },
      { num: "08 11 30", ar: "أبواب ألمنيوم دبل جلاس (مورد ومركب)", unit: "عدد" },
      { num: "08 31 10", ar: "أبواب HDF ميلامين غرف (مورد ومركب)", unit: "عدد" },
      { num: "08 44 10", ar: "واجهات زجاجية كرتينول (Curtain Wall)", unit: "م²" },
      { num: "08 51 10", ar: "شبابيك ألمنيوم دبل جلاس", unit: "م²" },
      { num: "08 51 20", ar: "شبابيك PVC دبل جلاس (مورد ومركب)", unit: "م²" },
      { num: "08 71 10", ar: "أقفال ومقابض أبواب استانلس ستيل", unit: "عدد" },
      { num: "08 81 10", ar: "زجاج أمان لامينيت (Laminated Safety Glass)", unit: "م²" },
    ],
  },
  {
    num: "09", ar: "التشطيبات", en: "Finishes", rateKey: "finishes", unit: "م²",
    items: [
      { num: "09 21 10", ar: "لياسة (محارة) داخلية ناعمة", unit: "م²" },
      { num: "09 21 20", ar: "لياسة خارجية (محارة واجهات)", unit: "م²" },
      { num: "09 21 30", ar: "جبس ديكور داخلي (معجون + تسوية)", unit: "م²" },
      { num: "09 31 10", ar: "تركيب بلاط سيراميك للأرضيات", unit: "م²" },
      { num: "09 31 20", ar: "تركيب بورسلان مقاس كبير (غراء)", unit: "م²" },
      { num: "09 31 30", ar: "بورسلان جداري (كلادينج جدران داخلي)", unit: "م²" },
      { num: "09 31 40", ar: "رخام طبيعي أرضيات (مورد ومركب)", unit: "م²" },
      { num: "09 31 50", ar: "جرانيت أرضيات (مورد ومركب)", unit: "م²" },
      { num: "09 40 10", ar: "كلادينج حجر طبيعي للواجهات الخارجية", unit: "م²" },
      { num: "09 51 10", ar: "أسقف مستعارة جبس بورد على هيكل معدني", unit: "م²" },
      { num: "09 51 20", ar: "أسقف آرمسترونج ألياف معدنية 60×60", unit: "م²" },
      { num: "09 65 10", ar: "أرضيات SPC / LVT فينيل فاخر (مورد ومركب)", unit: "م²" },
      { num: "09 65 20", ar: "سجادة (موكيت) مكتبي مع جلد أسفنجي", unit: "م²" },
      { num: "09 67 10", ar: "إيبوكسي أرضيات صناعي (2مم / 3مم)", unit: "م²" },
      { num: "09 72 10", ar: "جدران جبس بورد داخلية (هيكل معدني ستاد)", unit: "م²" },
      { num: "09 72 20", ar: "جدران بلوك جبسي خفيف (10 / 12سم)", unit: "م²" },
      { num: "09 91 10", ar: "دهانات داخلية (وجهين ومعجون)", unit: "م²" },
      { num: "09 91 20", ar: "دهانات خارجية (بروفايل)", unit: "م²" },
      { num: "09 91 30", ar: "دهان إيبوكسي للمواقف والمخازن", unit: "م²" },
      { num: "09 91 40", ar: "طلاء اكريليك مرن للواجهات (Elastomeric)", unit: "م²" },
      { num: "09 96 10", ar: "طلاء ناري للحماية من الحريق (Intumescent)", unit: "م²" },
    ],
  },
  {
    num: "10", ar: "التجهيزات الثابتة", en: "Specialties", rateKey: "specialties", unit: "عدد",
    items: [
      { num: "10 11 10", ar: "لوح كتابة أبيض (Whiteboard) مع إطار", unit: "م²" },
      { num: "10 14 10", ar: "لافتات ومؤشرات توجيهية وإخلاء طوارئ", unit: "بند" },
      { num: "10 21 10", ar: "حواجز مراحيض فينول مضغوط مع إطار ألمنيوم", unit: "عدد" },
      { num: "10 26 10", ar: "مسكة مساعد ADA للحمامات (Grab Bar استانلس)", unit: "عدد" },
      { num: "10 28 10", ar: "مجموعة ملحقات حمامات (مرآة+مناشف+صابون)", unit: "بند" },
      { num: "10 44 10", ar: "خزائن حقائب معدنية مع قفل (Lockers)", unit: "عدد" },
      { num: "10 73 10", ar: "مظلات خارجية ألمنيوم وبولي كربونيت", unit: "م²" },
      { num: "10 75 10", ar: "سواتر خارجية دوارة ألمنيوم (Louvers)", unit: "م²" },
      { num: "10 81 10", ar: "حماية زوايا جدران Corner Guards ألمنيوم", unit: "م.ط" },
    ],
  },
  {
    num: "11", ar: "المعدات المتخصصة", en: "Equipment", rateKey: "equipment", unit: "بند",
    items: [
      { num: "11 12 10", ar: "حاجز سيارات هيدروليكي (بوليرد كهربائي)", unit: "عدد" },
      { num: "11 13 10", ar: "بوابة دوارة أمنية Turnstile للمداخل", unit: "عدد" },
      { num: "11 23 10", ar: "معدات مصلى جامع (مفارش + ساعة + ميكروفون)", unit: "بند" },
      { num: "11 31 10", ar: "معدات مطبخ تجارية كاملة (طباخ+شفاط+ثلاجة)", unit: "بند" },
      { num: "11 41 10", ar: "ثلاجة عرض تجارية ويندوز (مورد ومركب)", unit: "عدد" },
      { num: "11 52 10", ar: "معدات مغسلة تجارية (غسالة+مجففة صناعية)", unit: "بند" },
      { num: "11 53 10", ar: "معدات غرفة تحكم AV (بروجكتور+شاشة+نظام)", unit: "بند" },
      { num: "11 73 10", ar: "مقاعد قاعة / مسرح مثبتة (مع ذراع كتابة)", unit: "عدد" },
    ],
  },
  {
    num: "14", ar: "أنظمة النقل الرأسي", en: "Conveying Equipment", rateKey: "conveying", unit: "عدد",
    items: [
      { num: "14 21 10", ar: "مصعد ركاب 6 أشخاص / 4 محطات (كامل التركيب)", unit: "عدد" },
      { num: "14 21 20", ar: "مصعد ركاب 8 أشخاص / 6 محطات", unit: "عدد" },
      { num: "14 24 10", ar: "مصعد شحن 1000 كجم / 3 محطات", unit: "عدد" },
      { num: "14 31 10", ar: "سلم كهربائي عرض 1م (Escalator)", unit: "عدد" },
    ],
  },
  {
    num: "21", ar: "إطفاء الحريق", en: "Fire Suppression", rateKey: "fire_supp", unit: "م²",
    items: [
      { num: "21 13 10", ar: "رشاشات حريق Sprinkler عادية (مفتوحة)", unit: "م²" },
      { num: "21 13 20", ar: "رشاشات حريق Sprinkler مخفية (مدفونة)", unit: "عدد" },
      { num: "21 12 10", ar: "شبكة مواسير الحريق الرئيسية GI مورد ومركب", unit: "م.ط" },
      { num: "21 11 10", ar: "بكرة حريق مع خزان 600L وخرطوم 30م", unit: "عدد" },
      { num: "21 12 20", ar: "طفايات حريق يدوية ABC 6كجم + CO2 5كجم", unit: "عدد" },
    ],
  },
  {
    num: "22", ar: "السباكة والصرف", en: "Plumbing", rateKey: "plumbing", unit: "م²",
    items: [
      { num: "22 01 10", ar: "تأسيس خزان مياه أرضي خرساني", unit: "م³" },
      { num: "22 11 10", ar: "شبكة تغذية مياه داخلية (PPR)", unit: "م.ط" },
      { num: "22 11 20", ar: "مضخات مياه مع لوحة التحكم", unit: "بند" },
      { num: "22 11 30", ar: "شبكة مياه إطفاء خارجية (مواسير GI مجلفن)", unit: "م.ط" },
      { num: "22 13 10", ar: "شبكة صرف صحي داخلية (PVC)", unit: "م.ط" },
      { num: "22 13 20", ar: "شبكة صرف مياه أمطار داخلية (PVC + مناهل)", unit: "م.ط" },
      { num: "22 33 10", ar: "سخان مياه مركزي 300 لتر", unit: "عدد" },
      { num: "22 41 10", ar: "أطقم صحية (مورد ومركب)", unit: "عدد" },
      { num: "22 42 10", ar: "خلاطات وصنابير (مجموعة كاملة للمبنى)", unit: "عدد" },
      { num: "22 51 10", ar: "نظام سخان شمسي (لوحين + خزان 200L)", unit: "بند" },
      { num: "22 63 10", ar: "خزان مياه علوي FRP 10م³ (مورد ومركب)", unit: "عدد" },
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
  {
    num: "27", ar: "الاتصالات", en: "Communications", rateKey: "comms", unit: "نقطة",
    items: [
      { num: "27 15 10", ar: "نقطة شبكة بيانات Cat6 شاملة Patch Panel", unit: "نقطة" },
      { num: "27 51 10", ar: "نقطة تلفزيون مركزي MATV (مورد ومركب)", unit: "نقطة" },
      { num: "27 41 10", ar: "نظام صوتيات ومكبرات صوت للمبنى (PA System)", unit: "بند" },
      { num: "27 21 10", ar: "نظام هاتف داخلي IP مع مركزية PABX", unit: "بند" },
      { num: "27 52 10", ar: "نظام مؤتمرات ويب Video Conferencing", unit: "بند" },
    ],
  },
  {
    num: "28", ar: "الأمن والمراقبة الإلكترونية", en: "Electronic Safety & Security", rateKey: "security", unit: "عدد",
    items: [
      { num: "28 23 10", ar: "كاميرا مراقبة CCTV IP دقة 4K مع حامل", unit: "عدد" },
      { num: "28 23 20", ar: "مسجل شبكي NVR 16 قناة مع أقراص تخزين", unit: "عدد" },
      { num: "28 13 10", ar: "نقطة تحكم دخول ببطاقة Access Control", unit: "باب" },
      { num: "28 16 10", ar: "نظام إنذار سرقة مغناطيسي مع لوحة تحكم", unit: "نقطة" },
      { num: "28 46 10", ar: "نظام إدارة غرف GRMS (للفنادق والمكاتب)", unit: "نقطة" },
    ],
  },
];

// ===== أسعار الموارد المعتمدة لكل دولة 2025 =====
export const RESOURCE_PRICES = {
  sa: {
    concrete_c20: 255, concrete_c35: 340,
    steel_rebar: 2800, structural_steel: 4200, block_piece: 2.3,
    lab_carpenter: 220, lab_steelfixer: 230, lab_mason: 180,
    lab_finisher: 190, lab_electrician: 210, lab_plumber: 205,
    lab_hvac: 230, lab_site: 160, lab_metal: 240,
    eq_excavator_hr: 185, eq_dump_hr: 65, eq_pump_hr: 200,
    eq_scaffold_day: 80, eq_compactor_day: 120, eq_mixer_day: 95,
    eq_crane_day: 1800, eq_vibrator: 20,
  },
  eg: {
    // مواد (EGP) — سوق مصر 2025 بعد تعويم الجنيه (USD/EGP ~50)
    concrete_c20: 5000, concrete_c35: 6500,
    steel_rebar: 28000, structural_steel: 32000, block_piece: 13,
    // عمالة (EGP/يومية) — أجور محلية منخفضة نسبياً
    lab_carpenter: 600, lab_steelfixer: 650, lab_mason: 500,
    lab_finisher: 500, lab_electrician: 550, lab_plumber: 550,
    lab_hvac: 600, lab_site: 380, lab_metal: 650,
    // معدات (EGP) — مرتفعة نسبياً بسبب الوقود والاستيراد
    eq_excavator_hr: 3500, eq_dump_hr: 900, eq_pump_hr: 4000,
    eq_scaffold_day: 2000, eq_compactor_day: 1500, eq_mixer_day: 1200,
    eq_crane_day: 11000, eq_vibrator: 350,
  },
  ae: {
    // مواد (AED) — قريب من SAR (كلاهما مربوط بالدولار)
    concrete_c20: 265, concrete_c35: 350,
    steel_rebar: 3000, structural_steel: 3600, block_piece: 3.0,
    // عمالة (AED/يومية) — أعلى من SA بسبب تكلفة المعيشة
    lab_carpenter: 280, lab_steelfixer: 290, lab_mason: 230,
    lab_finisher: 240, lab_electrician: 265, lab_plumber: 260,
    lab_hvac: 285, lab_site: 210, lab_metal: 300,
    eq_excavator_hr: 200, eq_dump_hr: 70, eq_pump_hr: 155,
    eq_scaffold_day: 95, eq_compactor_day: 130, eq_mixer_day: 103,
    eq_crane_day: 2200, eq_vibrator: 25,
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
    if (name.includes("هدم") || name.includes("إزالة مخلفات")) {
      return {
        مواد: [],
        عمالة: [
          { name: "فريق هدم يدوي", qty: 0.05, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" },
        ],
        معدات: [
          { name: "حفار (إكسكافيتر) للهدم", qty: 0.008, unit: "ساعة", rate: p.eq_excavator_hr, badge: "eqp", icon: "🚜" },
          { name: "قلابات نقل مخلفات", qty: 0.015, unit: "ساعة", rate: p.eq_dump_hr, badge: "eqp", icon: "🚛" },
        ],
      };
    }
    if (name.includes("تسوية") && !name.includes("تربة")) {
      return {
        مواد: [],
        عمالة: [{ name: "مشرف موقع + فريق رصد", qty: 0.01, unit: "يومية", rate: p.lab_mason, badge: "lab", icon: "👷" }],
        معدات: [
          { name: "جريدر تسوية (Motor Grader)", qty: 0.005, unit: "ساعة", rate: p.eq_excavator_hr, badge: "eqp", icon: "🚜" },
          { name: "هراسة دحل (Compactor)", qty: 0.003, unit: "يوم", rate: p.eq_compactor_day, badge: "eqp", icon: "🚛" },
        ],
      };
    }
    if (name.includes("صرف مياه أمطار") && div.rateKey === "earthwork") {
      return {
        مواد: [
          { name: "مواسير PVC صرف أمطار Ø200-300مم", qty: 1, unit: "م.ط", rate: r(mkt * 0.25), badge: "mat", icon: "🔵" },
          { name: "مناهل خرسانية 60×60 + غطاء حديد", qty: 0.05, unit: "عدد", rate: r(mkt * 2), badge: "mat", icon: "⬛" },
        ],
        عمالة: [{ name: "عمال تمديد وحفر", qty: 0.08, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" }],
        معدات: [{ name: "حفار + آليات تمديد", qty: 0.006, unit: "ساعة", rate: p.eq_excavator_hr, badge: "eqp", icon: "🚜" }],
      };
    }
    if (name.includes("نقل تربة") || name.includes("قلابات")) {
      return {
        مواد: [],
        عمالة: [{ name: "سائق قلاب", qty: 0.02, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" }],
        معدات: [
          { name: "قلاب 10م³", qty: 0.025, unit: "ساعة", rate: p.eq_dump_hr, badge: "eqp", icon: "🚛" },
        ],
      };
    }
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
    if (name.includes("حوائط خرسانية") || name.includes("استنادية")) {
      return {
        مواد: [
          { name: "خرسانة مسلحة C35", qty: 0.2, unit: "م³", rate: p.concrete_c35, badge: "mat", icon: "🧱" },
          { name: "حديد تسليح شبكي", qty: 20, unit: "كجم", rate: r(p.steel_rebar / 1000), badge: "mat", icon: "🔩" },
          { name: "شدة خشبية (قوالب)", qty: 1, unit: "م²", rate: r(mkt * 0.08), badge: "mat", icon: "🪵" },
        ],
        عمالة: [
          { name: "نجار شدة", qty: 0.15, unit: "يومية", rate: p.lab_carpenter, badge: "lab", icon: "👷" },
          { name: "حداد ربط", qty: 0.12, unit: "يومية", rate: p.lab_steelfixer, badge: "lab", icon: "👷" },
        ],
        معدات: [{ name: "مضخة خرسانة + مبرد", qty: 1, unit: "بند", rate: r(mkt * 0.04), badge: "eqp", icon: "⚙️" }],
      };
    }
    if (name.includes("بلاطة مسبقة") || name.includes("precast") || name.includes("Precast")) {
      return {
        مواد: [
          { name: "بلاطة خرسانية مسبقة الصنع", qty: 1, unit: "م²", rate: r(mkt * 0.6), badge: "mat", icon: "🔲" },
          { name: "مواد وصل وربط", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "mat", icon: "🔩" },
        ],
        عمالة: [{ name: "فريق تركيب قطع مسبقة", qty: 0.08, unit: "يومية", rate: p.lab_carpenter, badge: "lab", icon: "👷" }],
        معدات: [{ name: "رافعة (كرين) للتركيب", qty: 0.05, unit: "يوم", rate: p.eq_crane_day, badge: "eqp", icon: "🏗️" }],
      };
    }
    if (name.includes("مشطوفة") || name.includes("polished") || name.includes("Polished")) {
      return {
        مواد: [
          { name: "خرسانة أرضية C25 (سماكة 10سم)", qty: 0.1, unit: "م³", rate: p.concrete_c20, badge: "mat", icon: "🔲" },
          { name: "مواد شدة وتسوية + هاردنر", qty: 1, unit: "بند", rate: r(mkt * 0.08), badge: "mat", icon: "🪣" },
        ],
        عمالة: [{ name: "فني جلاخة وصقل أرضيات", qty: 0.1, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
        معدات: [{ name: "ماكينة جلاخة أرضيات + قرص ماس", qty: 1, unit: "بند", rate: r(mkt * 0.1), badge: "eqp", icon: "⚙️" }],
      };
    }
    if (name.includes("سلم خرساني") || name.includes("درج داخلي")) {
      return {
        مواد: [
          { name: "خرسانة مسلحة C35 للدرج", qty: 0.4, unit: "م³", rate: p.concrete_c35, badge: "mat", icon: "🧱" },
          { name: "حديد تسليح + أسياخ", qty: 35, unit: "كجم", rate: r(p.steel_rebar / 1000), badge: "mat", icon: "🔩" },
          { name: "شدة خشبية خاصة بالدرج", qty: 1, unit: "بند", rate: r(mkt * 0.12), badge: "mat", icon: "🪵" },
        ],
        عمالة: [
          { name: "نجار شدة", qty: 0.3, unit: "يومية", rate: p.lab_carpenter, badge: "lab", icon: "👷" },
          { name: "حداد ربط", qty: 0.2, unit: "يومية", rate: p.lab_steelfixer, badge: "lab", icon: "👷" },
        ],
        معدات: [{ name: "خلاط + هزاز خرسانة", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "eqp", icon: "⚙️" }],
      };
    }
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
    if (name.includes("هنجر") || name.includes("ورشة")) {
      return {
        مواد: [
          { name: "هيكل بري (أنابيب RHS + UC)", qty: 0.015, unit: "طن", rate: p.structural_steel, badge: "mat", icon: "🔩" },
          { name: "شيت ستيل تغطية + عوازل", qty: 1.1, unit: "م²", rate: r(mkt * 0.25), badge: "mat", icon: "🔲" },
          { name: "براغي ومسامير تثبيت", qty: 1, unit: "بند", rate: r(mkt * 0.03), badge: "mat", icon: "🪛" },
        ],
        عمالة: [{ name: "فريق تجميع وتركيب", qty: 0.12, unit: "يومية", rate: p.lab_metal, badge: "lab", icon: "👷" }],
        معدات: [{ name: "رافعة + أدوات لحام", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "eqp", icon: "🏗️" }],
      };
    }
    if (name.includes("سلالم حديدية") || name.includes("سلم حديد")) {
      return {
        مواد: [
          { name: "حديد مجوف RHS للسلم", qty: 0.08, unit: "طن", rate: p.structural_steel, badge: "mat", icon: "🔩" },
          { name: "درجات مشبكة (Grating) أو صفيح", qty: 1, unit: "رقية", rate: r(mkt * 0.3), badge: "mat", icon: "🔲" },
          { name: "دهان تشطيب + مانع صدأ", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "mat", icon: "🎨" },
        ],
        عمالة: [{ name: "حداد+فني لحام", qty: 0.3, unit: "يومية", rate: p.lab_metal, badge: "lab", icon: "👷" }],
        معدات: [{ name: "ماكينة لحام + جلاخة", qty: 1, unit: "بند", rate: r(mkt * 0.06), badge: "eqp", icon: "🔧" }],
      };
    }
    if (name.includes("صاج مموج") || name.includes("deck slab") || name.includes("Deck")) {
      return {
        مواد: [
          { name: "صاج مموج مجلفن G90", qty: 1.05, unit: "م²", rate: r(mkt * 0.5), badge: "mat", icon: "🔲" },
          { name: "براغي تثبيت ذاتية اللولبة", qty: 6, unit: "عدد", rate: r(mkt * 0.01), badge: "mat", icon: "🪛" },
        ],
        عمالة: [{ name: "فني تركيب صاج", qty: 0.06, unit: "يومية", rate: p.lab_metal, badge: "lab", icon: "👷" }],
        معدات: [{ name: "مفك لاسلكي + مقص صاج", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "eqp", icon: "✂️" }],
      };
    }
    if (name.includes("شبك سياج") || (name.includes("شبك") && name.includes("حديد"))) {
      return {
        مواد: [
          { name: "شبك سياج حديد مجلفن 2م", qty: 1.05, unit: "م.ط", rate: r(mkt * 0.35), badge: "mat", icon: "🔲" },
          { name: "أعمدة حديد مجلفن Ø50مم كل 2.5م", qty: 0.4, unit: "عدد", rate: r(mkt * 0.25), badge: "mat", icon: "🔩" },
          { name: "أسلاك ربط وشدادات", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "mat", icon: "🪛" },
        ],
        عمالة: [{ name: "فريق تركيب سياج", qty: 0.08, unit: "يومية", rate: p.lab_metal, badge: "lab", icon: "👷" }],
        معدات: [{ name: "حفر أساسات أعمدة + خرسانة عشوائية", qty: 1, unit: "بند", rate: r(mkt * 0.08), badge: "eqp", icon: "🛠️" }],
      };
    }
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
    if (name.includes("كرتينول") || name.includes("curtain wall") || name.includes("curtain")) {
      return {
        مواد: [
          { name: "نظام كرتينول ألمنيوم (Curtain Wall System)", qty: 1, unit: "م²", rate: r(mkt * 0.6), badge: "mat", icon: "🔲" },
          { name: "زجاج دبل جلاس Low-E", qty: 1, unit: "م²", rate: r(mkt * 0.25), badge: "mat", icon: "🪟" },
        ],
        عمالة: [
          { name: "فني تركيب كرتينول", qty: 0.18, unit: "يومية", rate: p.lab_metal, badge: "lab", icon: "👷" },
        ],
        معدات: [{ name: "سقالات خارجية + أدوات تركيب", qty: 1, unit: "بند", rate: r(mkt * 0.07), badge: "eqp", icon: "🪜" }],
      };
    }
    if (name.includes("زجاج") && !name.includes("كرتينول")) {
      return {
        مواد: [
          { name: "زجاج أمان لامينيت (6+6مم)", qty: 1.05, unit: "م²", rate: r(mkt * 0.7), badge: "mat", icon: "🪟" },
          { name: "سيليكون هيكلي للتثبيت", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "mat", icon: "🧴" },
        ],
        عمالة: [{ name: "فني تركيب زجاج", qty: 0.08, unit: "يومية", rate: p.lab_metal, badge: "lab", icon: "👷" }],
        معدات: [{ name: "ماصات تحريك + أدوات", qty: 1, unit: "بند", rate: r(mkt * 0.03), badge: "eqp", icon: "🛠️" }],
      };
    }
    if (name.includes("أقفال") || name.includes("مقابض")) {
      return {
        مواد: [{ name: "قفل + مقبض + لوازم تركيب", qty: 1, unit: "عدد", rate: r(mkt * 0.8), badge: "mat", icon: "🔑" }],
        عمالة: [{ name: "فني تركيب قفل", qty: 0.02, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
        معدات: [{ name: "أدوات يدوية", qty: 1, unit: "بند", rate: r(mkt * 0.01), badge: "eqp", icon: "🛠️" }],
      };
    }
    if (name.includes("ألمنيوم") && name.includes("باب")) {
      return {
        مواد: [
          { name: "باب ألمنيوم دبل جلاس (مورد من الوكيل)", qty: 1, unit: "عدد", rate: r(mkt * 0.75), badge: "mat", icon: "🚪" },
          { name: "إطار تثبيت + سيليكون + لوازم", qty: 1, unit: "بند", rate: r(mkt * 0.08), badge: "mat", icon: "🔩" },
        ],
        عمالة: [{ name: "فني تركيب أبواب ألمنيوم", qty: 0.12, unit: "يومية", rate: p.lab_metal, badge: "lab", icon: "👷" }],
        معدات: [{ name: "أدوات حفر + مستوى ليزر", qty: 1, unit: "بند", rate: r(mkt * 0.03), badge: "eqp", icon: "🛠️" }],
      };
    }
    if (name.includes("pvc") || (name.includes("شبابيك") && name.includes("pvc"))) {
      return {
        مواد: [
          { name: "شباك PVC دبل جلاس مورد", qty: 1, unit: "م²", rate: r(mkt * 0.7), badge: "mat", icon: "🪟" },
          { name: "مواد تثبيت + سيليكون + لوازم", qty: 1, unit: "بند", rate: r(mkt * 0.07), badge: "mat", icon: "🧴" },
        ],
        عمالة: [{ name: "فني تركيب PVC", qty: 0.1, unit: "يومية", rate: p.lab_metal, badge: "lab", icon: "👷" }],
        معدات: [{ name: "أدوات تركيب", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "eqp", icon: "🛠️" }],
      };
    }
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
    if (name.includes("xps") || (name.includes("صلب") && name.includes("عزل حراري"))) {
      return {
        مواد: [
          { name: "ألواح XPS صلبة 5سم", qty: 1.05, unit: "م²", rate: r(mkt * 0.55), badge: "mat", icon: "🟦" },
          { name: "لاصق خاص + براغي تثبيت", qty: 1, unit: "بند", rate: r(mkt * 0.1), badge: "mat", icon: "🧴" },
        ],
        عمالة: [{ name: "فني عزل حراري", qty: 0.06, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
        معدات: [{ name: "أدوات قطع + تركيب", qty: 1, unit: "بند", rate: r(mkt * 0.03), badge: "eqp", icon: "✂️" }],
      };
    }
    if (name.includes("رغوة") || name.includes("spray") || name.includes("pu")) {
      return {
        مواد: [
          { name: "مادة PU Foam (خامتين A+B)", qty: 0.5, unit: "كجم", rate: r(mkt * 0.7), badge: "mat", icon: "🪣" },
        ],
        عمالة: [{ name: "فني رش فوم PU", qty: 0.04, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
        معدات: [{ name: "ماكينة رش فوم + معدات وقاية", qty: 1, unit: "بند", rate: r(mkt * 0.1), badge: "eqp", icon: "🔧" }],
      };
    }
    if (name.includes("شيت ستيل") || name.includes("roof sheet") || name.includes("صناعية")) {
      return {
        مواد: [
          { name: "شيت ستيل مموج مجلفن للسقف", qty: 1.1, unit: "م²", rate: r(mkt * 0.55), badge: "mat", icon: "🔲" },
          { name: "براغي ذاتية اللولبة", qty: 6, unit: "عدد", rate: r(mkt * 0.01), badge: "mat", icon: "🪛" },
        ],
        عمالة: [{ name: "فني تركيب شيت ستيل", qty: 0.05, unit: "يومية", rate: p.lab_metal, badge: "lab", icon: "👷" }],
        معدات: [{ name: "مفك لاسلكي + رافعة صغيرة", qty: 1, unit: "بند", rate: r(mkt * 0.04), badge: "eqp", icon: "🛠️" }],
      };
    }
    if (name.includes("صوتي") || name.includes("glass wool") || name.includes("ألياف زجاجية")) {
      return {
        مواد: [
          { name: "ألياف زجاجية Glass Wool 50مم كثافة 24", qty: 1.05, unit: "م²", rate: r(mkt * 0.5), badge: "mat", icon: "🟡" },
          { name: "رقائق حماية + لاصق", qty: 1, unit: "بند", rate: r(mkt * 0.1), badge: "mat", icon: "📄" },
        ],
        عمالة: [{ name: "فني عزل صوتي", qty: 0.05, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
        معدات: [{ name: "أدوات قطع + سكاكين", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "eqp", icon: "✂️" }],
      };
    }
    if (name.includes("فواصل تمدد") || name.includes("expansion") || name.includes("sealant")) {
      return {
        مواد: [
          { name: "مادة حشو مرنة (سيليكون/بولي يوريثين)", qty: 0.1, unit: "لتر", rate: r(mkt * 5), badge: "mat", icon: "🧴" },
          { name: "حشو بولي إيثيلين Backer Rod", qty: 1, unit: "م.ط", rate: r(mkt * 0.15), badge: "mat", icon: "📄" },
        ],
        عمالة: [{ name: "فني حشو الفواصل", qty: 0.05, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
        معدات: [{ name: "مسدس سيليكون + أدوات", qty: 1, unit: "بند", rate: r(mkt * 0.03), badge: "eqp", icon: "🔧" }],
      };
    }
    if (name.includes("سيليكون") && name.includes("عزل مائي")) {
      return {
        مواد: [
          { name: "مادة عزل سيليكون سائلة", qty: 0.3, unit: "لتر", rate: r(mkt * 1.2), badge: "mat", icon: "🧴" },
          { name: "بريمر أساس", qty: 1, unit: "بند", rate: r(mkt * 0.08), badge: "mat", icon: "🖌️" },
        ],
        عمالة: [{ name: "فني تطبيق عزل سيليكون", qty: 0.05, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
        معدات: [{ name: "رولة + أدوات تطبيق", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "eqp", icon: "🛠️" }],
      };
    }
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
    // رخام طبيعي
    if (name.includes("رخام")) {
      return {
        مواد: [
          { name: "رخام طبيعي مقطوع (نخب أول)", qty: 1.05, unit: "م²", rate: r(mkt * 0.65), badge: "mat", icon: "🪨" },
          { name: "لاصق رخام + فارات بلاستيكية", qty: 1, unit: "بند", rate: r(mkt * 0.06), badge: "mat", icon: "🧴" },
        ],
        عمالة: [
          { name: "مبلط رخام محترف", qty: 0.15, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" },
          { name: "عامل تنظيف وصقل", qty: 0.08, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" },
        ],
        معدات: [{ name: "ماكينة صقل + قرص ماس", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "eqp", icon: "🔧" }],
      };
    }
    // جرانيت
    if (name.includes("جرانيت")) {
      return {
        مواد: [
          { name: "جرانيت مقطوع (نخب أول)", qty: 1.05, unit: "م²", rate: r(mkt * 0.55), badge: "mat", icon: "🪨" },
          { name: "لاصق جرانيت + فارات", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "mat", icon: "🧴" },
        ],
        عمالة: [
          { name: "مبلط جرانيت", qty: 0.12, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" },
          { name: "عامل مساعد", qty: 0.06, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" },
        ],
        معدات: [{ name: "ماكينة قطع جرانيت + قرص ماس", qty: 1, unit: "بند", rate: r(mkt * 0.04), badge: "eqp", icon: "🔧" }],
      };
    }
    // كلادينج حجر طبيعي
    if (name.includes("حجر طبيعي")) {
      return {
        مواد: [
          { name: "حجر طبيعي مشطوف (سعودي/مستورد)", qty: 1.1, unit: "م²", rate: r(mkt * 0.55), badge: "mat", icon: "🪨" },
          { name: "مونة خاصة + مثبت حجر", qty: 1, unit: "بند", rate: r(mkt * 0.08), badge: "mat", icon: "🧱" },
        ],
        عمالة: [
          { name: "بناء حجر محترف", qty: 0.18, unit: "يومية", rate: p.lab_mason, badge: "lab", icon: "👷" },
          { name: "عامل مساعد", qty: 0.1, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" },
        ],
        معدات: [{ name: "سقالات خارجية + أدوات", qty: 1, unit: "بند", rate: r(mkt * 0.08), badge: "eqp", icon: "🪜" }],
      };
    }
    // أسقف آرمسترونج
    if (name.includes("آرمسترونج")) {
      return {
        مواد: [
          { name: "لوح آرمسترونج 60×60 ألياف معدنية", qty: 1.1, unit: "م²", rate: r(mkt * 0.18), badge: "mat", icon: "🔲" },
          { name: "هيكل T-Grid معدني + لوازم", qty: 1, unit: "بند", rate: r(mkt * 0.1), badge: "mat", icon: "🔩" },
        ],
        عمالة: [
          { name: "فني تركيب أسقف", qty: 0.05, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" },
          { name: "عامل مساعد", qty: 0.04, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" },
        ],
        معدات: [{ name: "سلالم + أدوات تركيب", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "eqp", icon: "🪜" }],
      };
    }
    // أسقف مستعارة جبس بورد
    if (name.includes("مستعارة")) {
      return {
        مواد: [
          { name: "جبس بورد 12.5مم", qty: 1.1, unit: "م²", rate: r(mkt * 0.15), badge: "mat", icon: "🔲" },
          { name: "هيكل معدني (ستاد + تراك + عروق)", qty: 1.1, unit: "م²", rate: r(mkt * 0.2), badge: "mat", icon: "🔩" },
          { name: "براغي + لوازم تثبيت + مواد لحام", qty: 1, unit: "بند", rate: r(mkt * 0.07), badge: "mat", icon: "🪛" },
        ],
        عمالة: [
          { name: "فني جبس بورد سقف", qty: 0.12, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" },
          { name: "عامل مساعد", qty: 0.06, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" },
        ],
        معدات: [{ name: "رافعة + سقالات + مفك لاسلكي", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "eqp", icon: "🪜" }],
      };
    }
    // أرضيات SPC / LVT فينيل
    if (name.includes("فينيل") || name.includes("spc") || name.includes("lvt")) {
      return {
        مواد: [
          { name: "ألواح SPC / LVT فينيل فاخر", qty: 1.07, unit: "م²", rate: r(mkt * 0.3), badge: "mat", icon: "🟫" },
          { name: "طبقة عازلة Underlayment", qty: 1.05, unit: "م²", rate: r(mkt * 0.04), badge: "mat", icon: "📄" },
          { name: "أنهايات وبروفيلات تشطيب", qty: 1, unit: "بند", rate: r(mkt * 0.03), badge: "mat", icon: "🔩" },
        ],
        عمالة: [{ name: "فني تركيب أرضيات فينيل", qty: 0.07, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
        معدات: [{ name: "أدوات قطع وتسوية", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "eqp", icon: "🛠️" }],
      };
    }
    // سجادة موكيت
    if (name.includes("موكيت") || name.includes("سجادة")) {
      return {
        مواد: [
          { name: "سجادة (موكيت) جودة مكتبية", qty: 1.1, unit: "م²", rate: r(mkt * 0.2), badge: "mat", icon: "🟥" },
          { name: "جلد أسفنجي (تبطين)", qty: 1.05, unit: "م²", rate: r(mkt * 0.06), badge: "mat", icon: "📄" },
          { name: "لاصق موكيت", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "mat", icon: "🧴" },
        ],
        عمالة: [{ name: "فني تركيب موكيت", qty: 0.04, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
        معدات: [{ name: "أدوات تمديد وقطع موكيت", qty: 1, unit: "بند", rate: r(mkt * 0.01), badge: "eqp", icon: "✂️" }],
      };
    }
    // إيبوكسي أرضيات صناعي
    if (name.includes("إيبوكسي") && (name.includes("أرضيات") || name.includes("صناعي"))) {
      return {
        مواد: [
          { name: "مادة إيبوكسي (A+B) — 2كجم/م²", qty: 2, unit: "كجم", rate: r(mkt * 0.12), badge: "mat", icon: "🪣" },
          { name: "بريمر أرضيات (إيبوكسي رقيق)", qty: 1, unit: "بند", rate: r(mkt * 0.07), badge: "mat", icon: "🖌️" },
          { name: "لوازم (رولة إيبوكسي + وعاء)", qty: 1, unit: "بند", rate: r(mkt * 0.03), badge: "mat", icon: "🛠️" },
        ],
        عمالة: [{ name: "فني تطبيق إيبوكسي", qty: 0.06, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
        معدات: [{ name: "ماكينة طحن أرضيات (تجهيز)", qty: 1, unit: "بند", rate: r(mkt * 0.03), badge: "eqp", icon: "⚙️" }],
      };
    }
    // جدران جبس بورد (حواجز داخلية)
    if (name.includes("جبس بورد") && name.includes("جدران")) {
      return {
        مواد: [
          { name: "جبس بورد 12.5مم (وجهين)", qty: 2.15, unit: "م²", rate: r(mkt * 0.1), badge: "mat", icon: "🔲" },
          { name: "هيكل ستاد + تراك معدني", qty: 1.1, unit: "م²", rate: r(mkt * 0.16), badge: "mat", icon: "🔩" },
          { name: "مواد لحام + شبك + براغي", qty: 1, unit: "بند", rate: r(mkt * 0.07), badge: "mat", icon: "🪛" },
        ],
        عمالة: [
          { name: "فني جبس بورد جدران", qty: 0.1, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" },
          { name: "عامل مساعد", qty: 0.07, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" },
        ],
        معدات: [{ name: "مفك لاسلكي + أدوات قص", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "eqp", icon: "🛠️" }],
      };
    }
    // بلوك جبسي خفيف
    if (name.includes("بلوك جبسي") || (name.includes("بلوك") && name.includes("خفيف"))) {
      return {
        مواد: [
          { name: "بلوك جبسي 10سم (نخب أول)", qty: 10.5, unit: "حبة", rate: r(mkt * 0.022), badge: "mat", icon: "🧱" },
          { name: "لاصق جبسي سريع التصلد", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "mat", icon: "🧴" },
        ],
        عمالة: [{ name: "بناء بلوك جبسي", qty: 0.08, unit: "يومية", rate: p.lab_mason, badge: "lab", icon: "👷" }],
        معدات: [{ name: "أدوات يدوية + قاطعة", qty: 1, unit: "بند", rate: r(mkt * 0.01), badge: "eqp", icon: "🛠️" }],
      };
    }
    // بورسلان جداري (قبل فحص بلاط/بورسلان العام)
    if (name.includes("جداري") && name.includes("بورسلان")) {
      return {
        مواد: [
          { name: "بورسلان جداري (نخب أول)", qty: 1.1, unit: "م²", rate: r(mkt * 0.28), badge: "mat", icon: "▫️" },
          { name: "غراء كيميائي C2 للجدران", qty: 1, unit: "بند", rate: r(mkt * 0.06), badge: "mat", icon: "🧴" },
          { name: "ترويبة + نهايات ألمنيوم", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "mat", icon: "🔩" },
        ],
        عمالة: [
          { name: "مبلط جداري محترف", qty: 0.12, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" },
          { name: "عامل مساعد", qty: 0.06, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" },
        ],
        معدات: [{ name: "ماكينة قطع + شفاط تربة", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "eqp", icon: "✂️" }],
      };
    }
    // دهان إيبوكسي مواقف/مخازن (قبل فحص دهان العام)
    if (name.includes("دهان") && name.includes("إيبوكسي")) {
      return {
        مواد: [
          { name: "طلاء إيبوكسي (A+B) — كثافة متوسطة", qty: 0.3, unit: "كجم", rate: r(mkt * 0.3), badge: "mat", icon: "🪣" },
          { name: "بريمر مانع للصدأ (للحديد)", qty: 1, unit: "بند", rate: r(mkt * 0.04), badge: "mat", icon: "🖌️" },
        ],
        عمالة: [{ name: "فني دهان إيبوكسي", qty: 0.05, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
        معدات: [{ name: "رولة + فرشاة + أوعية خلط", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "eqp", icon: "🛠️" }],
      };
    }
    // طلاء ناري Intumescent
    if (name.includes("ناري") || name.includes("intumescent") || (name.includes("حريق") && name.includes("طلاء"))) {
      return {
        مواد: [
          { name: "طلاء ناري مائي (Intumescent)", qty: 1.2, unit: "كجم", rate: r(mkt * 0.17), badge: "mat", icon: "🔥" },
          { name: "أساس مانع صدأ (تمهيد)", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "mat", icon: "🖌️" },
        ],
        عمالة: [{ name: "فني طلاء ناري متخصص", qty: 0.06, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
        معدات: [{ name: "رشاش طلاء + سقالات + معدات وقاية", qty: 1, unit: "بند", rate: r(mkt * 0.04), badge: "eqp", icon: "🪜" }],
      };
    }
    // طلاء اكريليك مرن Elastomeric
    if (name.includes("اكريليك مرن") || name.includes("elastomeric") || name.includes("مرن")) {
      return {
        مواد: [
          { name: "طلاء اكريليك مرن للواجهات", qty: 0.5, unit: "كجم", rate: r(mkt * 0.14), badge: "mat", icon: "🎨" },
          { name: "أساس بريمر خارجي", qty: 1, unit: "بند", rate: r(mkt * 0.03), badge: "mat", icon: "🖌️" },
        ],
        عمالة: [{ name: "معلم دهان خارجي", qty: 0.06, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
        معدات: [{ name: "سقالات خارجية + رولة", qty: 1, unit: "بند", rate: r(mkt * 0.03), badge: "eqp", icon: "🪜" }],
      };
    }
    // لياسة خارجية (قبل بلاط/بورسلان)
    if (name.includes("خارجية") && name.includes("لياسة")) {
      return {
        مواد: [
          { name: "رمل ناعم + أسمنت + جير", qty: 0.025, unit: "م³", rate: r(mkt * 1.5), badge: "mat", icon: "⏳" },
          { name: "إضافات كيميائية (مقاومة للماء)", qty: 1, unit: "بند", rate: r(mkt * 0.02), badge: "mat", icon: "🧪" },
        ],
        عمالة: [
          { name: "معلم لياسة خارجية", qty: 0.12, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" },
          { name: "عامل مساعد", qty: 0.05, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" },
        ],
        معدات: [{ name: "سقالات خارجية + أدوات", qty: 1, unit: "بند", rate: r(mkt * 0.025), badge: "eqp", icon: "🪜" }],
      };
    }
    // جبس ديكور داخلي / تسوية
    if (name.includes("جبس ديكور") || name.includes("تسوية")) {
      return {
        مواد: [
          { name: "جبس نهائي (مسحوق)", qty: 1, unit: "بند", rate: r(mkt * 0.04), badge: "mat", icon: "🪣" },
          { name: "طلاء أساس أكريليك (بريمر)", qty: 1, unit: "بند", rate: r(mkt * 0.03), badge: "mat", icon: "🖌️" },
        ],
        عمالة: [{ name: "معلم جبس ديكور", qty: 0.1, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
        معدات: [{ name: "ماكينة خلط + أدوات وجلاخة", qty: 1, unit: "بند", rate: r(mkt * 0.015), badge: "eqp", icon: "⚙️" }],
      };
    }
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

  // 01 GENERAL REQUIREMENTS
  if (div.rateKey === "general") {
    if (name.includes("مكتب") || name.includes("كرفان")) {
      return {
        مواد: [{ name: "كرفان مكتبي مجهز (إيجار / مصنوع)", qty: 1, unit: "بند", rate: r(mkt * 18), badge: "mat", icon: "🏠" }],
        عمالة: [{ name: "عمال توصيل وتجهيز كرفان", qty: 0.5, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" }],
        معدات: [{ name: "شاحنة نقل", qty: 0.1, unit: "ساعة", rate: p.eq_dump_hr, badge: "eqp", icon: "🚛" }],
      };
    }
    if (name.includes("سياج")) {
      return {
        مواد: [
          { name: "ألواح سياج ألمنيوم + قواعد معدنية", qty: 1, unit: "م.ط", rate: r(mkt * 5.5), badge: "mat", icon: "🔲" },
          { name: "دهان وملصقات السلامة والتوجيه", qty: 1, unit: "بند", rate: r(mkt * 0.3), badge: "mat", icon: "🎨" },
        ],
        عمالة: [{ name: "فريق تركيب سياج", qty: 0.05, unit: "يومية", rate: p.lab_mason, badge: "lab", icon: "👷" }],
        معدات: [{ name: "أدوات يدوية وكهربائية", qty: 1, unit: "بند", rate: r(mkt * 0.1), badge: "eqp", icon: "🛠️" }],
      };
    }
    return {
      مواد: [{ name: "مواد عامة (لوحات+لوازم+معدات سلامة+طفايات)", qty: 1, unit: "بند", rate: r(mkt * 0.5), badge: "mat", icon: "📋" }],
      عمالة: [
        { name: "مشرف موقع عام (overhead)", qty: 0.05, unit: "يومية", rate: p.lab_mason, badge: "lab", icon: "👷" },
        { name: "عامل تنظيف وصيانة مؤقتة", qty: 0.05, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" },
      ],
      معدات: [{ name: "آليات نقل داخلي موقع", qty: 0.02, unit: "ساعة", rate: p.eq_dump_hr, badge: "eqp", icon: "🚛" }],
    };
  }

  // 06 WOOD, PLASTICS & COMPOSITES
  if (div.rateKey === "wood") {
    return {
      مواد: [
        { name: "خشب / ألواح MDF / PVC (توريد)", qty: 1.08, unit: "م²", rate: r(mkt * 0.62), badge: "mat", icon: "🪵" },
        { name: "غراء + برغي تثبيت + حافات تشطيب", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "mat", icon: "🔩" },
      ],
      عمالة: [
        { name: "نجار ديكور متخصص", qty: 0.12, unit: "يومية", rate: p.lab_carpenter, badge: "lab", icon: "👷" },
        { name: "عامل مساعد تركيب", qty: 0.08, unit: "يومية", rate: p.lab_site, badge: "lab", icon: "👷" },
      ],
      معدات: [{ name: "ماكينة قص وتشطيب خشب + لوازم", qty: 1, unit: "بند", rate: r(mkt * 0.04), badge: "eqp", icon: "✂️" }],
    };
  }

  // 10 SPECIALTIES
  if (div.rateKey === "specialties") {
    return {
      مواد: [{ name: "المنتج الثابت (توريد كامل من المورد)", qty: 1, unit: unit, rate: r(mkt * 0.78), badge: "mat", icon: "📦" }],
      عمالة: [{ name: "فني تركيب متخصص", qty: 0.2, unit: "يومية", rate: p.lab_finisher, badge: "lab", icon: "👷" }],
      معدات: [{ name: "أدوات تركيب وحفر + مسمار كيماوي", qty: 1, unit: "بند", rate: r(mkt * 0.04), badge: "eqp", icon: "🛠️" }],
    };
  }

  // 11 EQUIPMENT
  if (div.rateKey === "equipment") {
    return {
      مواد: [{ name: "المعدة / الجهاز (توريد وتوصيل من الوكيل المعتمد)", qty: 1, unit: "بند", rate: r(mkt * 0.88), badge: "mat", icon: "🏭" }],
      عمالة: [{ name: "فني توصيل وتشغيل أولي (commissioning)", qty: 0.3, unit: "يومية", rate: p.lab_electrician, badge: "lab", icon: "👷" }],
      معدات: [{ name: "رافعة / ونش للتركيب الميداني", qty: 0.05, unit: "يوم", rate: p.eq_crane_day, badge: "eqp", icon: "🏗️" }],
    };
  }

  // 14 CONVEYING EQUIPMENT
  if (div.rateKey === "conveying") {
    return {
      مواد: [
        { name: "المصعد / السلم الكهربائي (توريد + شحن)", qty: 1, unit: "بند", rate: r(mkt * 0.72), badge: "mat", icon: "🛗" },
        { name: "أعمال مدنية (ردم + خرسانة + تشطيب بئر)", qty: 1, unit: "بند", rate: r(mkt * 0.08), badge: "mat", icon: "🧱" },
      ],
      عمالة: [
        { name: "فريق تركيب المصعد (تقني معتمد من الشركة)", qty: 2, unit: "يومية", rate: p.lab_electrician, badge: "lab", icon: "👷" },
        { name: "فني كهرباء توصيلات لوحة التحكم", qty: 1, unit: "يومية", rate: p.lab_electrician, badge: "lab", icon: "👷" },
      ],
      معدات: [{ name: "معدات رفع وتركيب ميدانية + اختبار", qty: 1, unit: "بند", rate: r(mkt * 0.06), badge: "eqp", icon: "🏗️" }],
    };
  }

  // 21 FIRE SUPPRESSION
  if (div.rateKey === "fire_supp") {
    return {
      مواد: [
        { name: "مواسير GI حريق + وصلات + رشاشات UL/FM", qty: 1, unit: "بند", rate: r(mkt * 0.62), badge: "mat", icon: "🔥" },
        { name: "مضخة حريق + خزان طوارئ + لوحة تحكم", qty: 1, unit: "بند", rate: r(mkt * 0.08), badge: "mat", icon: "💧" },
      ],
      عمالة: [
        { name: "فني تمديد أنابيب حريق معتمد", qty: 0.12, unit: "يومية", rate: p.lab_plumber, badge: "lab", icon: "👷" },
        { name: "فني اختبار ومعايرة نظام الحريق", qty: 0.03, unit: "يومية", rate: p.lab_electrician, badge: "lab", icon: "👷" },
      ],
      معدات: [{ name: "أدوات قص ولحام مواسير + اختبار ضغط هيدروستاتيكي", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "eqp", icon: "🛠️" }],
    };
  }

  // 27 COMMUNICATIONS
  if (div.rateKey === "comms") {
    return {
      مواد: [
        { name: "كابلات Cat6 / Coax + مقابس + Patch Panel", qty: 1, unit: "بند", rate: r(mkt * 0.58), badge: "mat", icon: "📡" },
        { name: "أجهزة شبكة (Switch / Router / Access Point)", qty: 1, unit: "بند", rate: r(mkt * 0.12), badge: "mat", icon: "📶" },
      ],
      عمالة: [
        { name: "فني تمديد كابلات ووصلات", qty: 0.1, unit: "يومية", rate: p.lab_electrician, badge: "lab", icon: "👷" },
        { name: "فني اختبار وقياس شبكة (Fluke Tester)", qty: 0.05, unit: "يومية", rate: p.lab_electrician, badge: "lab", icon: "👷" },
      ],
      معدات: [{ name: "أدوات تمديد + جهاز اختبار معتمد", qty: 1, unit: "بند", rate: r(mkt * 0.05), badge: "eqp", icon: "🧪" }],
    };
  }

  // 28 ELECTRONIC SAFETY & SECURITY
  if (div.rateKey === "security") {
    return {
      مواد: [
        { name: "كاميرات / أجهزة أمن (توريد من الوكيل)", qty: 1, unit: unit, rate: r(mkt * 0.65), badge: "mat", icon: "📷" },
        { name: "كابلات Cat6 / Coax + مقابس + حوامل", qty: 1, unit: "بند", rate: r(mkt * 0.10), badge: "mat", icon: "🔌" },
      ],
      عمالة: [
        { name: "فني تركيب أنظمة أمن ومراقبة", qty: 0.15, unit: "يومية", rate: p.lab_electrician, badge: "lab", icon: "👷" },
        { name: "فني برمجة وضبط الأنظمة", qty: 0.10, unit: "يومية", rate: p.lab_electrician, badge: "lab", icon: "👷" },
      ],
      معدات: [{ name: "أدوات تركيب + لابتوب برمجة", qty: 1, unit: "بند", rate: r(mkt * 0.04), badge: "eqp", icon: "🛠️" }],
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
