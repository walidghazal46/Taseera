export function computeItemPricing({
  item,
  resources,
  quantity = 1,
  overheadPercent = 0,
  profitPercent = 0,
  locationFactor = 1,
  overrides = {},
}) {
  const indexedResources = Object.fromEntries(resources.map((resource) => [resource.id, resource]));

  const recipeLines = item.recipe.map((line) => {
    const resource = indexedResources[line.resourceId];
    const unitPrice = Number(overrides[line.resourceId] ?? resource?.marketPrice ?? 0);
    const lineCost = Number((line.consumptionRate * unitPrice * locationFactor).toFixed(2));

    return {
      ...line,
      resource,
      unitPrice,
      locationFactor,
      lineCost,
    };
  });

  const materialCost = recipeLines
    .filter((line) => line.resource?.category === "material")
    .reduce((sum, line) => sum + line.lineCost, 0);
  const laborCost = recipeLines
    .filter((line) => line.resource?.category === "labor")
    .reduce((sum, line) => sum + line.lineCost, 0);
  const equipmentCost = recipeLines
    .filter((line) => line.resource?.category === "equipment")
    .reduce((sum, line) => sum + line.lineCost, 0);

  const totalDirectCost = Number((materialCost + laborCost + equipmentCost).toFixed(2));
  const indirectLines = (item.indirectDistribution ?? []).map((line) => ({
    ...line,
    value: Number((totalDirectCost * (overheadPercent / 100) * line.ratio).toFixed(2)),
  }));
  const totalIndirectCost = Number(indirectLines.reduce((sum, line) => sum + line.value, 0).toFixed(2));
  const costBeforeProfit = Number((totalDirectCost + totalIndirectCost).toFixed(2));
  const profitValue = Number((costBeforeProfit * (profitPercent / 100)).toFixed(2));
  const finalUnitPrice = Number((costBeforeProfit + profitValue).toFixed(2));
  const projectTotal = Number((finalUnitPrice * quantity).toFixed(2));

  return {
    recipeLines,
    materialCost,
    laborCost,
    equipmentCost,
    totalDirectCost,
    indirectLines,
    totalIndirectCost,
    costBeforeProfit,
    profitValue,
    finalUnitPrice,
    projectTotal,
  };
}
