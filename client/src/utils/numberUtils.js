// src/utils/numberUtils.js
export const safeNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const safeToFixed = (v, digits = 2) => {
  return safeNum(v).toFixed(digits);
};
