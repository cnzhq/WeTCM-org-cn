export default function formatChineseGroupedNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '';
  }

  const sign = number < 0 ? '-' : '';
  const integer = String(Math.trunc(Math.abs(number)));

  return `${sign}${integer.replace(/\B(?=(\d{4})+(?!\d))/g, ',')}`;
}
