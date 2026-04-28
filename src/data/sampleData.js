import importedPricingWorkbook from "./importedPricingWorkbook.json";
import { createImportedPricingItems } from "./pricingImport";

// عوامل السعر حسب الفئة نسبةً إلى السعر السعودي (SAR baseline)
// مواد: مرتبطة بسعر الصرف مع الدولار | عمالة: محلية منخفضة | معدات: مرتفعة بسبب الوقود والاستيراد
const COUNTRY_FACTORS = {
  sa: { material: 1,    labor: 1,    equipment: 1    },
  eg: { material: 13.0, labor: 2.6,  equipment: 18.0 }, // USD/EGP ~50 → مواد 13x، عمالة محلية رخيصة 2.6x
  ae: { material: 1.05, labor: 1.28, equipment: 1.10 }, // AED قريب من SAR مع هامش بسيط
};

// Returns resourcesDatabase with prices adjusted for the given country code
export function getResourcesByCountry(countryCode = "sa") {
  const factors = COUNTRY_FACTORS[countryCode] || COUNTRY_FACTORS.sa;
  return resourcesDatabase.map((r) => {
    const f = r.category === "labor" ? factors.labor
            : r.category === "equipment" ? factors.equipment
            : factors.material;
    return { ...r, marketPrice: Math.round(r.marketPrice * f) };
  });
}

export const sampleSettings = {
  country: "السعودية",
  city: "الرياض",
  currency: "SAR",
  language: "ar",
  theme: "dark",
  overheadPercent: 6,
  profitPercent: 15,
  taxPercent: 15,
  locationFactor: 1.03,
  userName: "أحمد العتيبي",
  userEmail: "walidghazal46@gmail.com",
  appName: "Taseera",
  appVersion: "2",
  settingsPanelSection: "account",
};

export const resourcesDatabase = [
  { id: "mat-steel-16", name: "حديد تسليح 16 مم", category: "material", unit: "طن", marketPrice: 2800, icon: "🔩" },       // SA 2025: ~2600-3000 SAR/طن
  { id: "mat-readymix-c20", name: "خرسانة جاهزة C20/C25", category: "material", unit: "م3", marketPrice: 200, icon: "🏗️" },    // SA 2025: ~185-215 SAR/م³ (عادية/فرشة)
  { id: "mat-readymix", name: "خرسانة جاهزة مقاومة", category: "material", unit: "م3", marketPrice: 275, icon: "🏗️" },     // SA 2025: ~250-290 SAR/م³
  { id: "mat-block", name: "بلوك أسمنتي", category: "material", unit: "م2", marketPrice: 30, icon: "🧱" },               // SA 2025: ~27-33 SAR/م²
  { id: "mat-plaster", name: "مواد لياسة", category: "material", unit: "م2", marketPrice: 10, icon: "🪣" },              // SA 2025: ~8-12 SAR/م²
  { id: "mat-paint", name: "دهان داخلي فاخر", category: "material", unit: "م2", marketPrice: 15, icon: "🎨" },          // SA 2025: ~12-18 SAR/م²
  { id: "mat-cable", name: "كابلات وأسلاك نحاس", category: "material", unit: "نقطة", marketPrice: 30, icon: "⚡" },      // SA 2025: ~25-36 SAR/نقطة
  { id: "mat-lighting", name: "مستلزمات إنارة", category: "material", unit: "نقطة", marketPrice: 20, icon: "💡" },       // SA 2025: ~18-25 SAR/نقطة
  { id: "mat-ppr", name: "مواسير PPR", category: "material", unit: "م ط", marketPrice: 16, icon: "🚿" },                // SA 2025: ~14-20 SAR/م.ط
  { id: "mat-duct", name: "دكت تكييف مجلفن", category: "material", unit: "م2", marketPrice: 38, icon: "❄️" },           // SA 2025: ~34-44 SAR/م²
  { id: "mat-backfill", name: "مواد ردم وبحص", category: "material", unit: "م3", marketPrice: 20, icon: "🪨" },         // SA 2025: ~18-24 SAR/م³
  { id: "mat-structural-metal", name: "قطاعات معدنية إنشائية", category: "material", unit: "طن", marketPrice: 3500, icon: "🏗️" }, // SA 2025: ~3300-3700 SAR/طن
  { id: "mat-waterproof", name: "مواد عزل مائي", category: "material", unit: "م2", marketPrice: 30, icon: "🧴" },       // SA 2025: ~26-35 SAR/م²
  { id: "mat-joinery", name: "مواد أبواب وزجاج", category: "material", unit: "وحدة", marketPrice: 220, icon: "🚪" },   // SA 2025: ~190-260 SAR/وحدة
  { id: "mat-gypsum", name: "ألواح جبس وإكسسوارات", category: "material", unit: "م2", marketPrice: 30, icon: "🪟" },   // SA 2025: ~26-35 SAR/م²
  { id: "mat-tiles", name: "بلاط وتشطيبات أرضيات", category: "material", unit: "م2", marketPrice: 45, icon: "▫️" },    // SA 2025: ~40-55 SAR/م² (قياسي)
  { id: "mat-finish", name: "مواد تشطيبات عامة", category: "material", unit: "م2", marketPrice: 20, icon: "🧱" },      // SA 2025: ~18-24 SAR/م²
  { id: "mat-switchgear", name: "لوحات وإكسسوارات كهربائية", category: "material", unit: "نقطة", marketPrice: 42, icon: "🔌" }, // SA 2025: ~38-48 SAR/نقطة
  { id: "mat-pump-mech", name: "معدات ومضخات ميكانيكية", category: "material", unit: "وحدة", marketPrice: 280, icon: "⚙️" },   // SA 2025: ~250-320 SAR/وحدة
  { id: "mat-mech-accessory", name: "ملحقات ميكانيكية", category: "material", unit: "م ط", marketPrice: 20, icon: "🔧" },      // SA 2025: ~18-24 SAR/م.ط
  { id: "lab-carpenter", name: "نجار مسلح", category: "labor", unit: "يومية", marketPrice: 220, icon: "👷" },
  { id: "lab-steelfixer", name: "حداد مسلح", category: "labor", unit: "يومية", marketPrice: 230, icon: "👷" },
  { id: "lab-blockworker", name: "عامل مباني", category: "labor", unit: "يومية", marketPrice: 180, icon: "👷" },
  { id: "lab-finisher", name: "فني تشطيبات", category: "labor", unit: "يومية", marketPrice: 190, icon: "👷" },
  { id: "lab-electrician", name: "فني كهرباء", category: "labor", unit: "يومية", marketPrice: 210, icon: "👷" },
  { id: "lab-plumber", name: "فني صحي", category: "labor", unit: "يومية", marketPrice: 205, icon: "👷" },
  { id: "lab-hvac", name: "فني تكييف", category: "labor", unit: "يومية", marketPrice: 230, icon: "👷" },
  { id: "lab-site", name: "عمالة موقع", category: "labor", unit: "يومية", marketPrice: 160, icon: "👷" },
  { id: "lab-metal", name: "فني تركيبات معدنية", category: "labor", unit: "يومية", marketPrice: 240, icon: "👷" },
  { id: "lab-installer", name: "فني تركيب", category: "labor", unit: "يومية", marketPrice: 195, icon: "👷" },
  { id: "lab-tiler", name: "فني بلاط", category: "labor", unit: "يومية", marketPrice: 200, icon: "👷" },
  { id: "eq-pump", name: "مضخة خرسانة", category: "equipment", unit: "ساعة", marketPrice: 140, icon: "🚚" },
  { id: "eq-scaffold", name: "سقالات ومعدات خفيفة", category: "equipment", unit: "يوم", marketPrice: 80, icon: "🪜" },
  { id: "eq-mixer", name: "خلاطة ومعدات تنفيذ", category: "equipment", unit: "يوم", marketPrice: 95, icon: "⚙️" },
  { id: "eq-tester", name: "معدات فحص كهربائي", category: "equipment", unit: "يوم", marketPrice: 55, icon: "🧰" },
  { id: "eq-welder", name: "معدات تركيب ميكانيكي", category: "equipment", unit: "يوم", marketPrice: 75, icon: "🧰" },
  { id: "eq-excavator", name: "حفار ومعدات تربة", category: "equipment", unit: "ساعة", marketPrice: 185, icon: "🚜" },
  { id: "eq-compactor", name: "معدات دمك وردم", category: "equipment", unit: "يوم", marketPrice: 120, icon: "🛞" },
  { id: "eq-lifter", name: "معدات رفع وتركيب", category: "equipment", unit: "يوم", marketPrice: 160, icon: "🏗️" },
];

const featuredPricingCatalog = [
  {
    id: "cat-1",
    name: "خرسانة مسلحة للأساسات",
    category: "أعمال إنشائية",
    code: "ST-101",
    unit: "م3",
    icon: "🏗️",
    marketAverage: 640,
    marketStatus: "جيد",
    marketStatusColor: "green",
    indirectDistribution: [
      { name: "إدارة", ratio: 0.42 },
      { name: "نقل", ratio: 0.33 },
      { name: "مخاطر", ratio: 0.25 },
    ],
    recipe: [
      { resourceId: "mat-readymix", consumptionRate: 1 },
      { resourceId: "mat-steel-16", consumptionRate: 0.1 },
      { resourceId: "lab-carpenter", consumptionRate: 0.25 },
      { resourceId: "lab-steelfixer", consumptionRate: 0.2 },
      { resourceId: "eq-pump", consumptionRate: 0.3 },
    ],
  },
  {
    id: "cat-2",
    name: "صب أعمدة خرسانية",
    category: "أعمال إنشائية",
    code: "ST-132",
    unit: "م3",
    icon: "🏢",
    marketAverage: 720,
    marketStatus: "جيد",
    marketStatusColor: "green",
    indirectDistribution: [
      { name: "إدارة", ratio: 0.4 },
      { name: "نقل", ratio: 0.4 },
      { name: "مخاطر", ratio: 0.2 },
    ],
    recipe: [
      { resourceId: "mat-readymix", consumptionRate: 1.05 },
      { resourceId: "mat-steel-16", consumptionRate: 0.12 },
      { resourceId: "lab-carpenter", consumptionRate: 0.22 },
      { resourceId: "lab-steelfixer", consumptionRate: 0.22 },
      { resourceId: "eq-pump", consumptionRate: 0.25 },
    ],
  },
  {
    id: "cat-3",
    name: "مباني بلوك أسمنتي",
    category: "أعمال معمارية",
    code: "AR-210",
    unit: "م2",
    icon: "🧱",
    marketAverage: 108,
    marketStatus: "متوسط",
    marketStatusColor: "yellow",
    indirectDistribution: [
      { name: "إدارة", ratio: 0.45 },
      { name: "نقل", ratio: 0.3 },
      { name: "مخاطر", ratio: 0.25 },
    ],
    recipe: [
      { resourceId: "mat-block", consumptionRate: 1 },
      { resourceId: "lab-blockworker", consumptionRate: 0.12 },
      { resourceId: "eq-scaffold", consumptionRate: 0.05 },
    ],
  },
  {
    id: "cat-4",
    name: "دهانات داخلية فاخرة",
    category: "أعمال معمارية",
    code: "AR-320",
    unit: "م2",
    icon: "🎨",
    marketAverage: 42,
    marketStatus: "جيد",
    marketStatusColor: "green",
    indirectDistribution: [
      { name: "إدارة", ratio: 0.5 },
      { name: "نقل", ratio: 0.2 },
      { name: "مخاطر", ratio: 0.3 },
    ],
    recipe: [
      { resourceId: "mat-paint", consumptionRate: 1 },
      { resourceId: "lab-finisher", consumptionRate: 0.07 },
      { resourceId: "eq-scaffold", consumptionRate: 0.02 },
    ],
  },
  {
    id: "cat-5",
    name: "لياسة داخلية ناعمة",
    category: "أعمال معمارية",
    code: "AR-255",
    unit: "م2",
    icon: "🪣",
    marketAverage: 36,
    marketStatus: "متوسط",
    marketStatusColor: "yellow",
    indirectDistribution: [
      { name: "إدارة", ratio: 0.4 },
      { name: "نقل", ratio: 0.25 },
      { name: "مخاطر", ratio: 0.35 },
    ],
    recipe: [
      { resourceId: "mat-plaster", consumptionRate: 1 },
      { resourceId: "lab-finisher", consumptionRate: 0.08 },
      { resourceId: "eq-scaffold", consumptionRate: 0.03 },
    ],
  },
  {
    id: "cat-6",
    name: "قواعد منفصلة خرسانية",
    category: "أعمال إنشائية",
    code: "ST-118",
    unit: "م3",
    icon: "🏢",
    marketAverage: 410,
    marketStatus: "مرتفع",
    marketStatusColor: "red",
    indirectDistribution: [
      { name: "إدارة", ratio: 0.35 },
      { name: "نقل", ratio: 0.3 },
      { name: "مخاطر", ratio: 0.35 },
    ],
    recipe: [
      { resourceId: "mat-readymix", consumptionRate: 0.9 },
      { resourceId: "mat-steel-16", consumptionRate: 0.06 },
      { resourceId: "lab-carpenter", consumptionRate: 0.18 },
      { resourceId: "lab-steelfixer", consumptionRate: 0.18 },
      { resourceId: "eq-pump", consumptionRate: 0.22 },
    ],
  },
  {
    id: "cat-7",
    name: "تمديد مواسير وأسلاك كهرباء",
    category: "أعمال كهربائية",
    code: "EL-101",
    unit: "نقطة",
    icon: "⚡",
    marketAverage: 96,
    marketStatus: "متوسط",
    marketStatusColor: "yellow",
    indirectDistribution: [
      { name: "إدارة", ratio: 0.45 },
      { name: "نقل", ratio: 0.2 },
      { name: "مخاطر", ratio: 0.35 },
    ],
    recipe: [
      { resourceId: "mat-cable", consumptionRate: 1 },
      { resourceId: "lab-electrician", consumptionRate: 0.08 },
      { resourceId: "eq-tester", consumptionRate: 0.02 },
    ],
  },
  {
    id: "cat-8",
    name: "توريد وتركيب نقطة إنارة",
    category: "أعمال كهربائية",
    code: "EL-118",
    unit: "نقطة",
    icon: "💡",
    marketAverage: 128,
    marketStatus: "جيد",
    marketStatusColor: "green",
    indirectDistribution: [
      { name: "إدارة", ratio: 0.4 },
      { name: "نقل", ratio: 0.25 },
      { name: "مخاطر", ratio: 0.35 },
    ],
    recipe: [
      { resourceId: "mat-lighting", consumptionRate: 1 },
      { resourceId: "mat-cable", consumptionRate: 0.65 },
      { resourceId: "lab-electrician", consumptionRate: 0.1 },
      { resourceId: "eq-tester", consumptionRate: 0.02 },
    ],
  },
  {
    id: "cat-9",
    name: "تمديد مواسير تغذية PPR",
    category: "أعمال ميكانيكية",
    code: "ME-101",
    unit: "م ط",
    icon: "🚿",
    marketAverage: 72,
    marketStatus: "متوسط",
    marketStatusColor: "yellow",
    indirectDistribution: [
      { name: "إدارة", ratio: 0.4 },
      { name: "نقل", ratio: 0.25 },
      { name: "مخاطر", ratio: 0.35 },
    ],
    recipe: [
      { resourceId: "mat-ppr", consumptionRate: 1 },
      { resourceId: "lab-plumber", consumptionRate: 0.07 },
      { resourceId: "eq-welder", consumptionRate: 0.03 },
    ],
  },
  {
    id: "cat-10",
    name: "توريد وتركيب دكت تكييف",
    category: "أعمال ميكانيكية",
    code: "ME-214",
    unit: "م2",
    icon: "❄️",
    marketAverage: 168,
    marketStatus: "جيد",
    marketStatusColor: "green",
    indirectDistribution: [
      { name: "إدارة", ratio: 0.38 },
      { name: "نقل", ratio: 0.27 },
      { name: "مخاطر", ratio: 0.35 },
    ],
    recipe: [
      { resourceId: "mat-duct", consumptionRate: 1 },
      { resourceId: "lab-hvac", consumptionRate: 0.09 },
      { resourceId: "eq-welder", consumptionRate: 0.04 },
    ],
  },
];

const importedPricingCatalog = createImportedPricingItems(
  importedPricingWorkbook.rows,
  resourcesDatabase
);

export const pricingCatalog = [...featuredPricingCatalog, ...importedPricingCatalog];
export const importedPricingSource = importedPricingWorkbook.source;
export const importedPricingRows = importedPricingWorkbook.rows;

const supplierSeeds = [
  { name: "الشركة السعودية للحديد والصلب (حديد)", category: "الحديد والصلب", description: "شركة رائدة في مجال صناعة الحديد والصلب وتوفير حديد التسليح للمشاريع الكبرى.[1]" },
  { name: "شركة الراجحي للصناعة والتجارة", category: "الحديد والصلب", description: "متخصصة في توريد حديد التسليح والمقاطع الفولاذية بمختلف فروعها في المملكة.[2]" },
  { name: "شركة ألوبكو (ALUPCO)", category: "الأعمال المعمارية - الألمنيوم", description: "المورد الأكبر لقطاعات الألمنيوم في الشرق الأوسط وإفريقيا للواجهات والتشطيبات.[3]" },
  { name: "شركة الخزف السعودية", category: "التشطيبات والأدوات الصحية", description: "تصنيع بلاط السيراميك والأدوات الصحية وسخانات المياه والطوب الأحمر.[4]" },
  { name: "مجموعة كابلات الرياض", category: "الأعمال الكهربائية - الكابلات", description: "تنتج كابلات الضغط العالي والمتوسط والمنخفض وتعد من رواد الصناعة.[5]" },
  { name: "شركة الفنار", category: "الأعمال الكهربائية", description: "تقوم بتصنيع الكابلات، اللوحات الكهربائية، القواطع، وأنظمة التحكم.[6]" },
  { name: "شركة الزامل للمكيفات", category: "الأعمال الميكانيكية - HVAC", description: "تقدم حلول التكييف المركزي، مكيفات الدولاب، وتجهيز غرف التبريد.[7]" },
  { name: "شركة كاريير (Carrier)", category: "الأعمال الميكانيكية - HVAC", description: "رائدة عالمياً في حلول التدفئة والتهوية وتكييف الهواء ولها مصانع وفروع بالمملكة." },
  { name: "شركة نيبروبلاست (Neproplast)", category: "السباكة والأنابيب", description: "تصنيع مواسير بلاستيكية للضغط العالي وتمديدات (UPVC، PVC، PPR) لشبكات المياه.[8]" },
  { name: "شركة سابكو (Sappco)", category: "السباكة والأنابيب", description: "إنتاج وتوريد الأنابيب البلاستيكية عالية الأداء بمقاسات مختلفة." },
  { name: "شركة SFFECO Global", category: "أنظمة مكافحة الحريق", description: "توفير أنظمة ومعدات الإطفاء ومضخات الحريق المعتمدة عالمياً.[9]" },
  { name: "شركة الصافي للسلامة", category: "أنظمة مكافحة الحريق", description: "توريد وتركيب أجهزة الإطفاء والإنذار المبكر المعتمدة من الدفاع المدني." },
  { name: "شركة أوتيس (Otis)", category: "الأعمال الميكانيكية - المصاعد", description: "شركة متخصصة في توريد، وتركيب، وصيانة المصاعد والسلالم المتحركة." },
  { name: "شركة شندلر (Schindler)", category: "الأعمال الميكانيكية - المصاعد", description: "تقديم حلول النقل العمودي من مصاعد وسلالم متحركة وتحديث الأنظمة القديمة." },
  { name: "دهانات الجزيرة", category: "التشطيبات - الدهانات", description: "توريد الدهانات المعمارية والداخلية والخارجية ولها شبكة معارض واسعة.[10]" },
  { name: "دهانات جوتن (Jotun)", category: "التشطيبات - الدهانات", description: "توفير دهانات الواجهات والمباني الداخلية والخارجية عبر موزعين معتمدين.[11]" },
  { name: "شركة بي آر سي (BRC)", category: "الحديد والصلب", description: "متخصصة في توريد شبكات الحديد والأسلاك المعدنية للمقاولات.[2]" },
  { name: "شركة بوان للصناعات المعدنية", category: "الحديد والصناعات المعدنية", description: "مورد أساسي لمنتجات الصناعات المعدنية وهياكل البناء." },
  { name: "شركة حديد نور", category: "الحديد والصلب", description: "رواد صناعة الحديد والصلب وتقديم منتجات بتركيب مناسب من القوة والمرونة.[12]" },
  { name: "شركة القصوة للصلب المحدودة", category: "الأعمال الإنشائية - هياكل معدنية", description: "تصميم وتصنيع أوعية الضغط، المبادلات الحرارية، وأعمال الهياكل الفولاذية الثقيلة.[13]" },
  { name: "شركة الصناعات المتخصصة في الزجاج (GSI)", category: "الأعمال المعمارية - الزجاج", description: "مصنع متخصص بخبرة تزيد عن 30 عاماً في قطاع الزجاج المعماري الحديث." },
  { name: "مصنع القصر للزجاج", category: "الأعمال المعمارية - الزجاج", description: "تصنيع جميع منتجات الزجاج المعماري والزجاج المزدوج بدون إطار." },
  { name: "مصنع زجاج الفرسان العربية", category: "الأعمال المعمارية - الزجاج", description: "توريد الزجاج المعماري وزجاج السيكوريت بمعايير عالمية للمشاريع الكبرى." },
  { name: "شركة دار الجرانيت السعودي", category: "التشطيبات - رخام وجرانيت", description: "متخصصون في أعمال الجرانيت والرخام بكفاءة إنتاجية ضخمة." },
  { name: "شركة عنوان الرخام", category: "التشطيبات - رخام وجرانيت", description: "توفير كافة أنواع الرخام الطبيعي لتوريد كبرى مشاريع المملكة." },
  { name: "الشركة الصناعية الوطنية للزجاج", category: "الأعمال المعمارية - الزجاج", description: "شركة وطنية مساهمة تقدم خدمات توريد الزجاج الأساسية للمشاريع.[14]" },
  { name: "شركة زجاج جارديان (Guardian Glass)", category: "الأعمال المعمارية - الزجاج", description: "مصنع ضخم لتصنيع الزجاج المصقول والمطلي لتلبية متطلبات كفاءة الطاقة." },
  { name: "شركة مصنع السعودية للرخام والجرانيت", category: "التشطيبات - رخام وجرانيت", description: "تستخرج وتورد الرخام والجرانيت بأعلى طاقة إنتاجية للمشاريع الإنشائية." },
  { name: "شركة أسترا للتعدين", category: "مواد البناء والتعدين", description: "تابعة لمجموعة أسترا الصناعية وتوفر مواد أولية وتعدينية لقطاع البناء.[15]" },
  { name: "شركة مسابك", category: "الصناعات المعدنية", description: "مجهزة لإنتاج المسبوكات من الحديد الرمادي والصلب حسب متطلبات العملاء.[15]" },
  { name: "شركة كابلات جدة", category: "الأعمال الكهربائية - الكابلات", description: "مورد معتمد لكابلات وموصلات الطاقة لكبرى المشاريع والشبكات.[16]" },
  { name: "شركة كابلات بحرة", category: "الأعمال الكهربائية - الكابلات", description: "توريد كابلات الطاقة وأسلاك التمديدات المقاومة للحريق لقطاعات البنية التحتية." },
  { name: "الشركة المتحدة للكابلات (UCIC)", category: "الأعمال الكهربائية - الكابلات", description: "مورد معتمد للشبكات وموصلات الكهرباء لقطاعات الجهد المتوسط.[16]" },
  { name: "شركة ميدال للكابلات", category: "الأعمال الكهربائية - الكابلات", description: "من الموردين المعتمدين لتوريد الموصلات الكهربائية ومواد الشبكات.[16]" },
  { name: "شركة إنرجيا للكابلات", category: "الأعمال الكهربائية - الكابلات", description: "توفير الكابلات والأسلاك الكهربائية للمشاريع الإنشائية المعتمدة.[16]" },
  { name: "شركة الشرق الأوسط للكابلات المتخصصة (MESC)", category: "الأعمال الكهربائية - الكابلات", description: "مورد متخصص للكابلات الصناعية الدقيقة وكابلات التحكم للقطاعات الحيوية.[16]" },
  { name: "شركة العبدالكريم القابضة (AKH)", category: "توريد الجملة - أعمال كهربائية", description: "من أكبر الموزعين للمواد الكهربائية، الكهروميكانيكية، والأدوات الدقيقة." },
  { name: "شركة البروج", category: "توريد الجملة - سباكة وكهرباء", description: "متخصصة بتوريد مواد التأسيس من السباكة والكهرباء بالجملة وبأسعار تنافسية.[17]" },
  { name: "شركة السقاف", category: "توريد الجملة - أدوات صحية", description: "موزع رائد لتوريد الأدوات الصحية ومواد السباكة بالجملة للمشاريع." },
  { name: "شركة زينكو (Zinco)", category: "التشطيبات - إنارة وأدوات صحية", description: "توفير منتجات الإنارة والأدوات الصحية الفاخرة للتشطيبات المتقدمة." },
  { name: "شركة الأراك للصناعات الخشبية", category: "الأعمال المعمارية - الأخشاب", description: "تصنيع وتوريد الألواح الخشبية (MDF، شيبورد، بلايوود) وتقديم حلول تشطيبات خشبية." },
  { name: "شركة الفوزان لمواد البناء (مدار)", category: "توريد الجملة - مواد بناء", description: "من أكبر مستوردي مواد البناء وتوفر منتجات الأخشاب، الحديد، والألمنيوم." },
  { name: "شركة الراشد لمواد البناء", category: "توريد الجملة - مواد بناء", description: "مورد رائد لمواد البناء المتنوعة تشمل الحديد والأخشاب ومنتجات التشطيب الأساسية." },
  { name: "شركة مواد الإعمار القابضة (CPC)", category: "مواد بناء شاملة", description: "تقدم حلول بناء متكاملة تشمل الخرسانة، الحديد، الزجاج، الكابلات، والرخام." },
  { name: "شركة أسمنت القصيم", category: "المواد الإنشائية - أسمنت", description: "إنتاج وتوريد الأسمنت الخام عالي الجودة لمصانع الخرسانة الجاهزة.[15]" },
  { name: "شركة الطوب الأحمر السعودي", category: "المواد الإنشائية - طوب وبلك", description: "إنتاج البلك الفخاري المعزول بكافة الأحجام والمقاسات لدعم كفاءة الطاقة.[15]" },
  { name: "مصنع بلك الرياض", category: "المواد الإنشائية - منتجات خرسانية", description: "متخصص في مجال التشييد وتوفير الأنواع المختلفة من المنتجات الخرسانية.[15]" },
  { name: "مجموعة فنون", category: "مواد البناء التخصصية", description: "تقوم بإنتاج المطاط والفيبرجلاس بجودة عالية للمشاريع.[15]" },
  { name: "شركة أقفال العربية المحدودة", category: "الأعمال المعمارية - أبواب", description: "تصنيع وتركيب وتوريد أبواب الكراجات والأبواب الأوتوماتيكية والشتر.[15]" },
  { name: "شركة أماجد للصناعة", category: "مواد البناء والتشطيبات", description: "إحدى الشركات المعتمدة ضمن أدلة توريد مواد البناء في المملكة.[15]" },
  { name: "شركة أنابيب المحدودة", category: "السباكة والأنابيب", description: "توريد مواسير الصرف والماء وتوريد مواسير الحديد المجلفن والأسود.[15]" },
  { name: "شركة المصانع الكبرى للتعدين", category: "مواد بناء وتعدين", description: "توفير الخامات التعدينية اللازمة لأعمال التأسيس والبناء." },
  { name: "مصنع الزاهد لشبكات حديد التسليح", category: "الحديد والصلب", description: "متخصص في إنتاج شبكات حديد التسليح وتشكيل القضبان الحديدية." },
  { name: "شركة التوكيلات التجارية الحديثة", category: "توريد تجاري للمقاولات", description: "شركة موردة مدرجة للمواد الأساسية للمقاولين." },
  { name: "شركة بناء الخليج العربي للتجارة والمقاولات", category: "مقاولات وتوريد", description: "توفر دعماً لوجستياً وتنفيذياً لقطاع الإنشاءات." },
  { name: "شركة تطوير المتميزة", category: "الخرسانة والمنتجات الإسمنتية", description: "متخصصة في إنتاج الخرسانة الجاهزة والمنتجات الإسمنتية الأساسية." },
  { name: "شركة مصنع إبداع التعدين", category: "كيماويات مواد البناء", description: "متخصصة في إنتاج كيماويات البناء والمواد الداعمة للخرسانة." },
  { name: "شركة كسارة العادل للصناعة", category: "المواد الإنشائية - ركام", description: "توفير الركام والمواد الأولية الأساسية لتشغيل مصانع الخرسانة." },
  { name: "شركة المشروعات الشرقية", category: "مقاولات وأعمال مباني", description: "شركة متخصصة في أعمال تنفيذ وتوريد مستلزمات المباني." },
  { name: "شركة صالح عبدالعزيز الراشد وأولاده", category: "توريد إنشائي عام", description: "شركة بارزة في تقديم مستلزمات ومواد البناء الأساسية." },
  { name: "مجموعة المهيلب للمنتجات الإسمنتية", category: "الخرسانة والمنتجات الإسمنتية", description: "تدير شبكة مصانع ضخمة للخرسانة الجاهزة والبلك في تبوك ونيوم والدمام.[18]" },
  { name: "شركة عبدالله عابدين", category: "الخرسانة والمنتجات الإسمنتية", description: "توفر الخرسانة الجاهزة وتصمم خلطات مخصصة لمشاريع نيوم الكبرى.[19]" },
  { name: "مصنع أبو ظهير للحديد", category: "الأعمال الإنشائية - هياكل معدنية", description: "متخصص في الهياكل المعدنية والجمالونات ومقره بتبوك.[20]" },
  { name: "مصنع الرحيمي للبلوك", category: "المنتجات الإسمنتية والبلك", description: "مورد إقليمي لمنتجات البلك الأسمنتي لدعم المقاولات في المنطقة الشمالية.[21]" },
  { name: "مصنع رمز الروضة", category: "المنتجات الإسمنتية والبلك", description: "أحد مصانع المنتجات الأسمنتية المعتمدة لشركات المقاولات.[21]" },
  { name: "مصنع النافع للبلوك الإسمنتي", category: "المنتجات الإسمنتية والبلك", description: "توفير الطوب والبلك للمقاولين المحليين والمشاريع الناشئة.[21]" },
  { name: "مصنع فاطمة مبارك العطوي", category: "المنتجات الإسمنتية والبلك", description: "متخصص بتوفير المنتجات الأسمنتية وتغطية الطلب للمشاريع في منطقة تبوك.[21]" },
  { name: "مصنع هندي راشد البلوي", category: "المنتجات الإسمنتية", description: "تزويد مشاريع البناء بالمنتجات الخرسانية والأسمنتية الأساسية.[21]" },
  { name: "مصنع منابر البناء", category: "الخرسانة والمنتجات الإسمنتية", description: "إنتاج البلوك والخرسانة الجاهزة لخدمة المجمعات السكنية.[21]" },
  { name: "شركة تبوك للخرسانة الجاهزة ومواد البناء", category: "الخرسانة الجاهزة", description: "كيان إقليمي يوفر الخرسانة المعتمدة هندسياً للمقاولين.[21]" },
  { name: "مصنع النجايز", category: "الخرسانة والمنتجات الإسمنتية", description: "توريد الخرسانة الجاهزة والبلوك المعتمد للتنفيذ الإنشائي.[21]" },
  { name: "مصنع إنجاز للخرسانة الجاهزة", category: "الخرسانة والمنتجات الإسمنتية", description: "مورد معتمد لمنتجات التأسيس الخرسانية بكافة تصنيفاتها.[21]" },
  { name: "مؤسسة آل بنان", category: "توريد الجملة - مواد بناء وسباكة", description: "مستودع إقليمي لتوريد وتسعير مواد البناء والسباكة والكهرباء.[22]" },
  { name: "مؤسسة الحربي", category: "توريد الجملة - سباكة وكهرباء", description: "محلات ومستودعات لتوفير السباكة والكهرباء وأدوات التأسيس.[22]" },
  { name: "مؤسسة الصفوة", category: "توريد الجملة - سباكة", description: "موزع محلي لمواد السباكة والأدوات الصحية لشركات المقاولات.[23]" },
  { name: "مؤسسة التوفير", category: "توريد الجملة - سباكة", description: "مستودعات لتوريد مواسير التأسيس وملحقات الصرف الصحي.[23]" },
  { name: "مؤسسة دعائم الجزيرة", category: "توريد الجملة - أدوات صحية وسباكة", description: "توفير مستلزمات البنية التحتية الخاصة بالمياه للإنشاءات.[23]" },
  { name: "مؤسسة فايدكو", category: "توريد الجملة - سباكة وكهرباء", description: "توفير المواد التأسيسية للمقاولين المنفذين في المشاريع الإقليمية.[23]" },
  { name: "مؤسسة جملة البناء الراقي", category: "توريد الجملة - مواد بناء", description: "توفير مستلزمات المقاولات وخيارات التوريد الكبرى للمقاولين.[24]" },
  { name: "شركة السلطان", category: "توريد الجملة - مواد بناء", description: "توريد مواد البناء، الكهرباء، والسباكة عالية الجودة لتجهيز المشاريع." },
  { name: "شركة السيف للمقاولات الهندسية", category: "مقاولات عامة وتوريد تنفيذي", description: "من أكبر شركات المقاولات في الشرق الأوسط (تصنيف أول).[25]" },
  { name: "شركة الركائز الثابتة المحدودة", category: "مقاولات وأعمال بنية تحتية", description: "مقاولات للإنشاءات السكنية والتجارية، اللاندسكيب، والبنية التحتية.[26]" },
  { name: "شركة فواصل المتطورة للمنتجات الإسمنتية", category: "المنتجات الإسمنتية والإنشائية", description: "دعم المقاولين بالمواد الإسمنتية الخاصة بالتشييد المتطور.[26]" },
  { name: "شركة أبراج القرى للمقاولات العامة", category: "مقاولات عامة", description: "شركة معتمدة لتنفيذ وتوفير مستلزمات الأعمال الإنشائية في مختلف المناطق." },
  { name: "شركة أنساب للمقاولات العامة", category: "مقاولات عامة (MEP وإنشائي)", description: "إحدى الجهات التنفيذية والتوريدية العاملة في البنية التحتية.[27]" },
  { name: "شركة أنوار موج الخليج", category: "مقاولات وأعمال توريد", description: "تنفيذ المشاريع الإنشائية وتوفير خدمات إدارة المرافق.[27]" },
  { name: "شركة AOAR القابضة", category: "مقاولات عامة وتوريد", description: "تنفيذ المشاريع الشاملة والخدمات الميكانيكية للقطاع التجاري.[27]" },
  { name: "مجموعة APCOM", category: "مقاولات عامة وتوريد", description: "مقاولات متخصصة ومعتمدة لخدمة التشييد والبنية التحتية.[27]" },
  { name: "الشركة العربية للمشاريع", category: "مقاولات وتنفيذ", description: "تتولى إدارة وتنفيذ الأعمال الميكانيكية والكهربائية للمشاريع الضخمة.[27]" },
  { name: "شركة الأفضل (Elafdaal)", category: "الأعمال المعمارية - ألمنيوم وزجاج", description: "تركيب وتوريد الأبواب والنوافذ والواجهات الزجاجية للمشاريع.[28]" },
  { name: "شركة نوافذ", category: "الأعمال المعمارية - كلادينج وزجاج", description: "توريد وتركيب واجهات الكلادينج والاستركشر للمباني التجارية.[29]" },
  { name: "مؤسسة كواسر الرياض", category: "الأعمال المعمارية - زجاج وألمنيوم", description: "مصنع لتصنيع واجهات الألمنيوم والزجاج والقبب السماوية." },
  { name: "شركة دهانات B.B.C", category: "التشطيبات - دهانات", description: "إنتاج وتوريد دهانات الديكور، الأخشاب، والطلاء المعدني." },
  { name: "شركة بيت التطور", category: "الحديد والصلب", description: "توفير الإمدادات لقطاع صناعة الصلب وتوريد الحديد في السعودية." },
  { name: "شركة المنازل الساطعة (Bright Houses)", category: "الهياكل والأعمال المعمارية", description: "متخصصة في الهياكل المعدنية وأعمال الألمنيوم والأخشاب للمشاريع." },
  { name: "شركة CMCI", category: "كيماويات مواد البناء", description: "رائدة في تصنيع وتوريد الكيماويات المتخصصة لأعمال البناء والخرسانة." },
  { name: "شركة أكاسكو (عبدالكريم الراجحي للحديد)", category: "الحديد والصلب", description: "أحد أبرز المصانع لتوفير حديد التسليح والمقاطع الإنشائية.[13]" },
  { name: "مصنع التلال السعودي للصناعات الحديدية", category: "الأعمال الإنشائية - هياكل معدنية", description: "يوفر حلول العزل الصوتي، الهياكل الفولاذية، وأنظمة الوقود.[13]" },
  { name: "مؤسسة عبدالعزيز صالح الراشد", category: "مقاولات وتوريد إنشائي", description: "دعم المشاريع الإنشائية بالكوادر والمواد التأسيسية." },
  { name: "الشركة الأهلية للأدوات الكهربائية", category: "توريد الجملة - أعمال كهربائية", description: "من موزعي الأدوات الكهربائية ولوحات التوزيع المعتمدين.[6]" },
];

const supplierSeedsSecond = [
  { name: "مؤسسة باطيب لمواد البناء و الكهرباء", category: "توريد الجملة - مواد بناء وكهرباء", description: "متخصصة في بيع مواد البناء والسباكة والكهرباء بالجملة في مكة المكرمة. [1]" },
  { name: "مؤسسة وحيد حسن التجارية", category: "توريد الجملة - مواد بناء وكهرباء", description: "توفر مواد البناء والسباكة والكهرباء بالجملة للمقاولين في الدمام. [1]" },
  { name: "النهدي لمواد البناء", category: "توريد الجملة - مواد بناء", description: "محلات توريد كبرى لمواد التأسيس والبناء في منطقة عرعر. [1]" },
  { name: "شركة برو سيرف (Pro Serve)", category: "الأعمال الميكانيكية - تكييف", description: "توفر خدمات تركيب وصيانة المكيفات المركزية والمخفية ومكيفات الدولاب في تبوك. [2]" },
  { name: "شركة أقفال العربية المحدودة", category: "الأعمال المعمارية - أبواب وشتر", description: "نقوم بتصنيع وتركيب وتوريد جميع أنواع أبواب الكراجات والشتر والأبواب الأوتوماتيكية في الرياض. [3]" },
  { name: "هانزا سمارت (Hanza Smart)", category: "توريد الجملة - أدوات صحية", description: "توفر أسعاراً خاصة للمشاريع والمقاولات لتوريد الخلاطات، الشطافات، وأنظمة تسخين وتنقية المياه." },
  { name: "شركة العيداب للمقاولات العامة", category: "مقاولات عامة", description: "شركة معتمدة ومرخصة في أعمال المقاولات العامة والتشييد." },
  { name: "شركة عبدالعالي العجمي", category: "مقاولات عامة", description: "شركة مساهمة مقفلة تنفذ أعمال الإنشاءات والمقاولات المعتمدة." },
  { name: "الاوفاز للوحدات السكنيه", category: "مقاولات وتنفيذ", description: "جهة معتمدة في قطاع تطوير وتشييد المجمعات والوحدات السكنية." },
  { name: "الشركة الاهلية لتقنية المعلومات", category: "أنظمة التيار الخفيف والتقنية", description: "متخصصة في توريد وتنفيذ مشاريع تقنية المعلومات للقطاع الإنشائي." },
  { name: "شركة شعاع الخليج للصناعة", category: "صناعة مواد البناء", description: "مورد صناعي معتمد لدعم المشاريع الإنشائية بالمنتجات الأساسية." },
  { name: "مؤسسة ثروات المستقبل للمقاولات", category: "مقاولات عامة", description: "تقديم خدمات المقاولات والإنشاء لتطوير البنية التحتية." },
  { name: "شركة فال المتحدة للصناعة", category: "صناعات إنشائية", description: "شركة مساهمة تقدم خيارات صناعية متعددة لقطاع التشييد والبناء." },
  { name: "مؤسسه عبدالله سعد الحميدى للمقاولات", category: "مقاولات عامة", description: "منشأة وطنية متخصصة في تنفيذ المشاريع الإنشائية." },
  { name: "مؤسسة الجبل الخامس للتصنيع", category: "الصناعات المعدنية", description: "تعمل في مجال التصنيع وتوريد المواد الصناعية الداعمة للمباني." },
  { name: "شركه عبدالرحمن سعد الراشد واولاده", category: "مقاولات وتوريد عام", description: "مجموعة قابضة عريقة توفر إمدادات إنشائية وخدمات تشييد للمشاريع الكبرى." },
  { name: "مؤسسة صالح مساعد الجهني للمقاولات", category: "مقاولات عامة", description: "تنفيذ أعمال المقاولات العامة وتشييد الأبنية المتنوعة." },
  { name: "مؤسسة التفاعل السريع للمقاولات", category: "مقاولات عامة", description: "توفر الدعم التنفيذي والإنشائي للعديد من المشاريع." },
  { name: "مجموعة مشعل فايز جدعان المهيد للمقاولات", category: "مقاولات وتنفيذ", description: "تنفيذ المشاريع الإنشائية والخدمات التابعة لها." },
  { name: "مؤسسة محمد عبدالله علي السلولي", category: "مقاولات عامة", description: "توفر الكوادر وتنفذ أعمال المقاولات العامة في مناطق المملكة." },
  { name: "مكتب لمسة الذكي للخدمات العامة", category: "خدمات عامة ومقاولات", description: "يقدم خدمات لوجستية وتنسيقية لقطاعات التشييد والأعمال المستمرة." },
  { name: "مؤسسة سعد لافي محمد الحربي", category: "مقاولات عامة", description: "تنفذ مشاريع البنية التحتية والمباني وفق المعايير المعتمدة." },
  { name: "مجموعة سليمان عبدالله السحيباني", category: "توريد ومقاولات", description: "مجموعة محدودة متخصصة في الخدمات المساندة لقطاع البناء والمقاولات." },
  { name: "شركة حمد راشد النعيمى للمقاولات", category: "مقاولات عامة", description: "مقاول معتمد لتنفيذ خدمات البناء والأعمال التأسيسية." },
  { name: "مؤسسة سبب للمقاولات العامة", category: "مقاولات عامة", description: "تقديم حلول متكاملة في التشييد وإدارة المشاريع." },
  { name: "مؤسسة اوتاد الشاملة للمقاولات", category: "مقاولات عامة", description: "تنفيذ وتوريد لكافة متطلبات الأعمال الإنشائية في المواقع." },
  { name: "مؤسسة ناصر غزاي المطيري", category: "مقاولات عامة", description: "مؤسسة تعمل ضمن قطاع التنفيذ للمشاريع المدنية والتجارية." },
  { name: "شركة التفوق العالمي", category: "الأعمال المعمارية - كلادينج وزجاج", description: "تركيب واجهات الكلادينج وزجاج السيكوريت في جميع أنحاء المملكة كالأحساء والخبر والدمام. [4]" },
  { name: "شركة رؤيا الدار للتجارة", category: "الأعمال المعمارية - كلادينج", description: "توريد وتركيب جميع أنواع واجهات الكلادينج بتصاميم متعددة. [5]" },
  { name: "شركة الهدف والإتقان", category: "أنظمة مكافحة الحريق والإنذار", description: "شركة معتمدة من الدفاع المدني تقدم توريد وصيانة أجهزة إنذار الحرائق وطفايات الحريق." },
  { name: "شركة السلطان", category: "توريد الجملة - سباكة وكهرباء", description: "توفر مواد البناء والكهرباء والإنارة، والأدوات الصحية ومراوح الشفط بجودة عالية للتشطيبات." },
  { name: "مؤسسة سلمان محمد جلال العليوي", category: "توريد أدوات كهربائية", description: "موزع رئيسي معتمد للوحات والمفاتيح والأدوات الكهربائية في منطقة الجوف سكاكا. [6]" },
  { name: "شركة منارة سكاكا التجارية", category: "توريد أدوات كهربائية", description: "من الوكلاء المعتمدين لمنتجات الشركات الكبرى لتوريد المنتجات الإنشائية الكهربائية بالجوف. [6]" },
  { name: "مؤسسة محمد غازى الرويشد", category: "توريد أدوات كهربائية", description: "توفير حلول الطاقة والأسلاك ولوحات التوزيع في المحافظات الشمالية. [6]" },
  { name: "مؤسسة محمد مبارك الزارع", category: "توريد أدوات كهربائية", description: "تزويد المقاولين بالإكسسوارات والملحقات الكهربائية لتمديد المباني بالجوف. [6]" },
  { name: "مؤسسة خالد سليمان عمشان الشراري", category: "توريد مواد كهربائية وإنشائية", description: "موزع تجاري معتمد لتوفير المواد الكهربائية الأساسية في مدينة القريات. [6]" },
  { name: "مؤسسة الفيصل غير لمواد البناء", category: "توريد مواد بناء", description: "توفير الإمدادات لقطاع التشييد في القريات بما يشمل التأسيس والتشطيب. [6]" },
  { name: "مؤسسة كواسر الرياض", category: "الأعمال المعمارية - ألمنيوم وزجاج", description: "مصنع لتصنيع واجهات الألمنيوم، الزجاج المعشق، القباب السماوية، والشتر الأمني بالرياض." },
  { name: "شركة ماستر كلين (Master Clean)", category: "أعمال السباكة والصيانة", description: "تقدم حلولاً متكاملة لمشاكل الصرف الصحي وكشف التسربات وشفط البيارات بتبوك. [7]" },
  { name: "مصنع زجاج الفرسان العربية", category: "الأعمال المعمارية - زجاج", description: "تصنيع وتوريد الزجاج المعماري وزجاج السيكوريت بمعايير عالمية من مصنعها بالأحساء." },
  { name: "مجموعة السفياني", category: "أنظمة الإنذار ومكافحة الحريق", description: "متخصصون في الأمن والسلامة، تصدير الشهادات، وتوريد أنظمة الإنذار المبكر بفروع في أنحاء المملكة." },
  { name: "شركة زينكو (Zinco)", category: "التشطيبات - إنارة وأدوات صحية", description: "تقدم تشكيلة فاخرة من الثريات، الإنارة الجدارية الخارجية، البانيوهات الديكورية، وخلاطات المياه." },
  { name: "شركة دار الجرانيت السعودي", category: "التشطيبات - رخام وجرانيت", description: "توفر كتل وبلاط الجرانيت والرخام المستورد بمختلف المقاسات لتعزيز جماليات المشاريع السكنية والتجارية." },
  { name: "شركة الاخشاب العالمية (ITCO)", category: "الأعمال المعمارية - أخشاب", description: "تمتلك مستودعات مركزية ضخمة في الرياض، جدة، والدمام لتوريد أجود الأخشاب للمقاولات." },
  { name: "شركة عالم التطور العربي التجارية", category: "الأعمال المعمارية - أخشاب", description: "إحدى الجهات التجارية المتخصصة في توريد مواد البناء والأخشاب في مدينة الرياض." },
  { name: "شركة تسع درجات للمقاولات", category: "مقاولات ومواد بناء", description: "تعمل في مجال توريد الأخشاب ومواد التأسيس لقطاع البناء في جدة." },
  { name: "شركة أبناء مقبل عبدالرحمن الخلف التجارية (MAK)", category: "الأعمال المعمارية - أخشاب", description: "مستورد وموزع جملة لأجود أنواع الخشب الصلب والأبيض المستورد من أوروبا." },
  { name: "شركة أخشاب العالم", category: "الأعمال المعمارية - أخشاب", description: "تقوم باستيراد الأخشاب وتوزيعها عبر خمسة فروع في المنطقة الشرقية (الدمام والخبر)." },
  { name: "شركة اتحاد القوة للخدمات التجارية", category: "الأعمال المعمارية - أخشاب", description: "مورد موثوق للألواح الخشبية وإكسسوارات البناء للمقاولات ولها مستودعات بالرياض." },
  { name: "شركة الزامل كول كير (Coolcare)", category: "الأعمال الميكانيكية - تكييف (HVAC)", description: "متخصصة في صيانة وتوريد غرف التبريد والتجميد والمكيفات المركزية التابعة لمجموعة الزامل. [8]" },
  { name: "JRC International", category: "توريد عام لمواد البناء", description: "شركة موردة دولية ومحلية مسجلة ضمن الموردين المعتمدين في نيوم ومقرها الرياض." },
  { name: "KMARC Construction", category: "مقاولات وتوريد إنشائي", description: "إحدى جهات المقاولات والتنفيذ المعتمدة للمشاركة في مشاريع البنية التحتية لنيوم." },
  { name: "Pipe Fittings for Trading & Contracting Co", category: "السباكة والأعمال الميكانيكية", description: "توريد قطع الأنابيب والمواسير ومستلزماتها للمشاريع الكبرى وتتخذ من الخبر مقراً لها." },
  { name: "شركة الفهد للتجارة والصناعة والمقاولات", category: "مقاولات وصناعات", description: "من الشركات المصنفة والمعتمدة في مقاولات البنية التحتية والصناعات الإنشائية في القصيم ونيوم." },
  { name: "شركة أبراج القرى للمقاولات العامة", category: "مقاولات عامة", description: "شركة معتمدة من الدرجة الرابعة تقدم خدمات الإنشاءات في عدة مناطق منها الرياض ومكة." },
  { name: "شركة زجاج جارديان (Guardian Glass)", category: "الأعمال المعمارية - زجاج", description: "تنتج الزجاج المصقول والزجاج المغطى المقاوم للشمس بالتعاون مع سابك لتقليل استهلاك الطاقة." },
  { name: "شركة كابلات البحر الأحمر (Red Sea Cables Co)", category: "الأعمال الكهربائية - كابلات", description: "من الموردين المعتمدين لشبكات التوزيع لإنتاج الكابلات وتمديدات الطاقة." },
  { name: "شركة الهيثم (AL-HAITAM)", category: "المواد الكهربائية ومستلزمات التوزيع", description: "تمتلك تأهيلاً واعتماداً لتوريد مواد شبكات التوزيع الكهربائي." },
  { name: "ARABIAN SPAR CO. LTD.", category: "توريد مواد بناء وسقالات", description: "تعمل في الجبيل على تزويد قطاع المقاولات بمتطلبات الدعم الإنشائي ومواد البناء." },
  { name: "Ahmed & Nimra Bathroom Accessories", category: "التشطيبات - أدوات صحية", description: "توفر إكسسوارات وملحقات الحمامات وتشارك كأحد مزودي التشطيبات المعمارية." },
  { name: "Al Abuo Steel Company", category: "الحديد والصلب", description: "شركة موردة وتصنيعية لمنتجات الصلب والحديد المستخدمة في التشييد." },
  { name: "Al Amal Alsharif Plastics", category: "السباكة - أنابيب بلاستيكية", description: "إنتاج الأنابيب البلاستيكية ومستلزماتها لدعم شبكات المياه والصرف." },
  { name: "Al Bareoon Holding (Steigen Elevators)", category: "الأعمال الميكانيكية - مصاعد", description: "توفير حلول النقل العمودي والمصاعد المتطورة للمباني الحديثة." },
  { name: "مصنع الشرق للبوليسترين", category: "التشطيبات والعزل", description: "إنتاج منتجات البوليسترين وتوفير حلول العزل الحراري للمباني." },
  { name: "مصنع التكامل للصناعة", category: "صناعات معدنية وإنشائية", description: "تصنيع المنتجات المعدنية والهياكل الداعمة للمقاولات الإنشائية." },
  { name: "مصنع أهل الخبرة", category: "التشطيبات المعمارية", description: "توفير المنتجات الديكورية والتشطيبات للمشاريع السكنية والتجارية." },
  { name: "شركة الجازع الصناعية", category: "مواد إنشائية", description: "توريد ودعم قطاع الإنشاءات بالمواد الأساسية والصناعية المتقدمة." },
  { name: "شركة صقر الجزيرة", category: "توريد مواد تشطيبات وإنارة", description: "تعمل في توريد منتجات الإنارة والتشطيبات الذكية للواجهات." },
  { name: "أنابيب القبلان (KTP)", category: "السباكة - أنابيب", description: "مصنع رائد لتوفير أنابيب المياه الحرارية عالية الجودة وتقنيات السباكة." },
  { name: "شركة المهاجر البيضاء للرخام والحجر", category: "التشطيبات - رخام وحجر", description: "توريد وتصنيع الحجر الطبيعي والرخام لأعمال الأرضيات والواجهات المعمارية." },
  { name: "شركة السهو المتحدة", category: "التشطيبات ومواد البناء", description: "توفير أحدث التقنيات لمنتجات التشطيبات وتجهيزات المباني الداخلية." },
  { name: "شركة السماح تيهو", category: "مواد التشييد والتأسيس", description: "واحدة من الشركات المشاركة في توريد منتجات التشييد والمقاولات." },
  { name: "مؤسسة حنو للأعمال التجارية", category: "الأعمال الميكانيكية والكهربائية", description: "تعمل على توزيع إمدادات البناء المختلفة وتركيباتها لقطاعات المقاولين." },
  { name: "شركة كهرباء الجنوب التجارية", category: "الأعمال الكهربائية", description: "مورد متخصص في حلول ومنتجات الكهرباء والإضاءة على مستوى المنطقة الجنوبية." },
  { name: "مؤسسة المسكن الرائع للمقاولات", category: "مقاولات عامة", description: "تتولى تنفيذ وتشطيب المشاريع وتوريد مستلزمات البناء في المواقع." },
  { name: "شركة موارد للقوى البشرية", category: "توريد عمالة للمقاولات", description: "تدعم قطاع التشييد والبناء من خلال توفير العمالة الفنية والهندسية المؤهلة." },
  { name: "مجموعة الناصر", category: "الأعمال الكهربائية والإنارة", description: "توفر حلول الإنارة الحديثة، والأدوات الكهربائية والتحكم الذكي للمشاريع." },
  { name: "شركة القديمي التجارية", category: "توريد معدات وتكنولوجيا بناء", description: "تقديم أحدث التقنيات والآلات الداعمة لعمليات الإنشاء والتشييد." },
  { name: "شركة ناسكو للمقاولات (NASCO)", category: "توريد مواد مدنية ومقاولات", description: "تعمل بمدينة تبوك على توفير مواد البناء والمقاولات المدنية وإيجار المعدات. [9]" },
  { name: "شركة البروج السعودية", category: "أنظمة التيار الخفيف", description: "متخصصة بتوريد وتركيب كاميرات المراقبة، وأجهزة الإنذار والتحكم بالدخول (CCTV)." },
  { name: "شركة باينكس (Binex)", category: "مواد بناء وتشطيبات كيميائية", description: "توفر كيماويات البناء، المواد اللاصقة المتخصصة، ومنتجات التشطيبات بمعايير دولية." },
  { name: "شركة البلاط العربية (Arabian Tile Company)", category: "التشطيبات - بلاط وسيراميك", description: "مورد بارز بجدة لتوفير تشكيلة واسعة من البلاط والأرضيات المتخصصة." },
  { name: "شركة منتجات البناء (Building Products Company)", category: "مواد البناء والتأسيس", description: "شركة وطنية توفر منتجات البناء الأساسية والمتنوعة." },
  { name: "شركة الاسمنت المتحدة الصناعية (UCIC)", category: "المواد الإنشائية - أسمنت", description: "توفر الأسمنت ومنتجاته للمصانع والمنشآت وتدير محاجر المواد الخام بجدة." },
  { name: "Toli Floor للسعودية", category: "التشطيبات - أرضيات", description: "تقدم حلول أرضيات تجارية متقدمة وبلاط سيراميك عالي المواصفات." },
  { name: "حلول البناء الأخضر (Green Building Solutions)", category: "مواد إنشائية صديقة للبيئة", description: "توريد المنتجات الإنشائية المطابقة لمواصفات البيئة والاستدامة بجدة." },
  { name: "شركة مشيد (Masheed)", category: "مواد إنشائية - أسمنت", description: "متخصصة بتوفير الإسمنت والمواد الإسمنتية وتوزيعها على المشاريع الكبرى." },
  { name: "شركة أركاز (Arkaz)", category: "كيماويات البناء", description: "تصنيع وتوزيع كيماويات البناء وإضافات الخرسانة عالية الجودة." },
  { name: "شركة باومات (BAUMAT)", category: "مقاولات وتشطيبات نهائية", description: "تقدم حلولاً شاملة لمشاريع التشطيب الداخلي والخارجي، التصميم والبناء في السعودية." },
  { name: "شركة مصدر للتجهيزات الفنية", category: "توريد الجملة - مواد بناء", description: "من أبرز الموزعين لما يزيد عن 80 ألف منتج تشمل الحديد، الأخشاب، العزل والسباكة." },
  { name: "BETOLOC MIDDLE EAST", category: "أنظمة بناء متطورة", description: "تقدم أنظمة بناء مبتكرة حاصلة على براءات اختراع دولية لدعم رؤية السعودية 2030." },
  { name: "شركة البناء ثلاثي الابعاد المحدودة (3D Builders)", category: "مقاولات وأنظمة حديثة", description: "تركز على تقنيات البناء الحديث وتطوير قطاع التشييد بخبرات هندسية." },
  { name: "شركة رابدول للصناعة (Rapidwall)", category: "مواد إنشائية متقدمة", description: "توفر نظام ألواح جدارية متطورة تلغي الحاجة للجدران الداخلية والخارجية التقليدية." },
  { name: "شركة إسباك (ESPAC)", category: "المنتجات الإسمنتية المتقدمة", description: "شركة سعودية إماراتية متخصصة في توفير الخرسانة الخلوية مسبقة الصب (AAC)." },
  { name: "شركة الريان لعزل المباني للصناعة", category: "أنظمة العزل والمواد الإنشائية", description: "تصنع قوالب الخرسانة المعزولة (ICF) لزيادة الكفاءة الحرارية للمباني." },
  { name: "شركة التكنولوجيا المتحدة للإنشاءات (UTC)", category: "مقاولات وتشطيبات", description: "تنفذ مشاريع تشطيبات المباني المتقدمة وتقدم خدمات بناء احترافية." },
  { name: "شركة سعودي برو تيك (Saudi ProTech)", category: "الأعمال الكهروميكانيكية (MEP)", description: "إحدى أبرز شركات مقاولات (MEP) لتنفيذ أعمال السباكة، الحريق، الكهرباء، والتكييف بالرياض وعلى مستوى المملكة." },
  { name: "متجر باكورة التقنيات (Bacuratec)", category: "أنظمة التيار الخفيف والسمارت هوم", description: "توريد وتركيب أجهزة المنازل الذكية، كاميرات المراقبة، والأنظمة الصوتية المتكاملة للشركات والفلل." },
  { name: "شركة سمارتا (Smarta)", category: "أنظمة التيار الخفيف والسمارت هوم", description: "توفر حلول أتمتة البيوت الذكية، أنظمة التحكم بالستائر، وشواحن السيارات الكهربائية لرفع كفاءة الاستهلاك." },
  { name: "شركة بولاركس للإنشاءات (Polarix)", category: "مقاولات وأعمال تيار خفيف", description: "تنفذ أعمال التيار الخفيف، أنظمة الإنذار والصوتيات، وتأسيس شبكات الجهد المتوسط والسنترال." },
];

const egyptSupplierSeeds = [
  { name: "السويدي إليكتريك", category: "الأعمال الكهربائية - كابلات ولوحات", description: "مجموعة صناعية مصرية كبرى لتوريد الكابلات، مهمات الكهرباء، اللوحات، وحلول البنية الكهربائية.", location: "القاهرة" },
  { name: "حديد عز", category: "الحديد والصلب", description: "مورد رئيسي لحديد التسليح ولفائف الصلب للمشروعات الإنشائية والصناعية في مصر.", location: "القاهرة" },
  { name: "بشاي ستيل", category: "الحديد والصلب", description: "شركة مصرية بارزة في تصنيع وتوريد حديد التسليح وقطاعات الصلب للمقاولات.", location: "السادس من أكتوبر" },
  { name: "حديد المصريين", category: "الحديد والصلب", description: "مجموعة موردة لمنتجات حديد التسليح ولفائف الصلب مع تغطية واسعة لقطاع البناء.", location: "بني سويف" },
  { name: "السويس للصلب", category: "الحديد والصلب", description: "شركة متخصصة في إنتاج وتوريد البيليت وحديد التسليح والمنتجات الفولاذية.", location: "السويس" },
  { name: "العتال ستيل", category: "الحديد والصلب", description: "مورد معروف في سوق الحديد المصري لتوريد حديد التسليح والمقاطع المعدنية.", location: "القاهرة" },
  { name: "الجيوشي للصلب", category: "الحديد والصلب", description: "تقوم بتوريد حديد التسليح ومنتجات الصلب للمشروعات السكنية والتجارية.", location: "العاشر من رمضان" },
  { name: "METALCO", category: "الأعمال الإنشائية - هياكل معدنية", description: "متخصصة في الهياكل المعدنية والإنشاءات الفولاذية والخزانات ومهمات المشروعات.", location: "القاهرة" },
  { name: "Elsewedy Steel", category: "الأعمال الإنشائية - هياكل معدنية", description: "توريد تطبيقات الصلب والشدادات والأسلاك الفولاذية وحلول الهياكل المعدنية.", location: "العاشر من رمضان" },
  { name: "Egyptalum", category: "الأعمال المعمارية - ألمنيوم", description: "شركة مصر للألومنيوم وتورد قطاعات ومنتجات الألمنيوم للمشروعات والواجهات.", location: "نجع حمادي" },
  { name: "Alumil Egypt", category: "الأعمال المعمارية - ألمنيوم", description: "توفر أنظمة الألمنيوم للواجهات والأبواب والشبابيك والمشاريع المعمارية.", location: "القاهرة" },
  { name: "سيراميكا كليوباترا", category: "التشطيبات والأدوات الصحية", description: "أحد أكبر موردي السيراميك والبورسلين والأدوات الصحية في السوق المصري.", location: "الجيزة" },
  { name: "ليسيكو مصر", category: "التشطيبات والأدوات الصحية", description: "مورد رئيسي للأدوات الصحية والبلاط ومنتجات الحمامات للمشاريع السكنية والفندقية.", location: "الإسكندرية" },
  { name: "أحمد السلاب", category: "التشطيبات - سيراميك وأدوات صحية", description: "شبكة توزيع كبيرة لمنتجات السيراميك والبورسلين والأدوات الصحية والرخام.", location: "القاهرة" },
  { name: "Duravit Egypt", category: "التشطيبات والأدوات الصحية", description: "توريد منتجات الأدوات الصحية والمغاسل والحلول المخصصة للحمامات الحديثة.", location: "القاهرة" },
  { name: "Ideal Standard Egypt", category: "التشطيبات والأدوات الصحية", description: "شركة متخصصة في الأدوات الصحية والخلاطات وتجهيزات الحمامات للمشروعات.", location: "القاهرة" },
  { name: "Roca Egypt", category: "التشطيبات والأدوات الصحية", description: "توفر أطقم الحمامات والخلاطات ومنتجات التشطيب الصحي للقطاع السكني والتجاري.", location: "القاهرة" },
  { name: "Grohe Egypt", category: "التشطيبات والأدوات الصحية", description: "مورد لحلول الخلاطات وتجهيزات الحمامات والمطابخ ذات المواصفات العالية.", location: "القاهرة" },
  { name: "السويس للأسمنت", category: "المواد الإنشائية - أسمنت", description: "منتج ومورد رئيسي للأسمنت والكلنكر للمشاريع ومصانع الخرسانة الجاهزة.", location: "القاهرة" },
  { name: "Lafarge Egypt", category: "المواد الإنشائية - أسمنت", description: "توفر الأسمنت ومواد البناء الأساسية لمشروعات البنية التحتية والإسكان.", location: "القاهرة" },
  { name: "العربية للأسمنت", category: "المواد الإنشائية - أسمنت", description: "شركة مصرية لتصنيع وتوريد الأسمنت للمقاولين ومحطات الخرسانة.", location: "السويس" },
  { name: "أسمنت مصر بني سويف", category: "المواد الإنشائية - أسمنت", description: "تورد الأسمنت البورتلاندي ومنتجات الأسمنت للمشروعات المختلفة.", location: "بني سويف" },
  { name: "أسمنت أسيوط سيمكس", category: "المواد الإنشائية - أسمنت", description: "مورد أسمنت معروف يخدم مشاريع الصعيد والوجه البحري.", location: "أسيوط" },
  { name: "أسمنت العامرية", category: "المواد الإنشائية - أسمنت", description: "شركة متخصصة في توريد الأسمنت لمشروعات الإنشاءات والخرسانة الجاهزة.", location: "الإسكندرية" },
  { name: "أسمنت سيناء", category: "المواد الإنشائية - أسمنت", description: "توفر الأسمنت للمشروعات السكنية والصناعية ومشاريع التطوير الكبرى.", location: "القاهرة" },
  { name: "CMB Group Egypt", category: "كيماويات مواد البناء", description: "مجموعة مصرية متخصصة في كيماويات البناء ومواد العزل والمواد التكميلية للمشروعات.", location: "القاهرة" },
  { name: "Sika Egypt", category: "كيماويات مواد البناء", description: "توريد إضافات الخرسانة، العزل، اللواصق، ومواد الإصلاح والحماية للمباني.", location: "القاهرة" },
  { name: "Saveto Egypt", category: "كيماويات مواد البناء", description: "مورد معروف للمونة الجاهزة، اللاصق، المعاجين، وحلول العزل والإنهاءات.", location: "العاشر من رمضان" },
  { name: "Insutech Egypt", category: "العزل وكيماويات البناء", description: "حلول العزل المائي والحراري ورغوات البوليسترين ومواد حماية المباني.", location: "القاهرة الجديدة" },
  { name: "GLC Paints", category: "التشطيبات - دهانات", description: "شركة مصرية لتصنيع وتوريد الدهانات المعمارية والديكورية للمشاريع.", location: "القاهرة" },
  { name: "Jotun Egypt", category: "التشطيبات - دهانات", description: "توريد دهانات المباني والواجهات والدهانات الواقية للمشروعات المختلفة.", location: "القاهرة" },
  { name: "MIDO Coatings", category: "التشطيبات - دهانات", description: "توفر الدهانات المعمارية ومواد التشطيب والحماية للأسطح والواجهات.", location: "القاهرة" },
  { name: "CAPCI", category: "التشطيبات - دهانات وكيماويات", description: "مورد لمنتجات الدهانات والكيماويات والمواد التكميلية للتشطيبات.", location: "القاهرة" },
  { name: "Electro Cable Egypt", category: "الأعمال الكهربائية - كابلات", description: "شركة متخصصة في تصنيع وتوريد الكابلات والأسلاك للمشاريع الكهربائية.", location: "العاشر من رمضان" },
  { name: "Schneider Electric Egypt", category: "الأعمال الكهربائية", description: "توفر القواطع ولوحات التوزيع وأنظمة التحكم والحلول الكهربائية الذكية.", location: "القاهرة" },
  { name: "Legrand Egypt", category: "الأعمال الكهربائية", description: "مورد لمفاتيح الكهرباء، أنظمة المسارات، اللوحات، وحلول المباني الذكية.", location: "القاهرة" },
  { name: "ABB Egypt", category: "الأعمال الكهربائية", description: "توريد منتجات الجهد المنخفض والمتوسط وأنظمة التحكم والأتمتة.", location: "القاهرة" },
  { name: "Siemens Egypt", category: "الأعمال الكهربائية", description: "توفر أنظمة الكهرباء والتحكم والطاقة للمشروعات والمرافق الكبرى.", location: "القاهرة" },
  { name: "Miraco Carrier", category: "الأعمال الميكانيكية - HVAC", description: "مورد رئيسي لحلول التكييف المركزي والوحدات التجارية والسكنية في مصر.", location: "القاهرة" },
  { name: "Carrier Egypt", category: "الأعمال الميكانيكية - HVAC", description: "حلول متكاملة للتكييف والتهوية وخدمة مشروعات المكاتب والمجمعات السكنية.", location: "القاهرة" },
  { name: "TROX Egypt", category: "الأعمال الميكانيكية - HVAC", description: "توريد مخارج الهواء والدكت والأنظمة الطرفية والتهوية للمشروعات.", location: "القاهرة" },
  { name: "York Egypt", category: "الأعمال الميكانيكية - HVAC", description: "توفر وحدات التكييف المركزي وأنظمة إدارة الهواء للمباني.", location: "القاهرة" },
  { name: "Egyptian German Porcelain", category: "التشطيبات - سيراميك وبورسلين", description: "توريد البورسلين والأرضيات والحوائط للمشاريع السكنية والتجارية.", location: "العاشر من رمضان" },
  { name: "Prima Ceramics", category: "التشطيبات - سيراميك", description: "شركة مصرية لتوريد السيراميك والبورسلين ومنتجات الأرضيات.", location: "العاشر من رمضان" },
  { name: "Royal Ceramica", category: "التشطيبات - سيراميك", description: "مورد معروف في السوق المصري للسيراميك والبورسلين بتشكيلات متعددة.", location: "العاشر من رمضان" },
  { name: "Kiriazi Ceramics", category: "التشطيبات - سيراميك", description: "توريد بلاط وسيراميك ومنتجات تشطيب للمشروعات السكنية والفندقية.", location: "الجيزة" },
  { name: "El Nasr Trading", category: "توريد عام لمواد البناء", description: "موزع لمجموعة من المواد والمنتجات المعمارية والأرضيات والتجهيزات.", location: "القاهرة" },
  { name: "Acrow Misr", category: "الأعمال الإنشائية - شدات وسقالات", description: "توفر أنظمة الشدات المعدنية والسقالات والحلول المؤقتة للموقع.", location: "القاهرة" },
  { name: "Elsewedy PSP", category: "السباكة والأنابيب", description: "توريد أنظمة المواسير والحلول الصحية والبنية التحتية للمياه.", location: "القاهرة" },
  { name: "H.O.M Egypt", category: "الأعمال الكهروميكانيكية (MEP)", description: "شركة متخصصة في أعمال الميكانيكا والكهرباء والسباكة والتكييف والخدمات الفنية.", location: "القاهرة" },
];

const uaeSupplierSeeds = [
  { name: "Danube Building Materials", category: "توريد الجملة - مواد بناء", description: "أحد أكبر موردي مواد البناء في الإمارات ويغطي الأخشاب، الحديد، الأدوات الصحية، والعدد.", location: "دبي" },
  { name: "RAK Ceramics", category: "التشطيبات والأدوات الصحية", description: "شركة إماراتية عالمية متخصصة في السيراميك والبورسلين والأدوات الصحية.", location: "رأس الخيمة" },
  { name: "EMSTEEL", category: "الحديد والصلب", description: "أكبر منتج للصلب ومواد البناء الثقيلة في الإمارات ويخدم مشاريع كبرى في الدولة.", location: "أبوظبي" },
  { name: "Conares", category: "الحديد والصلب", description: "مورد ومصنع لحديد التسليح واللفائف والأسلاك الفولاذية للمقاولات.", location: "دبي" },
  { name: "Al Ghurair Iron & Steel", category: "الحديد والصلب", description: "شركة متخصصة في الصلب المجلفن والمطلي والمنتجات المعدنية للمباني والصناعة.", location: "أبوظبي" },
  { name: "Juma Al Majid Building Materials", category: "توريد الجملة - مواد بناء", description: "قطاع مواد البناء في مجموعة جمعة الماجد يوفر الأسمنت والحديد والمواد الكهربائية والتشطيبات.", location: "دبي" },
  { name: "Faisal Jassim Trading", category: "الأعمال الميكانيكية والكهربائية", description: "مورد معروف لحلول الـ MEP، يشمل التكييف، المضخات، السخانات، ومنتجات السباكة.", location: "دبي" },
  { name: "Leminar Air Conditioning", category: "الأعمال الميكانيكية - HVAC", description: "شركة إماراتية بارزة في تصنيع وتوريد حلول التكييف والتهوية ومخارج الهواء.", location: "دبي" },
  { name: "Trosten Industries", category: "الأعمال الميكانيكية - HVAC", description: "توريد وحدات مناولة الهواء، الدكت، وأنظمة التهوية للمشاريع التجارية والصناعية.", location: "دبي" },
  { name: "SKM Air Conditioning", category: "الأعمال الميكانيكية - HVAC", description: "شركة متخصصة في الشيلرات ووحدات التكييف التجارية والمركزية.", location: "الشارقة" },
  { name: "Ducab", category: "الأعمال الكهربائية - كابلات", description: "من أكبر موردي ومصنعي الكابلات والأسلاك الكهربائية في الإمارات.", location: "دبي" },
  { name: "National Cables Industry", category: "الأعمال الكهربائية - كابلات", description: "شركة متخصصة في إنتاج وتوريد كابلات الجهد المنخفض والمتوسط.", location: "أبوظبي" },
  { name: "Union Pipes Industry", category: "السباكة والأنابيب", description: "توفر أنابيب البولي إيثيلين وأنظمة الشبكات للمياه والبنية التحتية.", location: "أبوظبي" },
  { name: "Hepworth PME UAE", category: "السباكة والأنابيب", description: "مورد لأنظمة المواسير والوصلات والأنابيب البلاستيكية للمشروعات.", location: "دبي" },
  { name: "Cosmoplast", category: "السباكة والأنابيب", description: "توفر الأنابيب والخزانات والمنتجات البلاستيكية لقطاعات البناء والمياه.", location: "الشارقة" },
  { name: "Interplast", category: "السباكة والأنابيب", description: "شركة إماراتية لتوريد أنظمة الأنابيب والعزل والمواد البلاستيكية للمشاريع.", location: "الشارقة" },
  { name: "National Paints UAE", category: "التشطيبات - دهانات", description: "شركة رائدة في الدهانات المعمارية والوقائية للمباني والمشروعات.", location: "الشارقة" },
  { name: "Jotun UAE", category: "التشطيبات - دهانات", description: "توريد الدهانات المعمارية والصناعية والدهانات الواقية في السوق الإماراتي.", location: "دبي" },
  { name: "Terrex Building Materials", category: "توريد الجملة - مواد بناء", description: "توفر مواد البناء والكهربائيات والإنارة والمنتجات الصحية والخشب ومستلزمات السلامة.", location: "دبي" },
  { name: "Fakhri Electrical & Sanitary Trading", category: "توريد الجملة - سباكة وكهرباء", description: "موزع ومخزن للمواد الكهربائية والصحية ومواد البناء والعدد اليدوية.", location: "عجمان" },
  { name: "Al Egaby Gen. Tr. LLC", category: "الأعمال الميكانيكية - HVAC", description: "مورد لـ HVAC ومواد البناء والدهانات والكهربائيات والسباكة في الإمارات.", location: "الشارقة" },
  { name: "Manali Building Materials", category: "توريد الجملة - مواد بناء", description: "توفر مواد البناء، التثبيت، الكهرباء، الصحي، ومنتجات الحديد والألومنيوم.", location: "دبي" },
  { name: "Junaid Group", category: "السباكة والأدوات الصحية", description: "مورد B2B للسباكة والأدوات الصحية وأنظمة المياه الساخنة ومكونات المشاريع.", location: "دبي" },
  { name: "Frazer Building Material Trading", category: "توريد الجملة - مواد بناء", description: "يوفر منتجات السباكة والكهرباء ومواد البناء والـ HVAC للمشروعات.", location: "عجمان" },
  { name: "Al Zafeer Building Materials", category: "توريد الجملة - مواد بناء", description: "مورد لمواد البناء والعدد والسباكة والكهرباء ومستلزمات التشطيب الداخلي.", location: "دبي" },
  { name: "Safinath Al Salam Building Materials", category: "توريد الجملة - مواد بناء", description: "شركة تجارة مواد بناء تقدم مجموعة واسعة من المنتجات للمقاولين في الإمارات.", location: "دبي" },
  { name: "Emirates Glass", category: "الأعمال المعمارية - الزجاج", description: "شركة متخصصة في الزجاج المعماري عالي الأداء للواجهات والمشروعات الكبرى.", location: "أبوظبي" },
  { name: "Gulf Glass Industries", category: "الأعمال المعمارية - الزجاج", description: "توفر الزجاج المسطح والمعماري والحلول الزجاجية للمباني السكنية والتجارية.", location: "الشارقة" },
  { name: "Decoduct", category: "الأعمال الكهربائية - مسارات وكابلات", description: "مورد لأنظمة القنوات البلاستيكية، المسارات، وإدارة الكابلات.", location: "الشارقة" },
  { name: "Geberit Gulf", category: "التشطيبات والأدوات الصحية", description: "توفير أنظمة الصرف المخفي والحلول الصحية والتجهيزات الخاصة بالمشروعات.", location: "دبي" },
  { name: "GROHE Middle East", category: "التشطيبات والأدوات الصحية", description: "مورد لخلاطات وتجهيزات الحمامات والمطابخ للمشاريع السكنية والفندقية.", location: "دبي" },
  { name: "RAKtherm", category: "السباكة والأنابيب", description: "أنظمة مواسير بلاستيكية متقدمة للمياه الساخنة والباردة ومشاريع الـ MEP.", location: "رأس الخيمة" },
  { name: "UNIMIX", category: "الخرسانة والمنتجات الإسمنتية", description: "مورد خرسانة جاهزة يخدم مشاريع البنية التحتية والعقارات في الإمارات.", location: "دبي" },
  { name: "National Ready Mix", category: "الخرسانة والمنتجات الإسمنتية", description: "شركة متخصصة في الخرسانة الجاهزة وخدمة المشروعات الإنشائية في الإمارات الشمالية.", location: "رأس الخيمة" },
  { name: "Hard Block Factory", category: "المنتجات الإسمنتية والبلك", description: "توريد البلوك ومنتجات الخرسانة المسبقة للمشاريع السكنية والخدمية.", location: "أبوظبي" },
  { name: "Emirates Blocks Factories", category: "المنتجات الإسمنتية والبلك", description: "مورد إقليمي للبلوك والمنتجات الإسمنتية والخرسانية.", location: "العين" },
  { name: "Fujairah Building Industries", category: "المواد الإنشائية - أسمنت وجبس", description: "تقدم مواد بناء أساسية ومنتجات إسمنتية للمقاولين في الإمارات.", location: "الفجيرة" },
  { name: "Union Cement Company", category: "المواد الإنشائية - أسمنت", description: "شركة إماراتية لإنتاج وتوريد الأسمنت لمصانع الخرسانة والمشاريع الكبرى.", location: "رأس الخيمة" },
  { name: "National Cement Co", category: "المواد الإنشائية - أسمنت", description: "توفر الأسمنت ومواد البناء الأساسية لمشاريع البنية التحتية والإنشاء.", location: "دبي" },
  { name: "Oryx Doors & Windows", category: "الأعمال المعمارية - أبواب ونوافذ", description: "مورد لحلول الأبواب والنوافذ والواجهات المعدنية والزجاجية.", location: "أبوظبي" },
  { name: "Alumil Middle East", category: "الأعمال المعمارية - ألمنيوم", description: "توفر أنظمة الألمنيوم للواجهات والأبواب والنوافذ في الإمارات.", location: "دبي" },
  { name: "Alubond U.S.A.", category: "الأعمال المعمارية - كلادينج وألمنيوم", description: "مورد لأنظمة ألواح الألمنيوم المركبة وكسوات الواجهات الخارجية.", location: "أم القيوين" },
  { name: "Emirates Insolaire", category: "الأعمال المعمارية - زجاج وطاقة شمسية", description: "حلول واجهات زجاجية مدمج بها خلايا شمسية للمشاريع المتقدمة.", location: "دبي" },
  { name: "Technomec Building Industries", category: "مواد بناء وتجهيزات صناعية", description: "توريد مواد بناء، أدوات، ومستلزمات صناعية وموقعية للمقاولين.", location: "دبي" },
  { name: "Harmony Building & Sanitary Materials", category: "توريد الجملة - مواد بناء وصحي", description: "مورد محلي في الشارقة لمنتجات البناء والمواد الصحية.", location: "الشارقة" },
  { name: "Al Sabouh Building Materials", category: "توريد الجملة - مواد بناء", description: "شركة تجارة مواد بناء تقدم مستلزمات المشاريع والمقاولات في الشارقة.", location: "الشارقة" },
  { name: "Four Star Ceramic & Sanitary", category: "التشطيبات والأدوات الصحية", description: "موزع للسيراميك والبورسلين والأدوات الصحية في السوق الإماراتي.", location: "الشارقة" },
  { name: "CB Electrical & Sanitary Materials", category: "توريد الجملة - سباكة وكهرباء", description: "مورد لمستلزمات الكهرباء والسباكة والمواد الصحية للمشاريع الصغيرة والمتوسطة.", location: "عجمان" },
  { name: "Al Rayhan Electrical Devices Sanitary & Paints", category: "توريد الجملة - سباكة وكهرباء ودهانات", description: "مورد محلي لمنتجات الكهرباء والصحي والدهانات في الشارقة.", location: "الشارقة" },
  { name: "Fine Tools Trading", category: "توريد الجملة - عدد ومواد بناء", description: "يوفر العدد والأدوات وملحقات السباكة والكهرباء ومنتجات المعادن.", location: "دبي" },
];

const supplierCitiesByCountry = {
  السعودية: ["الرياض", "جدة", "الدمام", "الخبر", "الجبيل", "تبوك"],
  مصر: ["القاهرة", "الجيزة", "الإسكندرية", "العاشر من رمضان", "السادس من أكتوبر", "العلمين"],
  الإمارات: ["دبي", "أبوظبي", "الشارقة", "عجمان", "رأس الخيمة", "العين"],
};

function sanitizeSupplierText(value) {
  return value.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
}

function normalizeSupplierName(value) {
  return sanitizeSupplierText(value)
    .toLowerCase()
    .replace(/[()\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferSupplierGroup(category) {
  if (category.includes("كهرب")) return "كهرباء";
  if (category.includes("ميكاني")) return "ميكانيكا";
  if (category.includes("سباكة") || category.includes("أنابيب")) return "سباكة وأنابيب";
  if (category.includes("تشطيبات") || category.includes("رخام") || category.includes("دهانات")) return "تشطيبات";
  if (category.includes("معمارية") || category.includes("زجاج") || category.includes("ألمنيوم") || category.includes("أبواب") || category.includes("أخشاب")) return "معماري";
  if (category.includes("حديد") || category.includes("صلب") || category.includes("معدنية") || category.includes("هياكل")) return "حديد ومعادن";
  if (category.includes("خرسانة") || category.includes("أسمنت") || category.includes("بلك") || category.includes("ركام") || category.includes("إسمنتية")) return "مواد إنشائية";
  if (category.includes("توريد")) return "توريد عام";
  if (category.includes("مقاولات")) return "مقاولات وتوريد";
  return "مواد بناء";
}

function inferSupplierMaterials(category, name) {
  const derived = [];
  const dictionary = [
    "حديد", "صلب", "ألمنيوم", "زجاج", "رخام", "جرانيت", "دهانات", "كابلات", "كهرباء",
    "HVAC", "تكييف", "سباكة", "أنابيب", "خرسانة", "أسمنت", "بلك", "أدوات صحية", "أخشاب",
    "كيماويات", "ركام", "مكافحة الحريق", "مصاعد"
  ];

  dictionary.forEach((term) => {
    if (category.includes(term) || name.includes(term)) {
      derived.push(term);
    }
  });

  if (!derived.length) {
    const baseTerm = category.split("-").pop()?.trim() || category;
    derived.push(baseTerm);
  }

  return [...new Set(derived)].slice(0, 3);
}

const saudiSupplierSeeds = [...supplierSeeds, ...supplierSeedsSecond]
  .filter(
    (supplier, index, array) =>
      index ===
      array.findIndex((item) => normalizeSupplierName(item.name) === normalizeSupplierName(supplier.name))
  )
  .map((supplier) => ({ ...supplier, country: "السعودية" }));

const curatedSupplierSeeds = [
  ...saudiSupplierSeeds,
  ...egyptSupplierSeeds.map((supplier) => ({ ...supplier, country: "مصر" })),
  ...uaeSupplierSeeds.map((supplier) => ({ ...supplier, country: "الإمارات" })),
].filter(
  (supplier, index, array) =>
    index ===
    array.findIndex(
      (item) =>
        `${normalizeSupplierName(item.name)}|${item.country}` ===
        `${normalizeSupplierName(supplier.name)}|${supplier.country}`
    )
);

export const sampleSuppliers = curatedSupplierSeeds.map((supplier, index) => {
  const safeName = sanitizeSupplierText(supplier.name);
  const slug = `supplier${index + 1}`;
  const country = supplier.country;
  const cityOptions = supplierCitiesByCountry[country];
  const city = sanitizeSupplierText(supplier.location || "") || cityOptions[index % cityOptions.length];
  const group = inferSupplierGroup(supplier.category);
  const materials = inferSupplierMaterials(supplier.category, safeName);

  return {
    id: `sup-${index + 1}`,
    name: safeName,
    category: sanitizeSupplierText(supplier.category),
    group,
    country,
    description: sanitizeSupplierText(supplier.description),
    location: city,
    phone: `+9665${String(10000000 + index * 137).slice(0, 8)}`,
    email: `${slug}@taseera-suppliers.sa`,
    website: `https://www.${slug}.sa`,
    contactPerson: `مسؤول مبيعات ${city}`,
    rating: Number((4 + ((index % 9) * 0.1)).toFixed(1)),
    materials,
    logo: safeName[0],
  };
});

const saCompanySeeds = [
  { id: 1, name: "مجموعة بن لادن السعودية", headquarters: ["جدة", "الرياض"], specialization: "مقاولات عامة شاملة", keyProjects: ["توسعة الحرمين", "مطار الملك عبد العزيز"] },
  { id: 2, name: "شركة نسما وشركاهم", headquarters: ["الخبر", "الرياض"], specialization: "EPC، طاقة، بنية تحتية", keyProjects: ["نيوم", "مترو الرياض", "البحر الأحمر"] },
  { id: 3, name: "شركة السيف للمقاولات", headquarters: ["الرياض"], specialization: "أبراج، بنية تحتية معقدة", keyProjects: ["برج المملكة", "بوابة الدرعية", "القدية"] },
  { id: 4, name: "شركة البواني", headquarters: ["الرياض"], specialization: "مباني وتعليم وصحة", keyProjects: ["KAFD", "مطارات"] },
  { id: 5, name: "المباني مقاولون عامون", headquarters: ["جدة"], specialization: "مطارات وعسكري", keyProjects: ["مترو الرياض", "البحر الأحمر"] },
  { id: 6, name: "RTCC", headquarters: ["الخبر", "الرياض"], specialization: "مياه وسكك", keyProjects: ["مياه مكة", "مترو"] },
  { id: 7, name: "الكفاح", headquarters: ["الأحساء", "الخبر"], specialization: "خرسانة وسكني", keyProjects: ["الحرمين", "أرامكو"] },
  { id: 8, name: "العيوني", headquarters: ["الرياض"], specialization: "طرق وجسور", keyProjects: ["وزارة النقل"] },
  { id: 9, name: "الفوزان", headquarters: ["الخبر", "الرياض"], specialization: "تعليم وصحة", keyProjects: ["جامعات", "مستشفيات"] },
  { id: 10, name: "شهم", headquarters: ["جدة"], specialization: "إسكان", keyProjects: ["ضواحي"] },
  { id: 11, name: "العراب", headquarters: ["الرياض"], specialization: "بنية وطاقة", keyProjects: ["سكة الحرمين"] },
  { id: 12, name: "الخضري", headquarters: ["الدمام"], specialization: "طرق", keyProjects: ["تعليم"] },
  { id: 13, name: "IHCC", headquarters: ["جدة"], specialization: "مستشفيات", keyProjects: ["فنادق", "مراكز طبية"] },
  { id: 14, name: "التميمي", headquarters: ["الخبر"], specialization: "خدمات صناعية", keyProjects: ["أرامكو", "نيوم"] },
  { id: 15, name: "SAJCO", headquarters: ["الرياض"], specialization: "طرق", keyProjects: ["سيول"] },
  { id: 16, name: "مفرح الحربي", headquarters: ["الرياض"], specialization: "بنية تحتية", keyProjects: ["نيوم"] },
  { id: 17, name: "الفنار", headquarters: ["الرياض"], specialization: "كهرباء", keyProjects: ["محطات"] },
  { id: 18, name: "سبك", headquarters: ["الرياض"], specialization: "مقاولات", keyProjects: ["حكومي"] },
  { id: 19, name: "CCE", headquarters: ["الرياض"], specialization: "EPC صناعي", keyProjects: ["أرامكو"] },
  { id: 20, name: "سامسونج C&T", headquarters: ["الرياض"], specialization: "أبراج", keyProjects: ["ذا لاين"] },
  { id: 21, name: "داتش فاونديشن", headquarters: ["الرياض"], specialization: "أساسات", keyProjects: ["أبراج"] },
  { id: 22, name: "هايف", headquarters: ["الرياض", "أبها"], specialization: "طرق", keyProjects: ["جنوب"] },
  { id: 23, name: "الصادق", headquarters: ["الدمام"], specialization: "MEP", keyProjects: ["الجبيل"] },
  { id: 24, name: "الرشيدي", headquarters: ["الرياض"], specialization: "سكك", keyProjects: ["الشمال"] },
  { id: 25, name: "جازع", headquarters: ["الرياض"], specialization: "مياه", keyProjects: ["صرف"] },
  { id: 26, name: "دريك آند سكل", headquarters: ["الرياض"], specialization: "MEP", keyProjects: ["مستشفيات"] },
  { id: 27, name: "سواعد", headquarters: ["الرياض"], specialization: "بناء", keyProjects: ["سكني"] },
  { id: 28, name: "الصخرة العربية", headquarters: ["الرياض"], specialization: "مقاولات", keyProjects: ["إداري"] },
  { id: 29, name: "آفاق الزمرد", headquarters: ["الخبر"], specialization: "تصميم", keyProjects: ["فلل"] },
  { id: 30, name: "يوسف مرون", headquarters: ["الرياض"], specialization: "مقاولات", keyProjects: ["ترميم"] },
  { id: 31, name: "الهدا", headquarters: ["الرياض"], specialization: "مدني", keyProjects: ["حكومي"] },
  { id: 32, name: "أمان الإعمار", headquarters: ["الخبر"], specialization: "تطوير", keyProjects: ["سكني"] },
  { id: 33, name: "أركاد", headquarters: ["الخبر"], specialization: "غاز", keyProjects: ["خطوط"] },
  { id: 34, name: "أبونيان", headquarters: ["الدرعية"], specialization: "مياه", keyProjects: ["تحلية"] },
  { id: 35, name: "الشروق", headquarters: ["الدمام"], specialization: "لاندسكيب", keyProjects: ["حدائق"] },
  { id: 36, name: "آفاق المستقبل", headquarters: ["الرياض"], specialization: "تطوير", keyProjects: ["سكني"] },
  { id: 37, name: "الغربية الذهبية", headquarters: ["جدة"], specialization: "خرسانة", keyProjects: ["توريد"] },
  { id: 38, name: "BEC", headquarters: ["الرياض"], specialization: "MEP", keyProjects: ["نيوم"] },
  { id: 39, name: "تمكين البناء", headquarters: ["الرياض"], specialization: "بناء سريع", keyProjects: ["تقنيات"] },
  { id: 40, name: "هوتا هيجر فيلد", headquarters: ["جدة"], specialization: "بحري", keyProjects: ["موانئ"] },
  { id: 41, name: "بورتلاند", headquarters: ["الرياض"], specialization: "خرسانة", keyProjects: ["مواد"] },
  { id: 42, name: "الفهد", headquarters: ["الرياض"], specialization: "طرق", keyProjects: ["صيانة"] },
  { id: 43, name: "أزميل", headquarters: ["الجبيل", "الخبر"], specialization: "سكني", keyProjects: ["الجبيل"] },
  { id: 44, name: "البحر الأحمر الدولية", headquarters: ["الجبيل"], specialization: "Modular", keyProjects: ["نيوم"] },
  { id: 45, name: "بن زفرة", headquarters: ["الرياض"], specialization: "طرق", keyProjects: ["NovoCrete"] },
  { id: 46, name: "فريسينيه", headquarters: ["جدة", "الرياض"], specialization: "جسور", keyProjects: ["شد لاحق"] },
  { id: 47, name: "عبد العالي العجمي", headquarters: ["الرياض"], specialization: "طرق", keyProjects: ["سريعة"] },
  { id: 48, name: "ماركو", headquarters: ["الرياض"], specialization: "MEP", keyProjects: ["مطارات"] },
  { id: 49, name: "ControlTap", headquarters: ["الرياض"], specialization: "أنظمة ذكية", keyProjects: ["مترو"] },
  { id: 50, name: "Abniya", headquarters: ["الرياض"], specialization: "مقاولات", keyProjects: ["سكني"] },
  { id: 51, name: "الرصف والبناء", headquarters: ["الرياض"], specialization: "طرق", keyProjects: ["بلديات"] },
  { id: 52, name: "ساس", headquarters: ["الرياض"], specialization: "معماري", keyProjects: ["أبراج"] },
  { id: 53, name: "المدينة الإنشائية", headquarters: ["مكة", "جدة"], specialization: "إنشائي", keyProjects: ["تاريخي"] },
  { id: 54, name: "حسن المزعل", headquarters: ["الشرقية"], specialization: "استشارات", keyProjects: ["صناعي"] },
  { id: 55, name: "المثلثات الحديثة", headquarters: ["الرياض"], specialization: "استشارات", keyProjects: ["تصميم"] },
  { id: 56, name: "الروشن", headquarters: ["الرياض"], specialization: "مقاولات", keyProjects: ["روشن"] },
  { id: 57, name: "كلكتاوي", headquarters: ["جدة"], specialization: "هندسة", keyProjects: ["سكني"] },
  { id: 58, name: "الابتكار العربي", headquarters: ["الرياض"], specialization: "تقني", keyProjects: ["مباني"] },
  { id: 59, name: "عبد الرحيم الحربي", headquarters: ["الرياض"], specialization: "استشارات", keyProjects: ["إشراف"] },
  { id: 60, name: "SAPAC", headquarters: ["الرياض"], specialization: "طرق", keyProjects: ["ربط مدن"] },
  { id: 61, name: "C&P", headquarters: ["الرياض"], specialization: "مستدام", keyProjects: ["أبراج"] },
  { id: 62, name: "أم القرى", headquarters: ["جدة", "مكة"], specialization: "تطوير", keyProjects: ["طريق الملك"] },
  { id: 63, name: "مكة للإنشاء", headquarters: ["مكة"], specialization: "تطوير", keyProjects: ["الحرم"] },
  { id: 64, name: "روابي", headquarters: ["الخبر"], specialization: "طاقة", keyProjects: ["بحري"] },
  { id: 65, name: "محمد المساعد", headquarters: ["الرياض"], specialization: "طرق", keyProjects: ["جسور"] },
  { id: 66, name: "السحيمي", headquarters: ["الدمام"], specialization: "أساسات", keyProjects: ["حقن"] },
  { id: 67, name: "سير غاز", headquarters: ["الدمام"], specialization: "غاز", keyProjects: ["MEP"] },
  { id: 68, name: "صلابة المشاريع", headquarters: ["الدمام"], specialization: "إنشائي", keyProjects: ["مصانع"] },
  { id: 69, name: "اعتماد", headquarters: ["الرياض", "الدمام"], specialization: "مقاولات", keyProjects: ["تجاري"] },
  { id: 70, name: "بشائر المنطقة", headquarters: ["الدمام"], specialization: "مدني", keyProjects: ["صيانة"] },
  { id: 71, name: "معان", headquarters: ["الدمام"], specialization: "تشطيبات", keyProjects: ["ديكور"] },
  { id: 72, name: "جلوبال السحيمي", headquarters: ["الدمام"], specialization: "عزل", keyProjects: ["حماية"] },
  { id: 73, name: "اليامي", headquarters: ["نجران", "الدمام"], specialization: "مقاولات", keyProjects: ["جنوب"] },
  { id: 74, name: "Artec", headquarters: ["الدمام"], specialization: "خرسانة", keyProjects: ["رصف"] },
  { id: 75, name: "أملاك الأولى", headquarters: ["الدمام"], specialization: "تطوير", keyProjects: ["عقاري"] },
  { id: 76, name: "سيمنس", headquarters: ["الرياض", "الخبر"], specialization: "تقني", keyProjects: ["مترو"] },
  { id: 77, name: "SRACO", headquarters: ["الدمام"], specialization: "صيانة", keyProjects: ["أرامكو"] },
  { id: 78, name: "DUR", headquarters: ["الرياض"], specialization: "فنادق", keyProjects: ["ضيافة"] },
  { id: 79, name: "منزل الشرق", headquarters: ["الدمام"], specialization: "مقاولات", keyProjects: ["فلل"] },
  { id: 80, name: "مصطفى الراجح", headquarters: ["الدمام"], specialization: "إنشائي", keyProjects: ["تقليدي"] },
  { id: 81, name: "بحرزاف", headquarters: ["الدمام"], specialization: "ميكانيك", keyProjects: ["صناعي"] },
  { id: 82, name: "سواسي", headquarters: ["الدمام"], specialization: "تشييد", keyProjects: ["أراضي"] },
  { id: 83, name: "سندان", headquarters: ["الجبيل"], specialization: "صيانة", keyProjects: ["سابك"] },
  { id: 84, name: "بندر الشيباني", headquarters: ["الدمام"], specialization: "حفر", keyProjects: ["ردم"] },
  { id: 85, name: "العطيشان", headquarters: ["الدمام"], specialization: "لوجستيك", keyProjects: ["دعم"] },
  { id: 86, name: "لؤلؤة السلطان", headquarters: ["الدمام"], specialization: "مقاولات", keyProjects: ["ترميم"] },
  { id: 87, name: "مشاريع الخليج", headquarters: ["الدمام"], specialization: "تشغيل", keyProjects: ["بنية"] },
  { id: 88, name: "شفيق", headquarters: ["الدمام"], specialization: "معماري", keyProjects: ["سكني"] },
  { id: 89, name: "نجوم سدير", headquarters: ["الرياض"], specialization: "تطوير", keyProjects: ["عمراني"] },
  { id: 90, name: "مسارات التشييد", headquarters: ["الرياض"], specialization: "إنشائي", keyProjects: ["أبراج"] },
  { id: 91, name: "منافع البناء", headquarters: ["الرياض"], specialization: "بناء سريع", keyProjects: ["تقنيات"] },
  { id: 92, name: "سكايب", headquarters: ["الرياض"], specialization: "واجهات", keyProjects: ["معمارية"] },
  { id: 93, name: "درة المدائن", headquarters: ["الرياض"], specialization: "تشطيبات", keyProjects: ["جاهزة"] },
  { id: 94, name: "سما التشييد", headquarters: ["الرياض"], specialization: "إنشائي", keyProjects: ["بنية"] },
  { id: 95, name: "تارا", headquarters: ["الرياض"], specialization: "كهروميكانيك", keyProjects: ["توريد"] },
  { id: 96, name: "دنيا التعمير", headquarters: ["الرياض"], specialization: "مقاولات", keyProjects: ["حكومي"] },
  { id: 97, name: "تبوك الحديثة", headquarters: ["تبوك"], specialization: "بنية", keyProjects: ["نيوم"] },
  { id: 98, name: "ساما الأصالة", headquarters: ["جدة"], specialization: "تشطيبات", keyProjects: ["فاخر"] },
  { id: 99, name: "نجم العزايم", headquarters: ["الدمام"], specialization: "مقاولات", keyProjects: ["بلدية"] },
  { id: 100, name: "أركان البناء الذهبية", headquarters: ["جدة"], specialization: "تطوير", keyProjects: ["سكني"] },
];

const egCompanySeeds = [
  { id: 101, name: "أوراسكوم كونستراكشون", headquarters: ["القاهرة", "الجيزة"], specialization: "مقاولات عامة وبنية تحتية", keyProjects: ["المتحف المصري الكبير", "شبكات طرق", "محطات طاقة"] },
  { id: 102, name: "مجموعة طلعت مصطفى القابضة", headquarters: ["القاهرة"], specialization: "تطوير عقاري متكامل", keyProjects: ["مدينتي", "الرحاب", "ساوث ميد"] },
  { id: 103, name: "بالم هيلز للتطوير", headquarters: ["القاهرة", "الإسكندرية"], specialization: "تطوير عقاري وسكني", keyProjects: ["بادية", "بالم هيلز أكتوبر", "هاسيندا"] },
  { id: 104, name: "إعمار مصر", headquarters: ["القاهرة"], specialization: "تطوير عقاري وسياحي", keyProjects: ["ميفيدا", "أب تاون كايرو", "مراسي"] },
  { id: 105, name: "أوراسكوم للتنمية مصر", headquarters: ["القاهرة", "البحر الأحمر"], specialization: "تطوير مدن ومجتمعات متكاملة", keyProjects: ["الجونة", "مكادي هايتس", "أو ويست"] },
  { id: 106, name: "مدينة مصر", headquarters: ["القاهرة"], specialization: "تطوير عقاري حضري", keyProjects: ["تاج سيتي", "سراي"] },
  { id: 107, name: "سوديك", headquarters: ["القاهرة", "الشيخ زايد"], specialization: "تطوير عقاري وتجاري", keyProjects: ["إيستاون", "فيليت", "ذا إستيتس"] },
  { id: 108, name: "حسن علام القابضة", headquarters: ["القاهرة"], specialization: "مقاولات وبنية تحتية وطاقة", keyProjects: ["العلمين الجديدة", "محطات معالجة", "مشروعات قومية"] },
  { id: 109, name: "حسن علام للتطوير", headquarters: ["القاهرة", "الساحل الشمالي"], specialization: "تطوير عقاري فاخر", keyProjects: ["بارك فيو", "هاب تاون", "سيزونز"] },
  { id: 110, name: "ماونتن فيو", headquarters: ["القاهرة"], specialization: "تطوير عقاري سكني", keyProjects: ["آي سيتي", "تشيل أوت بارك", "رأس الحكمة"] },
  { id: 111, name: "ريدكون للتعمير", headquarters: ["القاهرة"], specialization: "مقاولات عامة وأبراج", keyProjects: ["أبراج تجارية", "مقار إدارية", "مشروعات فندقية"] },
  { id: 112, name: "المقاولون العرب", headquarters: ["القاهرة", "الإسكندرية"], specialization: "مقاولات عامة وطرق وجسور", keyProjects: ["محاور وكباري", "إسكان", "مشروعات تصدير"] },
  { id: 113, name: "كونكورد للمقاولات", headquarters: ["القاهرة"], specialization: "مقاولات عامة ومطارات", keyProjects: ["مبانٍ حكومية", "مطارات", "بنية تحتية"] },
  { id: 114, name: "سامكريت", headquarters: ["القاهرة"], specialization: "مقاولات وإنشاءات", keyProjects: ["مبانٍ إدارية", "مرافق", "مشروعات جامعية"] },
  { id: 115, name: "درة جروب", headquarters: ["القاهرة"], specialization: "مقاولات وتطوير", keyProjects: ["أبراج", "مولات", "مشروعات سكنية"] },
  { id: 116, name: "مصر إيطاليا العقارية", headquarters: ["القاهرة"], specialization: "تطوير عقاري", keyProjects: ["البوسكو", "كايرو بيزنس بارك", "فينشي"] },
  { id: 117, name: "سيتي إيدج للتطوير العقاري", headquarters: ["القاهرة", "العلمين"], specialization: "تطوير عقاري حكومي", keyProjects: ["أبراج العلمين", "مقصد", "داون تاون الجديدة"] },
  { id: 118, name: "هايد بارك للتطوير", headquarters: ["القاهرة"], specialization: "تطوير عقاري", keyProjects: ["هايد بارك القاهرة الجديدة", "سي شور"] },
];

const aeCompanySeeds = [
  { id: 201, name: "إعمار العقارية", headquarters: ["دبي"], specialization: "تطوير عقاري وإنشاءات", keyProjects: ["برج خليفة", "دبي مول", "دبي كريك هاربور"] },
  { id: 202, name: "إعمار للتطوير", headquarters: ["دبي"], specialization: "تطوير مجتمعات سكنية", keyProjects: ["دبي هيلز", "إعمار بيتش فرونت", "المرابع"] },
  { id: 203, name: "الدار العقارية", headquarters: ["أبوظبي"], specialization: "تطوير عقاري واستثمار", keyProjects: ["ياس آيلاند", "جزيرة السعديات", "الريم"] },
  { id: 204, name: "داماك العقارية", headquarters: ["دبي"], specialization: "تطوير عقاري فاخر", keyProjects: ["داماك هيلز", "لاجونز", "صفا ون"] },
  { id: 205, name: "شوبا العقارية", headquarters: ["دبي"], specialization: "تطوير عقاري فاخر", keyProjects: ["شوبا هارتلاند", "شوبا ريزيرف"] },
  { id: 206, name: "عزيزي للتطوير", headquarters: ["دبي"], specialization: "تطوير عقاري", keyProjects: ["عزيزي فينيسيا", "ريفييرا", "ميناء"] },
  { id: 207, name: "دانوب العقارية", headquarters: ["دبي"], specialization: "تطوير عقاري متوسط وفاخر", keyProjects: ["بايز", "إليت", "أوشنز"] },
  { id: 208, name: "نخيل", headquarters: ["دبي"], specialization: "تطوير عمراني وجزر", keyProjects: ["نخلة جميرا", "ورسان", "ديرة آيلاندز"] },
  { id: 209, name: "مِراس", headquarters: ["دبي"], specialization: "تطوير حضري وترفيهي", keyProjects: ["بلوواترز", "سيتي ووك", "لا مير"] },
  { id: 210, name: "دبي القابضة العقارية", headquarters: ["دبي"], specialization: "تطوير عقاري متكامل", keyProjects: ["جميرا فيليج", "تلال الغاف", "مجتمعات دبي"] },
  { id: 211, name: "بن غاطي", headquarters: ["دبي"], specialization: "تطوير أبراج سكنية", keyProjects: ["برج بن غاطي", "مشروعات الخليج التجاري", "قرية جميرا"] },
  { id: 212, name: "أمنيات", headquarters: ["دبي"], specialization: "تطوير عقاري فاخر", keyProjects: ["ذا لانا", "أورا", "ون بالم"] },
  { id: 213, name: "إلينغتون العقارية", headquarters: ["دبي"], specialization: "تطوير عقاري فاخر", keyProjects: ["إلينغتون هاوس", "كوستا ماري"] },
  { id: 214, name: "تقرير العقارية", headquarters: ["أبوظبي", "دبي"], specialization: "تطوير عقاري سكني", keyProjects: ["مشروعات جزيرة الريم", "دبي لاند"] },
  { id: 215, name: "خنصهب للهندسة المدنية", headquarters: ["دبي"], specialization: "مقاولات عامة ومباني", keyProjects: ["مطارات", "فنادق", "مبانٍ تعليمية"] },
  { id: 216, name: "أليك للهندسة والمقاولات", headquarters: ["دبي", "أبوظبي"], specialization: "مقاولات عامة وأبراج", keyProjects: ["مطارات", "أبراج دبي", "مشروعات ضيافة"] },
  { id: 217, name: "ASGC للمقاولات", headquarters: ["دبي"], specialization: "مقاولات عامة", keyProjects: ["مشروعات حكومية", "أبراج", "مستشفيات"] },
  { id: 218, name: "تروجان للإنشاءات", headquarters: ["أبوظبي"], specialization: "مقاولات وبنية تحتية", keyProjects: ["بنية تحتية", "أبراج", "مرافق"] },
  { id: 219, name: "UNEC", headquarters: ["أبوظبي", "دبي"], specialization: "مقاولات عامة", keyProjects: ["مجمعات سكنية", "فنادق", "تجاري"] },
  { id: 220, name: "الحبتور للمشاريع الهندسية", headquarters: ["دبي"], specialization: "مقاولات وأبراج وفنادق", keyProjects: ["فنادق", "أبراج", "مشروعات بنية"] },
  { id: 221, name: "النبودة للمقاولات", headquarters: ["دبي"], specialization: "طرق ومطارات وبنية تحتية", keyProjects: ["طرق دبي", "مطارات", "مرافق"] },
];

const egAdditionalCompanySeeds = [
  { id: 119, name: "إتش دي بي", headquarters: ["القاهرة الجديدة", "الشيخ زايد"], specialization: "تطوير عقاري", keyProjects: ["تلال إيست", "تلال سول", "كلوب هيلز ريزيدنس"] },
  { id: 120, name: "أركو", headquarters: ["القاهرة"], specialization: "تطوير عقاري وسياحي", keyProjects: ["لاجونا باي", "سيتي ستارز الساحل", "لافونتين"] },
  { id: 121, name: "إن ديفلوبمنتس", headquarters: ["القاهرة الجديدة", "العاصمة الإدارية"], specialization: "تطوير عقاري", keyProjects: ["جولدن جيت", "أعمال العاصمة", "مشروعات حضرية"] },
  { id: 122, name: "آي جي آي العقارية", headquarters: ["القاهرة"], specialization: "تطوير عقاري سكني", keyProjects: ["أشجار سيتي", "جاردينيا بارك", "ويست جيت"] },
  { id: 123, name: "أب وايد للتطوير", headquarters: ["القاهرة الجديدة", "العاصمة الإدارية"], specialization: "تطوير إداري وتجاري", keyProjects: ["إيت بيزنس هب", "سينكو", "جرانوي"] },
  { id: 124, name: "أجنا للتطوير", headquarters: ["العين السخنة", "القاهرة"], specialization: "تطوير عقاري وساحلي", keyProjects: ["كارنيليا", "عين باي", "وجهات ساحلية"] },
  { id: 125, name: "أرابيلا", headquarters: ["القاهرة الجديدة"], specialization: "تطوير عقاري", keyProjects: ["أرابيلا بارك", "أرابيلا بلازا", "أرابيلا ريزيدنس"] },
  { id: 126, name: "أوربن لينز", headquarters: ["العاصمة الإدارية", "القاهرة الجديدة"], specialization: "تطوير إداري وتجاري", keyProjects: ["ليفلز بيزنس تاور", "ييللو ريزيدنس", "إيست لين"] },
  { id: 127, name: "أركان بالم", headquarters: ["الشيخ زايد", "6 أكتوبر"], specialization: "تطوير تجاري وسكني", keyProjects: ["205", "أركان بلازا", "كلوب سايد"] },
  { id: 128, name: "إس تي إم للتطوير", headquarters: ["العاصمة الإدارية", "القاهرة الجديدة"], specialization: "تطوير عقاري", keyProjects: ["أفنترا", "وحدات إدارية", "تجاري"] },
  { id: 129, name: "أكام الراجحي", headquarters: ["القاهرة"], specialization: "تطوير عقاري", keyProjects: ["سيناريو", "دوس", "مشروعات العاصمة"] },
  { id: 130, name: "الأماكن للتطوير", headquarters: ["القاهرة الجديدة", "العاصمة الإدارية"], specialization: "تطوير عقاري", keyProjects: ["مجتمع متكامل", "وحدات إدارية", "مشروعات القاهرة الجديدة"] },
  { id: 131, name: "إنما للتطوير", headquarters: ["القاهرة"], specialization: "تطوير عقاري", keyProjects: ["سكني", "إداري", "تجاري"] },
  { id: 132, name: "الدولية للتطوير", headquarters: ["العاصمة الإدارية", "القاهرة"], specialization: "تطوير عقاري واستثماري", keyProjects: ["مبنى أعمال", "مشروعات خدمات", "وحدات استثمارية"] },
  { id: 133, name: "الديار القطرية", headquarters: ["القاهرة الجديدة", "العاصمة الإدارية"], specialization: "تطوير عقاري متكامل", keyProjects: ["سيتي جيت", "سانت ريجيس", "سكني فاخر"] },
  { id: 134, name: "العطار للتطوير", headquarters: ["القاهرة"], specialization: "تطوير عقاري وتجاري", keyProjects: ["بارك لين", "ليفال", "ذا بافيليون"] },
  { id: 135, name: "القمزي للتطوير", headquarters: ["القاهرة"], specialization: "تطوير عقاري وسكني", keyProjects: ["إيستوور", "سيان", "سكني إداري"] },
  { id: 136, name: "إيل كازار", headquarters: ["القاهرة"], specialization: "تطوير عقاري فاخر", keyProjects: ["ذا كريست", "جو هليوبوليس", "كريك تاون"] },
  { id: 137, name: "نايل للتطوير", headquarters: ["العاصمة الإدارية", "القاهرة الجديدة"], specialization: "تطوير أبراج ومشروعات إدارية", keyProjects: ["نايل بيزنس سيتي", "31 نورث", "تايكون تاور"] },
  { id: 138, name: "إم سكويرد", headquarters: ["القاهرة الجديدة", "مستقبل سيتي"], specialization: "تطوير عقاري سكني", keyProjects: ["تريو", "41 بيزنس ديستريكت", "سكني فاخر"] },
  { id: 139, name: "إمكان مصر", headquarters: ["القاهرة الجديدة", "رأس الحكمة"], specialization: "تطوير عقاري وساحلي", keyProjects: ["البروج", "وجهات ساحلية", "مجتمع سكني"] },
  { id: 140, name: "إنرشيا مصر", headquarters: ["القاهرة"], specialization: "تطوير عقاري وساحلي", keyProjects: ["جيفيرا", "سوليا", "ويست هيلز"] },
  { id: 141, name: "أورا ديفلوبرز", headquarters: ["القاهرة"], specialization: "تطوير عقاري متكامل", keyProjects: ["زد الشيخ زايد", "زد إيست", "سولانا"] },
  { id: 142, name: "باراجون للتطوير", headquarters: ["العاصمة الإدارية"], specialization: "تطوير إداري وتجاري", keyProjects: ["باراجون 1", "باراجون 2", "باراجون بيزنس تاور"] },
  { id: 143, name: "بي آر إي", headquarters: ["القاهرة"], specialization: "تطوير عقاري وتجاري", keyProjects: ["إيفير", "آيون", "مشروعات حضرية"] },
  { id: 144, name: "بيبول آند بليسز", headquarters: ["القاهرة", "الساحل الشمالي"], specialization: "تطوير ساحلي وسكني", keyProjects: ["ذا ميد", "هيلز أوف وان", "مشروعات ساحلية"] },
  { id: 145, name: "تي بي كي للتطوير", headquarters: ["القاهرة"], specialization: "تطوير عقاري وتجاري", keyProjects: ["كي واي", "بيزنس هب", "سكني إداري"] },
  { id: 146, name: "ريدي جروب", headquarters: ["القاهرة الجديدة", "القاهرة"], specialization: "تطوير عقاري وسكني", keyProjects: ["أزار", "سكني شرق القاهرة", "مجتمع متكامل"] },
  { id: 147, name: "ستارلايت للتطوير", headquarters: ["القاهرة"], specialization: "تطوير عقاري وساحلي", keyProjects: ["كيان", "كاتاميا ريزيدنس", "منتجع ساحلي"] },
  { id: 148, name: "مراكز", headquarters: ["6 أكتوبر", "رأس الحكمة"], specialization: "تطوير تجاري وسكني", keyProjects: ["مول العرب", "ديستريكت 5", "راملا"] },
  { id: 149, name: "مودون مصر", headquarters: ["رأس الحكمة", "القاهرة"], specialization: "تطوير عقاري وساحلي", keyProjects: ["مشروعات رأس الحكمة", "منتجعات ساحلية", "سكني فاخر"] },
  { id: 150, name: "مباني إدريس", headquarters: ["الشيخ زايد", "6 أكتوبر"], specialization: "تطوير عقاري سكني", keyProjects: ["جرين 5", "سنترال أفينيو", "ذا بلوك"] },
];

const aeAdditionalCompanySeeds = [
  { id: 222, name: "دبي العقارية", headquarters: ["دبي"], specialization: "تطوير عقاري متكامل", keyProjects: ["جميرا بيتش ريزيدنس", "مدن", "الخليج التجاري"] },
  { id: 223, name: "سيليكت جروب", headquarters: ["دبي"], specialization: "تطوير أبراج سكنية", keyProjects: ["مارينا جيت", "سيفن سيتي", "بينينسولا"] },
  { id: 224, name: "تايجر جروب", headquarters: ["دبي", "الشارقة"], specialization: "تطوير عقاري وأبراج", keyProjects: ["تايجر سكاي", "نيفين", "فلل الشارقة"] },
  { id: 225, name: "ماج لايف ستايل", headquarters: ["دبي"], specialization: "تطوير عقاري سكني", keyProjects: ["ماج سيتي", "كيتوورا", "سكني فاخر"] },
  { id: 226, name: "دبي هولدينج", headquarters: ["دبي"], specialization: "تطوير حضري ومجتمعات", keyProjects: ["جميرا سنترال", "دبي هاربور", "تلال الغاف"] },
  { id: 227, name: "ديار العقارية", headquarters: ["دبي"], specialization: "تطوير عقاري وإدارة مجتمعات", keyProjects: ["ميدتاون", "تريا", "روزاليا"] },
  { id: 228, name: "دانوب العقارية", headquarters: ["دبي"], specialization: "تطوير عقاري سكني", keyProjects: ["إليتز", "أوشنز", "بيوت عصرية"] },
  { id: 229, name: "وصل العقارية", headquarters: ["دبي"], specialization: "تطوير وإدارة عقارات", keyProjects: ["بارك غيت", "وصل1", "وصل جيت"] },
  { id: 230, name: "سمانا للتطوير", headquarters: ["دبي"], specialization: "تطوير عقاري سكني", keyProjects: ["سمانا سكاي", "سمانا جولف", "سمانا بارك"] },
  { id: 231, name: "كايان جروب", headquarters: ["دبي"], specialization: "تطوير أبراج ومشروعات ساحلية", keyProjects: ["كايان تاور", "لاجونز", "واجهة بحرية"] },
  { id: 232, name: "دبي الجنوب", headquarters: ["دبي"], specialization: "تطوير عمراني ولوجستي", keyProjects: ["إكسبو فيليج", "المدينة السكنية", "الحي اللوجستي"] },
  { id: 233, name: "بريسكوت العقارية", headquarters: ["دبي"], specialization: "تطوير عقاري متوسط وفاخر", keyProjects: ["ليغاسي", "سيرين", "سكني حضري"] },
  { id: 234, name: "فينشيتور", headquarters: ["دبي"], specialization: "تطوير عقاري سكني", keyProjects: ["بوليڤارد", "دولتشي فيتا", "فولاري"] },
  { id: 235, name: "نشاما", headquarters: ["دبي"], specialization: "تطوير مجتمعات سكنية", keyProjects: ["تاون سكوير", "نشامة بارك", "مجتمع حضري"] },
  { id: 236, name: "ذا فيرست جروب", headquarters: ["دبي"], specialization: "ضيافة وتطوير عقاري", keyProjects: ["سيلا", "ذا ون", "فنادق وأبراج فندقية"] },
  { id: 237, name: "يونيون العقارية", headquarters: ["دبي"], specialization: "تطوير عقاري وتجاري", keyProjects: ["موتور سيتي", "أبتاون مردف", "إندكس"] },
  { id: 238, name: "دبي للاستثمارات العقارية", headquarters: ["دبي"], specialization: "تطوير مجمعات سكنية", keyProjects: ["جرين كوميونيتي", "دبي إنفستمنت بارك", "مشروعات لوجستية"] },
  { id: 239, name: "ريبورتاج العقارية", headquarters: ["أبوظبي", "دبي"], specialization: "تطوير سكني", keyProjects: ["ديفا", "بيرلا", "ريفلكشن"] },
  { id: 240, name: "بلوم هولدينج", headquarters: ["أبوظبي"], specialization: "تطوير مجتمعات وتعليم وضيافة", keyProjects: ["بلوم ليفينج", "بلوم جاردنز", "بلوم مارينا"] },
  { id: 241, name: "إمكان العقارية", headquarters: ["أبوظبي"], specialization: "تطوير مجتمعات وتصميم حضري", keyProjects: ["الجرْف", "بكسل", "ندرة"] },
  { id: 242, name: "سفن تايدز", headquarters: ["دبي"], specialization: "تطوير عقاري وضيافة", keyProjects: ["أنانتارا", "سيفن بالم", "فندقي سكني"] },
  { id: 243, name: "ماجد الفطيم العقارية", headquarters: ["دبي"], specialization: "تطوير مجتمعات وتجاري", keyProjects: ["تلال الغاف", "مول الإمارات", "غاف وودز"] },
  { id: 244, name: "مرابا العقارية", headquarters: ["دبي"], specialization: "تطوير عقاري فاخر", keyProjects: ["مرابا فيفو", "ذا لاند ريزيدنس", "سكني فاخر"] },
  { id: 245, name: "ليف للتطوير", headquarters: ["دبي"], specialization: "تطوير أبراج سكنية", keyProjects: ["ليف مارينا", "ليف لوكس", "واجهة بحرية"] },
  { id: 246, name: "سويد آند سويد", headquarters: ["دبي"], specialization: "تطوير تجاري وسكني", keyProjects: ["ذا لينكس", "أبراج أعمال", "مكاتب"] },
  { id: 247, name: "امتياز للتطوير", headquarters: ["دبي"], specialization: "تطوير عقاري فاخر", keyProjects: ["كوف", "ويفز", "صن ست إيه سي"] },
  { id: 248, name: "أرادا", headquarters: ["الشارقة", "دبي"], specialization: "تطوير مجتمعات متكاملة", keyProjects: ["الجادة", "مسار", "نسمة"] },
  { id: 249, name: "راك العقارية", headquarters: ["رأس الخيمة"], specialization: "تطوير عقاري ومجتمعات", keyProjects: ["ميناء العرب", "جزيرة الحياة", "راك سنترال"] },
  { id: 250, name: "مدن العقارية", headquarters: ["أبوظبي"], specialization: "تطوير حضري ووجهات كبرى", keyProjects: ["جزيرة الحديريات", "نودرا", "وجهات ساحلية"] },
];

const expandedEgCompanySeeds = [...egCompanySeeds, ...egAdditionalCompanySeeds];
const expandedAeCompanySeeds = [...aeCompanySeeds, ...aeAdditionalCompanySeeds];

const companyWebsiteMap = {
  "مجموعة بن لادن السعودية": "https://www.sbg.com.sa/ar",
  "شركة نسما وشركاهم": "https://www.nesmapartners.com/ar",
  "شركة السيف للمقاولات": "https://www.el-seif.com.sa/ar",
  "شركة البواني": "https://www.albawani.net/",
  "المباني مقاولون عامون": "https://mabani.com.sa/",
  RTCC: "https://www.rtcc.com.sa/",
  الكفاح: "https://www.alkifah.com.sa/",
  الفنار: "https://www.alfanarprojects.com/",
  الروشن: "https://www.roshn.sa/en/",
  "أوراسكوم كونستراكشون": "https://www.orascom.com/",
  "مجموعة طلعت مصطفى القابضة": "https://www.talaatmoustafa.com/",
  "بالم هيلز للتطوير": "https://palmhillsdevelopments.com/",
  "إعمار مصر": "https://www.emaarmisr.com/",
  "أوراسكوم للتنمية مصر": "https://www.orascomdh.com/",
  سوديك: "https://www.sodic.com/",
  "حسن علام القابضة": "https://www.hassanallam.com/",
  "حسن علام للتطوير": "https://www.hassanallamproperties.com/",
  "إتش دي بي": "https://www.hdp.com.eg/",
  "أب وايد للتطوير": "https://upwyde.com/",
  "إيل كازار": "https://ilcazar.com/",
  "أورا ديفلوبرز": "https://www.oradevelopers.com/",
  "تي بي كي للتطوير": "https://tbkdevelopments.com/",
  "مراكز": "https://marakezegypt.com/",
  "مدينة مصر": "https://madinetmasr.com/",
  "ريدي جروب": "https://reedygroup.com/",
  "ستارلايت للتطوير": "https://www.starlightdevelopments.com/",
  "ذا ووترواي": "https://waterway.eg/",
  "إعمار العقارية": "https://properties.emaar.com/",
  "إعمار للتطوير": "https://www.emaar.com/",
  "الدار العقارية": "https://www.aldar.com/",
  "داماك العقارية": "https://www.damacproperties.com/",
  "شوبا العقارية": "https://www.sobharealty.com/",
  "عزيزي للتطوير": "https://www.azizidevelopments.com/",
  نخيل: "https://www.nakheel.com/",
  مراس: "https://www.meraas.com/",
  "سيليكت جروب": "https://www.select-group.ae/",
  "تايجر جروب": "https://www.tigergroup.ae/",
  "وصل العقارية": "https://www.wasl.ae/",
  "سمانا للتطوير": "https://www.samanadevelopers.com/",
  نشاما: "https://nshama.ae/",
  "بريسكوت العقارية": "https://prescott.ae/",
  "دبي الجنوب": "https://www.dubaisouth.ae/",
  "ليف للتطوير": "https://www.livuae.com/",
  "امتياز للتطوير": "https://www.imtiaz.ae/",
  "خنصهب للهندسة المدنية": "https://www.khansaheb.ae/",
  "أليك للهندسة والمقاولات": "https://www.alec.ae/",
  "ASGC للمقاولات": "https://www.asgcgroup.com/",
  "تروجان للإنشاءات": "https://trojanholding.ae/",
  UNEC: "https://www.unec.ae/",
};

function createCompanyWebsite(name) {
  if (companyWebsiteMap[name]) {
    return companyWebsiteMap[name];
  }

  return `https://www.google.com/search?q=${encodeURIComponent(`${name} official website`)}`;
}

function getCompanyType(specialization) {
  return specialization.includes("استشارات") || specialization.includes("تصميم")
    ? "Consultant"
    : "Contractor";
}

function getCompanyLogo(specialization, type) {
  if (type === "Consultant") {
    return "📐";
  }
  if (specialization.includes("طرق") || specialization.includes("جسور") || specialization.includes("سكك")) {
    return "🛣️";
  }
  if (specialization.includes("كهرب")) {
    return "⚡";
  }
  if (
    specialization.includes("MEP") ||
    specialization.includes("ميكانيك") ||
    specialization.includes("كهروميكانيك")
  ) {
    return "🛠️";
  }
  if (specialization.includes("مياه") || specialization.includes("تحلية")) {
    return "💧";
  }
  if (specialization.includes("خرسانة") || specialization.includes("إنشائي") || specialization.includes("أساسات")) {
    return "🏗️";
  }
  if (specialization.includes("معماري") || specialization.includes("تشطيبات") || specialization.includes("واجهات")) {
    return "🧱";
  }

  return "🏢";
}

const projectStages = ["نشط", "تسعير", "تخطيط"];

function mapCompanySeeds(entries, country) {
  return entries.map((entry) => {
    const type = getCompanyType(entry.specialization);
    const logo = getCompanyLogo(entry.specialization, type);

    return {
      id: `comp-${entry.id}`,
      name: entry.name,
      type,
      country,
      logo,
      specialization: entry.specialization,
      headquarters: entry.headquarters,
      keyProjects: entry.keyProjects,
      website: createCompanyWebsite(entry.name),
      description: `متخصصة في ${entry.specialization} مع حضور قوي في ${entry.headquarters.join(" و")}.`,
      rating: Number((4.1 + ((entry.id % 8) * 0.1)).toFixed(1)),
      projectsCount: entry.keyProjects.length,
      projects: entry.keyProjects.map((projectName, projectIndex) => ({
        id: `proj-${entry.id}-${projectIndex + 1}`,
        name: projectName,
        location: entry.headquarters[projectIndex % entry.headquarters.length],
        stage: projectStages[(entry.id + projectIndex) % projectStages.length],
        budget: "",
        pricingItems: [],
      })),
    };
  });
}

export const sampleCompanies = [
  ...mapCompanySeeds(saCompanySeeds, "السعودية"),
  ...mapCompanySeeds(expandedEgCompanySeeds, "مصر"),
  ...mapCompanySeeds(expandedAeCompanySeeds, "الإمارات"),
];
