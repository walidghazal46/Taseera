const BASELINE_OVERHEAD = 0.06;
const BASELINE_PROFIT = 0.15;

function slugifyArabic(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "")
    .toLowerCase();
}

function buildStatus(consultantPrice, designerPrice) {
  if (!consultantPrice || !designerPrice) {
    return { marketStatus: "مرجعي", marketStatusColor: "green" };
  }

  const average = (consultantPrice + designerPrice) / 2;
  const gap = Math.abs(consultantPrice - designerPrice) / average;

  if (gap <= 0.05) {
    return { marketStatus: "مستقر", marketStatusColor: "green" };
  }

  if (gap <= 0.15) {
    return { marketStatus: "متوسط", marketStatusColor: "yellow" };
  }

  return { marketStatus: "متغير", marketStatusColor: "red" };
}

function reverseDirectCost(marketAverage) {
  return marketAverage / ((1 + BASELINE_OVERHEAD) * (1 + BASELINE_PROFIT));
}

function makeLine(resourceId, price, share) {
  return {
    resourceId,
    consumptionRate: Number((price * share).toFixed(4)),
  };
}

function buildRecipeByTemplate(template, marketAverage) {
  const directCost = reverseDirectCost(marketAverage);

  return template.map((entry) =>
    makeLine(entry.resourceId, directCost / entry.resourcePrice, entry.share)
  );
}

function structuralRecipe(name, resourcesById, marketAverage) {
  if (/حفر|إزالة/.test(name)) {
    return buildRecipeByTemplate(
      [
        { resourceId: "lab-site", resourcePrice: resourcesById["lab-site"].marketPrice, share: 0.35 },
        { resourceId: "eq-excavator", resourcePrice: resourcesById["eq-excavator"].marketPrice, share: 0.65 },
      ],
      marketAverage
    );
  }

  if (/ردم|بحص/.test(name)) {
    return buildRecipeByTemplate(
      [
        { resourceId: "mat-backfill", resourcePrice: resourcesById["mat-backfill"].marketPrice, share: 0.55 },
        { resourceId: "lab-site", resourcePrice: resourcesById["lab-site"].marketPrice, share: 0.15 },
        { resourceId: "eq-compactor", resourcePrice: resourcesById["eq-compactor"].marketPrice, share: 0.3 },
      ],
      marketAverage
    );
  }

  if (/مظله|مظلة|معدنيه|معدنية/.test(name)) {
    return buildRecipeByTemplate(
      [
        { resourceId: "mat-structural-metal", resourcePrice: resourcesById["mat-structural-metal"].marketPrice, share: 0.68 },
        { resourceId: "lab-metal", resourcePrice: resourcesById["lab-metal"].marketPrice, share: 0.2 },
        { resourceId: "eq-lifter", resourcePrice: resourcesById["eq-lifter"].marketPrice, share: 0.12 },
      ],
      marketAverage
    );
  }

  return buildRecipeByTemplate(
    [
      { resourceId: "mat-readymix", resourcePrice: resourcesById["mat-readymix"].marketPrice, share: 0.5 },
      { resourceId: "mat-steel-16", resourcePrice: resourcesById["mat-steel-16"].marketPrice, share: 0.25 },
      { resourceId: "lab-carpenter", resourcePrice: resourcesById["lab-carpenter"].marketPrice, share: 0.12 },
      { resourceId: "lab-steelfixer", resourcePrice: resourcesById["lab-steelfixer"].marketPrice, share: 0.08 },
      { resourceId: "eq-pump", resourcePrice: resourcesById["eq-pump"].marketPrice, share: 0.05 },
    ],
    marketAverage
  );
}

function architecturalRecipe(name, resourcesById, marketAverage) {
  if (/طوب|مباني|بلوك/.test(name)) {
    return buildRecipeByTemplate(
      [
        { resourceId: "mat-block", resourcePrice: resourcesById["mat-block"].marketPrice, share: 0.65 },
        { resourceId: "lab-blockworker", resourcePrice: resourcesById["lab-blockworker"].marketPrice, share: 0.25 },
        { resourceId: "eq-scaffold", resourcePrice: resourcesById["eq-scaffold"].marketPrice, share: 0.1 },
      ],
      marketAverage
    );
  }

  if (/لياس|محارة/.test(name)) {
    return buildRecipeByTemplate(
      [
        { resourceId: "mat-plaster", resourcePrice: resourcesById["mat-plaster"].marketPrice, share: 0.6 },
        { resourceId: "lab-finisher", resourcePrice: resourcesById["lab-finisher"].marketPrice, share: 0.3 },
        { resourceId: "eq-scaffold", resourcePrice: resourcesById["eq-scaffold"].marketPrice, share: 0.1 },
      ],
      marketAverage
    );
  }

  if (/دهان/.test(name)) {
    return buildRecipeByTemplate(
      [
        { resourceId: "mat-paint", resourcePrice: resourcesById["mat-paint"].marketPrice, share: 0.65 },
        { resourceId: "lab-finisher", resourcePrice: resourcesById["lab-finisher"].marketPrice, share: 0.3 },
        { resourceId: "eq-scaffold", resourcePrice: resourcesById["eq-scaffold"].marketPrice, share: 0.05 },
      ],
      marketAverage
    );
  }

  if (/عزل/.test(name)) {
    return buildRecipeByTemplate(
      [
        { resourceId: "mat-waterproof", resourcePrice: resourcesById["mat-waterproof"].marketPrice, share: 0.7 },
        { resourceId: "lab-finisher", resourcePrice: resourcesById["lab-finisher"].marketPrice, share: 0.2 },
        { resourceId: "eq-scaffold", resourcePrice: resourcesById["eq-scaffold"].marketPrice, share: 0.1 },
      ],
      marketAverage
    );
  }

  if (/باب|درابزين|واجهات|زجاج/.test(name)) {
    return buildRecipeByTemplate(
      [
        { resourceId: "mat-joinery", resourcePrice: resourcesById["mat-joinery"].marketPrice, share: 0.75 },
        { resourceId: "lab-installer", resourcePrice: resourcesById["lab-installer"].marketPrice, share: 0.18 },
        { resourceId: "eq-scaffold", resourcePrice: resourcesById["eq-scaffold"].marketPrice, share: 0.07 },
      ],
      marketAverage
    );
  }

  if (/سقف|جبس/.test(name)) {
    return buildRecipeByTemplate(
      [
        { resourceId: "mat-gypsum", resourcePrice: resourcesById["mat-gypsum"].marketPrice, share: 0.68 },
        { resourceId: "lab-finisher", resourcePrice: resourcesById["lab-finisher"].marketPrice, share: 0.22 },
        { resourceId: "eq-scaffold", resourcePrice: resourcesById["eq-scaffold"].marketPrice, share: 0.1 },
      ],
      marketAverage
    );
  }

  if (/بورسلان|سيراميك|بلاط|موكيت/.test(name)) {
    return buildRecipeByTemplate(
      [
        { resourceId: "mat-tiles", resourcePrice: resourcesById["mat-tiles"].marketPrice, share: 0.72 },
        { resourceId: "lab-tiler", resourcePrice: resourcesById["lab-tiler"].marketPrice, share: 0.2 },
        { resourceId: "eq-scaffold", resourcePrice: resourcesById["eq-scaffold"].marketPrice, share: 0.08 },
      ],
      marketAverage
    );
  }

  return buildRecipeByTemplate(
    [
      { resourceId: "mat-finish", resourcePrice: resourcesById["mat-finish"].marketPrice, share: 0.7 },
      { resourceId: "lab-finisher", resourcePrice: resourcesById["lab-finisher"].marketPrice, share: 0.22 },
      { resourceId: "eq-scaffold", resourcePrice: resourcesById["eq-scaffold"].marketPrice, share: 0.08 },
    ],
    marketAverage
  );
}

function electricalRecipe(name, resourcesById, marketAverage) {
  if (/إنارة|إضاءة/.test(name)) {
    return buildRecipeByTemplate(
      [
        { resourceId: "mat-lighting", resourcePrice: resourcesById["mat-lighting"].marketPrice, share: 0.58 },
        { resourceId: "mat-cable", resourcePrice: resourcesById["mat-cable"].marketPrice, share: 0.18 },
        { resourceId: "lab-electrician", resourcePrice: resourcesById["lab-electrician"].marketPrice, share: 0.18 },
        { resourceId: "eq-tester", resourcePrice: resourcesById["eq-tester"].marketPrice, share: 0.06 },
      ],
      marketAverage
    );
  }

  if (/لوحة|قاطع|مفتاح|مقبس|مخارج/.test(name)) {
    return buildRecipeByTemplate(
      [
        { resourceId: "mat-switchgear", resourcePrice: resourcesById["mat-switchgear"].marketPrice, share: 0.65 },
        { resourceId: "mat-cable", resourcePrice: resourcesById["mat-cable"].marketPrice, share: 0.12 },
        { resourceId: "lab-electrician", resourcePrice: resourcesById["lab-electrician"].marketPrice, share: 0.18 },
        { resourceId: "eq-tester", resourcePrice: resourcesById["eq-tester"].marketPrice, share: 0.05 },
      ],
      marketAverage
    );
  }

  return buildRecipeByTemplate(
    [
      { resourceId: "mat-cable", resourcePrice: resourcesById["mat-cable"].marketPrice, share: 0.62 },
      { resourceId: "mat-switchgear", resourcePrice: resourcesById["mat-switchgear"].marketPrice, share: 0.1 },
      { resourceId: "lab-electrician", resourcePrice: resourcesById["lab-electrician"].marketPrice, share: 0.22 },
      { resourceId: "eq-tester", resourcePrice: resourcesById["eq-tester"].marketPrice, share: 0.06 },
    ],
    marketAverage
  );
}

function mechanicalRecipe(name, resourcesById, marketAverage) {
  if (/تكييف|دكت|مجرى/.test(name)) {
    return buildRecipeByTemplate(
      [
        { resourceId: "mat-duct", resourcePrice: resourcesById["mat-duct"].marketPrice, share: 0.66 },
        { resourceId: "lab-hvac", resourcePrice: resourcesById["lab-hvac"].marketPrice, share: 0.2 },
        { resourceId: "eq-welder", resourcePrice: resourcesById["eq-welder"].marketPrice, share: 0.14 },
      ],
      marketAverage
    );
  }

  if (/مضخة|مضخات/.test(name)) {
    return buildRecipeByTemplate(
      [
        { resourceId: "mat-pump-mech", resourcePrice: resourcesById["mat-pump-mech"].marketPrice, share: 0.72 },
        { resourceId: "lab-plumber", resourcePrice: resourcesById["lab-plumber"].marketPrice, share: 0.16 },
        { resourceId: "eq-welder", resourcePrice: resourcesById["eq-welder"].marketPrice, share: 0.12 },
      ],
      marketAverage
    );
  }

  return buildRecipeByTemplate(
    [
      { resourceId: "mat-ppr", resourcePrice: resourcesById["mat-ppr"].marketPrice, share: 0.62 },
      { resourceId: "mat-mech-accessory", resourcePrice: resourcesById["mat-mech-accessory"].marketPrice, share: 0.1 },
      { resourceId: "lab-plumber", resourcePrice: resourcesById["lab-plumber"].marketPrice, share: 0.2 },
      { resourceId: "eq-welder", resourcePrice: resourcesById["eq-welder"].marketPrice, share: 0.08 },
    ],
    marketAverage
  );
}

function buildRecipe(row, resourcesById) {
  if (row.category === "أعمال إنشائية") {
    return structuralRecipe(row.name, resourcesById, row.marketAverage);
  }

  if (row.category === "أعمال معمارية") {
    return architecturalRecipe(row.name, resourcesById, row.marketAverage);
  }

  if (row.category === "أعمال كهربائية") {
    return electricalRecipe(row.name, resourcesById, row.marketAverage);
  }

  return mechanicalRecipe(row.name, resourcesById, row.marketAverage);
}

function buildIcon(category) {
  const map = {
    "أعمال إنشائية": "🏗️",
    "أعمال معمارية": "🧱",
    "أعمال كهربائية": "⚡",
    "أعمال ميكانيكية": "🛠️",
  };

  return map[category] || "📦";
}

function buildIndirectDistribution(category) {
  const map = {
    "أعمال إنشائية": [
      { name: "إدارة", ratio: 0.42 },
      { name: "نقل", ratio: 0.33 },
      { name: "مخاطر", ratio: 0.25 },
    ],
    "أعمال معمارية": [
      { name: "إدارة", ratio: 0.46 },
      { name: "نقل", ratio: 0.22 },
      { name: "مخاطر", ratio: 0.32 },
    ],
    "أعمال كهربائية": [
      { name: "إدارة", ratio: 0.44 },
      { name: "نقل", ratio: 0.2 },
      { name: "مخاطر", ratio: 0.36 },
    ],
    "أعمال ميكانيكية": [
      { name: "إدارة", ratio: 0.41 },
      { name: "نقل", ratio: 0.24 },
      { name: "مخاطر", ratio: 0.35 },
    ],
  };

  return map[category] || map["أعمال إنشائية"];
}

export function createImportedPricingItems(rows, resources) {
  const resourcesById = Object.fromEntries(resources.map((resource) => [resource.id, resource]));

  return rows.map((row) => {
    const status = buildStatus(row.consultantPrice, row.designerPrice);
    return {
      id: `imported-${slugifyArabic(row.sequence || row.name)}-${slugifyArabic(row.name).slice(0, 18)}`,
      name: row.name,
      category: row.category,
      code:
        row.structuralCode ||
        `${row.category === "أعمال إنشائية" ? "ST" : row.category === "أعمال معمارية" ? "AR" : row.category === "أعمال كهربائية" ? "EL" : "ME"}-${row.sequence || "000"}`,
      unit: row.unit || "وحدة",
      icon: buildIcon(row.category),
      marketAverage: row.marketAverage,
      marketStatus: status.marketStatus,
      marketStatusColor: status.marketStatusColor,
      indirectDistribution: buildIndirectDistribution(row.category),
      recipe: buildRecipe(row, resourcesById),
      source: {
        market: row.market,
        currency: row.currency,
        sourceName: row.sourceName,
        sourceCategory: row.sourceCategory,
        consultantPrice: row.consultantPrice,
        designerPrice: row.designerPrice,
      },
      notes: row.specifications || row.description,
    };
  });
}
