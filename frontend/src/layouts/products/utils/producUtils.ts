const CADUCIDAD_CATEGORY_KEYWORDS = ["alimentos", "belleza"];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function requiresCaducidadByCategoryName(categoryName: string): boolean {
  const normalized = normalizeText(categoryName);
  return CADUCIDAD_CATEGORY_KEYWORDS.some((keyword) =>
    normalized.includes(keyword),
  );
}


export { requiresCaducidadByCategoryName };