export { getLevelLabel } from "@/lib/labels";

export function formatMaterialLabel(
  groupOrder: number,
  materialOrder: number
): string {
  return `${groupOrder}.${materialOrder}`;
}
