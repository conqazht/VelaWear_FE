export function toAsciiUrlSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function shouldAutoUpdateSlug(currentName: string, currentSlug: string) {
  const normalizedSlug = currentSlug.trim();
  return !normalizedSlug || normalizedSlug === toAsciiUrlSlug(currentName);
}
