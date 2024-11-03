export function parseISODate(
    dateString: string | null | undefined
): Date | null {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return new Date(Date.UTC(year, month - 1, day));
}
