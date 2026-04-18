const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const DEFAULT_OUTPUT = path.join(
  __dirname,
  "..",
  "src",
  "data",
  "importedPricingWorkbook.json"
);

function parseOptions(args) {
  return args.reduce((accumulator, current) => {
    if (!current.startsWith("--")) {
      return accumulator;
    }

    const [key, value] = current.slice(2).split("=");
    accumulator[key] = value || true;
    return accumulator;
  }, {});
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const normalized = String(value).replace(/,/g, "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapCategory(sourceCategory) {
  const value = String(sourceCategory || "").trim();

  if (value.startsWith("إنشائي")) {
    return "أعمال إنشائية";
  }

  if (value.startsWith("معماري")) {
    return "أعمال معمارية";
  }

  if (value.startsWith("كهرباء")) {
    return "أعمال كهربائية";
  }

  if (value.startsWith("ميكانيكا")) {
    return "أعمال ميكانيكية";
  }

  return null;
}

function buildRows(sheet, sourceName, market, currency) {
  const grid = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: "",
  });

  return grid
    .slice(1)
    .map((row, index) => {
      const sourceCategory = row[1];
      const category = mapCategory(sourceCategory);
      const consultantPrice = toNumber(row[9]);
      const designerPrice = toNumber(row[10]);
      const marketAverage =
        consultantPrice && designerPrice
          ? (consultantPrice + designerPrice) / 2
          : consultantPrice || designerPrice;

      if (!category || !row[2] || !marketAverage) {
        return null;
      }

      return {
        id: `${sourceName}-${index + 1}`,
        sequence: String(row[0] || "").trim(),
        sourceCategory: String(sourceCategory || "").trim(),
        category,
        name: String(row[2] || "").trim(),
        unit: String(row[3] || "").trim(),
        quantity: toNumber(row[4]),
        description: String(row[5] || "").trim(),
        specifications: String(row[6] || "").trim(),
        mandatoryProduct: String(row[7] || "").trim(),
        structuralCode: String(row[8] || "").trim(),
        consultantPrice,
        designerPrice,
        marketAverage,
        totalConsultantPrice: toNumber(row[11]),
        totalDesignerPrice: toNumber(row[12]),
        currency,
        market,
        sourceName,
      };
    })
    .filter(Boolean);
}

function main() {
  const positionalArgs = process.argv.slice(2).filter((argument) => !argument.startsWith("--"));
  const options = parseOptions(process.argv.slice(2));
  const inputPath = positionalArgs[0];
  const outputPath = positionalArgs[1] || DEFAULT_OUTPUT;
  const market = options.market || "Saudi Arabia";
  const currency = options.currency || "SAR";

  if (!inputPath) {
    console.error(
      "Usage: node scripts/importWorkbook.js <input.xlsx> [output.json] [--market=Saudi Arabia] [--currency=SAR]"
    );
    process.exit(1);
  }

  const workbook = XLSX.readFile(inputPath, { cellDates: false });
  const sheetName =
    options.sheet ||
    (workbook.SheetNames.includes("اسعار الشباب")
      ? "اسعار الشباب"
      : workbook.SheetNames[0]);

  const rows = buildRows(
    workbook.Sheets[sheetName],
    path.basename(inputPath, path.extname(inputPath)),
    market,
    currency
  );

  const payload = {
    source: {
      workbook: path.basename(inputPath),
      sourceSheet: sheetName,
      currency,
      market,
      importedAt: new Date().toISOString(),
      rowsCount: rows.length,
    },
    rows,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Imported ${rows.length} pricing rows from ${sheetName}`);
  console.log(`Saved to ${outputPath}`);
}

main();
