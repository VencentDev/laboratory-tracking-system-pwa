export function getCategoryOptions(tools: Array<{ category: string | null }> | undefined) {
  return Array.from(
    new Set(
      (tools ?? [])
        .map((tool) => tool.category?.trim())
        .filter((category): category is string => Boolean(category)),
    ),
  ).sort((left, right) => left.localeCompare(right));
}
