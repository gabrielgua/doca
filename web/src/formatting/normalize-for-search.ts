const ACCENT_MARKS_PATTERN = /[̀-ͯ]/g

export function normalizeForSearch(rawText: string): string {
  return rawText.normalize('NFD').replace(ACCENT_MARKS_PATTERN, '').toLowerCase().trim()
}
