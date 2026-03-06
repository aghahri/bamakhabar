const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/**
 * تبدیل اعداد و متن حاوی رقم به اعداد فارسی (۰-۹)
 */
export function toPersianDigits(value: number | string): string {
  const str = String(value);
  return str.replace(/[0-9]/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

/**
 * فرمت عدد با جداکننده هزارگان و ارقام فارسی
 */
export function formatPersianNumber(n: number, decimals = 0): string {
  return toPersianDigits(
    n.toLocaleString('fa-IR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
}
