export function combineName(
  firstName?: string | null,
  lastName?: string | null,
  fallbackName?: string | null,
) {
  const first = firstName?.trim() ?? "";
  const last = lastName?.trim() ?? "";
  const fullName = [first, last].filter(Boolean).join(" ");
  return fullName || fallbackName?.trim() || "";
}

export function normalizeNameParts(firstName: string, lastName?: string | null) {
  const first = firstName.trim();
  const last = lastName?.trim() ?? "";

  return {
    firstName: first,
    lastName: last || null,
    fullName: [first, last].filter(Boolean).join(" "),
  };
}
