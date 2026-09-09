/**
 * Safe shared date formatter for certificates across Client & Server
 */
export function formatCertificateDate(val: unknown): string {
  if (!val) return "";
  if (typeof val === "number" && val > 20000 && val < 60000) {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = String(date.getUTCDate()).padStart(2, "0");
    const m = months[date.getUTCMonth()];
    const y = date.getUTCFullYear();
    return `${d}-${m}-${y}`;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    // Check YYYY-MM-DD or YYYY/MM/DD
    const isoMatch = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(trimmed);
    if (isoMatch) {
      const year = isoMatch[1];
      const monthIdx = parseInt(isoMatch[2], 10) - 1;
      const day = isoMatch[3].padStart(2, "0");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day}-${months[monthIdx]}-${year}`;
      }
    }
    // Check DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/.exec(trimmed);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, "0");
      const monthIdx = parseInt(dmyMatch[2], 10) - 1;
      const year = dmyMatch[3];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day}-${months[monthIdx]}-${year}`;
      }
    }
    return trimmed;
  }
  return String(val);
}
