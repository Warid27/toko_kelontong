// utils/formatNumber.js

export const formatNumber = (num, precision = 1) => {
  if (typeof num !== "number") {
    throw new Error("Input must be a number");
  }

  // Handle zero explicitly
  if (num === 0) {
    return "0"; // Return "0" as is
  }

  const thresholds = [
    { value: 1e21, symbol: "S" }, // Sekstiliun
    { value: 1e18, symbol: "Tr" }, // Trilliun
    { value: 1e15, symbol: "B" }, // Billiun
    { value: 1e12, symbol: "T" }, // Triliun
    { value: 1e9, symbol: "M" }, // Miliar
    { value: 1e6, symbol: "Jt" }, // Juta
    { value: 1e3, symbol: "K" }, // Ribu
  ];

  for (const { value, symbol } of thresholds) {
    if (num >= value) {
      // Proper rounding to avoid floating-point inaccuracies
      const roundedValue =
        Math.round((num / value) * Math.pow(10, precision)) /
        Math.pow(10, precision);

      // Ensure values like 999999999 are displayed as "1 M" instead of "1000 Jt"
      if (roundedValue >= 1000 && symbol === "Jt") {
        return `${Math.round(roundedValue / 1000)} M`;
      }

      return `Rp.${roundedValue} ${symbol}`;
    }
  }

  // Return the number as is if it's below 1000
  return num.toString();
};
