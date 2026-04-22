export type ExerciseNamingType = "alpha" | "manual" | "numeric" | "roman";

export function toRomanNumeral(num: number): string {
  if (num <= 0 || num > 3999) {
    return num.toString();
  }

  const romanNumerals = [
    { value: 1000, numeral: "M" },
    { value: 900, numeral: "CM" },
    { value: 500, numeral: "D" },
    { value: 400, numeral: "CD" },
    { value: 100, numeral: "C" },
    { value: 90, numeral: "XC" },
    { value: 50, numeral: "L" },
    { value: 40, numeral: "XL" },
    { value: 10, numeral: "X" },
    { value: 9, numeral: "IX" },
    { value: 5, numeral: "V" },
    { value: 4, numeral: "IV" },
    { value: 1, numeral: "I" },
  ];

  let result = "";
  let remaining = num;

  for (const { value, numeral } of romanNumerals) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }

  return result;
}

export function buildExerciseNames(
  count: number,
  namingType: ExerciseNamingType,
  prefix: string,
  startNumber = 1,
) {
  const safePrefix = prefix.trim() || "Exercise";
  const firstNumber = Math.max(1, Math.floor(startNumber));

  return Array.from({ length: Math.max(count, 0) }, (_, index) => {
    const order = firstNumber + index;

    if (namingType === "alpha") {
      return `${safePrefix} ${String.fromCharCode(64 + order)}`;
    }

    if (namingType === "roman") {
      return `${safePrefix} ${toRomanNumeral(order)}`;
    }

    return `${safePrefix} ${order}`;
  });
}
