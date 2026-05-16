import type { DraftOptions, PartSlotId } from "../types.js";

export type { PartSlotId };

export interface PartSlotRule {
  slot: PartSlotId;
  defaultOn: boolean;
  allowed: boolean;
  required?: boolean;
  dependsOn?: PartSlotId[];
}

export interface GarmentRecipe {
  productId: string;
  slots: PartSlotRule[];
  defaultOptions: Partial<DraftOptions>;
  lockedSlots?: Partial<Record<PartSlotId, boolean>>;
}
