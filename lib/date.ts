const NullDate = "--/--/----";
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseCalendarDate = (value: string | null) => {
  if (!value) return null;

  const match = DATE_RE.exec(value);
  if (!match) return null;

  const [year, month, day] = match.slice(1).map(Number) as [number, number, number];
  return { year, month, day };
};

//format: MM/DD/YYYY
const DateFormater = Intl.DateTimeFormat("en-US");

export function formatDate(date: Date | string): string{
    if (typeof date == "string"){
        const parsed = parseCalendarDate(date);
        if (!parsed)
            return NullDate;
        return `${parsed.month}/${parsed.day}/${parsed.year}`;
    }
    else
        return DateFormater.format(date);
}