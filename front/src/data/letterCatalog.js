export const LETTERS = [
  { key: "ga", label: "가" },
  { key: "na", label: "나" },
  { key: "da", label: "다" },
  { key: "ra", label: "라" },
  { key: "ma", label: "마" },
  { key: "ba", label: "바" },
  { key: "sa", label: "사" },
  { key: "a", label: "아" },
  { key: "ja", label: "자" },
  { key: "cha", label: "차" },
  { key: "ka", label: "카" },
  { key: "ta", label: "타" },
  { key: "pa", label: "파" },
  { key: "ha", label: "하" }
];

export function findLetterLabel(letterKey) {
  return LETTERS.find((entry) => entry.key === letterKey)?.label ?? "한글";
}
