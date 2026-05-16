import type { MeasurementKey } from "../engine/guardrails/types.js";
import type { DraftOptions, PartSlotId } from "../engine/types.js";

export type CatalogKind = "garment" | "part";

export const CATALOG_KIND_LABELS: Record<CatalogKind, string> = {
  garment: "Peças",
  part: "Partes",
};

export const CATALOG_KIND_ORDER: CatalogKind[] = ["garment", "part"];

export type ProductId =
  | "blusa"
  | "manga"
  | "camisa"
  | "saia-reta"
  | "calca"
  | "bermuda"
  | "vestido"
  | "top-sem-mangas"
  | "colete"
  | "punho"
  | "colarinho"
  | "cos"
  | "bolso-peito"
  | "carcela"
  | "malha"
  | "casaco";

export interface CompositionPresetDef {
  id: string;
  label: string;
  options: Partial<DraftOptions>;
}

export interface ProductDefinition {
  id: ProductId;
  label: string;
  kind: CatalogKind;
  implemented: boolean;
  measureKeys: MeasurementKey[];
  defaults: Record<string, number>;
  recipeId?: string;
  compositionDefaults?: Partial<DraftOptions>;
  compositionFields?: PartSlotId[];
  compositionPresets?: CompositionPresetDef[];
  defaultCompositionPresetId?: string;
}

const OFF_SLOTS: Partial<DraftOptions> = {
  includeSleeve: false,
  includeCollar: false,
  includeCuff: false,
  includePlacket: false,
  includeChestPocket: false,
  includeSidePocket: false,
  includeWaistband: false,
  sleeveless: false,
};

const BLOUSE_PRESETS: CompositionPresetDef[] = [
  { id: "custom", label: "Personalizado", options: {} },
  { id: "body-only", label: "Só corpo", options: { ...OFF_SLOTS } },
  {
    id: "with-sleeve",
    label: "Com manga",
    options: { ...OFF_SLOTS, includeSleeve: true },
  },
  {
    id: "blouse-full",
    label: "Blusa completa",
    options: {
      ...OFF_SLOTS,
      includeSleeve: true,
      includeCollar: true,
      includeCuff: true,
    },
  },
  {
    id: "tshirt",
    label: "Camiseta",
    options: {
      ...OFF_SLOTS,
      includeSleeve: true,
      sleevePreset: "short",
    },
  },
];

const SHIRT_PRESETS: CompositionPresetDef[] = [
  { id: "custom", label: "Personalizado", options: {} },
  { id: "body-only", label: "Só corpo", options: { ...OFF_SLOTS } },
  {
    id: "with-sleeve",
    label: "Com manga",
    options: { ...OFF_SLOTS, includeSleeve: true },
  },
  {
    id: "full-shirt",
    label: "Camisa completa",
    options: {
      ...OFF_SLOTS,
      includeSleeve: true,
      includeCollar: true,
      includeCuff: true,
      includePlacket: true,
      includeChestPocket: true,
    },
  },
  {
    id: "tshirt",
    label: "Camiseta",
    options: {
      ...OFF_SLOTS,
      includeSleeve: true,
      sleevePreset: "short",
    },
  },
];

const LOWER_PRESETS: CompositionPresetDef[] = [
  { id: "custom", label: "Personalizado", options: {} },
  { id: "body-only", label: "Sem cós", options: { includeWaistband: false } },
  {
    id: "with-waistband",
    label: "Com cós",
    options: { includeWaistband: true },
  },
];

const DRESS_PRESETS: CompositionPresetDef[] = [
  ...BLOUSE_PRESETS.filter((p) => p.id !== "blouse-full"),
  {
    id: "dress-full",
    label: "Vestido completo",
    options: {
      ...OFF_SLOTS,
      includeSleeve: true,
      includeCollar: true,
      includeCuff: true,
    },
  },
];

const COAT_PRESETS: CompositionPresetDef[] = [
  { id: "custom", label: "Personalizado", options: {} },
  {
    id: "coat-default",
    label: "Casaco (manga longa)",
    options: {
      includeSleeve: true,
      sleevePreset: "long",
      includeSidePocket: false,
    },
  },
];

const VEST_PRESETS: CompositionPresetDef[] = [
  { id: "custom", label: "Personalizado", options: {} },
  {
    id: "vest",
    label: "Colete",
    options: { ...OFF_SLOTS, sleeveless: true, includeSleeve: false },
  },
];

export interface CatalogGroup {
  kind: CatalogKind;
  label: string;
  products: ProductDefinition[];
}

const BODICE_FIELDS: PartSlotId[] = [
  "sleeve",
  "collar",
  "cuff",
  "placket",
  "chestPocket",
  "sidePocket",
];

const PRODUCTS: ProductDefinition[] = [
  {
    id: "blusa",
    label: "Blusa",
    kind: "garment",
    implemented: true,
    recipeId: "blusa",
    compositionFields: BODICE_FIELDS,
    compositionDefaults: {},
    compositionPresets: BLOUSE_PRESETS,
    defaultCompositionPresetId: "body-only",
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "camisa",
    label: "Camisa",
    kind: "garment",
    implemented: true,
    recipeId: "camisa",
    compositionFields: BODICE_FIELDS,
    compositionDefaults: {
      includeSleeve: true,
      includeCollar: true,
      includeCuff: true,
      includePlacket: true,
      includeChestPocket: true,
    },
    compositionPresets: SHIRT_PRESETS,
    defaultCompositionPresetId: "full-shirt",
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "saia-reta",
    label: "Saia reta",
    kind: "garment",
    implemented: true,
    recipeId: "saia-reta",
    compositionFields: ["waistband"],
    compositionDefaults: {},
    compositionPresets: LOWER_PRESETS,
    defaultCompositionPresetId: "body-only",
    measureKeys: ["waist", "hip", "hipDepth", "skirtLength"],
    defaults: { waist: 70, hip: 96, hipDepth: 20, skirtLength: 60 },
  },
  {
    id: "calca",
    label: "Calça",
    kind: "garment",
    implemented: true,
    recipeId: "calca",
    compositionFields: ["waistband"],
    compositionDefaults: {},
    compositionPresets: LOWER_PRESETS,
    defaultCompositionPresetId: "body-only",
    measureKeys: ["waist", "hip", "crotchDepth", "inseam"],
    defaults: { waist: 70, hip: 96, crotchDepth: 26, inseam: 78 },
  },
  {
    id: "bermuda",
    label: "Bermuda",
    kind: "garment",
    implemented: true,
    recipeId: "bermuda",
    compositionFields: ["waistband"],
    compositionDefaults: { legLengthCm: 45 },
    compositionPresets: LOWER_PRESETS,
    defaultCompositionPresetId: "body-only",
    measureKeys: ["waist", "hip", "crotchDepth", "inseam"],
    defaults: { waist: 70, hip: 96, crotchDepth: 26, inseam: 78 },
  },
  {
    id: "vestido",
    label: "Vestido",
    kind: "garment",
    implemented: true,
    recipeId: "vestido",
    compositionFields: [...BODICE_FIELDS, "waistband"],
    compositionDefaults: {},
    compositionPresets: DRESS_PRESETS,
    defaultCompositionPresetId: "body-only",
    measureKeys: [
      "bust",
      "bodiceLength",
      "waist",
      "hip",
      "hipDepth",
      "skirtLength",
      "wrist",
      "sleeveLength",
    ],
    defaults: {
      bust: 92,
      bodiceLength: 42,
      waist: 70,
      hip: 96,
      hipDepth: 20,
      skirtLength: 60,
      wrist: 12,
      sleeveLength: 27,
    },
  },
  {
    id: "top-sem-mangas",
    label: "Top sem mangas",
    kind: "garment",
    implemented: true,
    recipeId: "top-sem-mangas",
    compositionFields: ["chestPocket"],
    compositionDefaults: { sleeveless: true, includeSleeve: false },
    compositionPresets: VEST_PRESETS,
    defaultCompositionPresetId: "vest",
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "colete",
    label: "Colete",
    kind: "garment",
    implemented: true,
    recipeId: "colete",
    compositionFields: ["chestPocket", "placket"],
    compositionDefaults: { sleeveless: true, includeSleeve: false },
    compositionPresets: VEST_PRESETS,
    defaultCompositionPresetId: "vest",
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "malha",
    label: "Malha",
    kind: "garment",
    implemented: true,
    recipeId: "malha",
    compositionFields: BODICE_FIELDS,
    compositionDefaults: { fabricProfileId: "knit-light" },
    compositionPresets: BLOUSE_PRESETS,
    defaultCompositionPresetId: "body-only",
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "casaco",
    label: "Casaco",
    kind: "garment",
    implemented: true,
    recipeId: "casaco",
    compositionFields: ["sidePocket"],
    compositionDefaults: {
      includeSleeve: true,
      sleevePreset: "long",
    },
    compositionPresets: COAT_PRESETS,
    defaultCompositionPresetId: "coat-default",
    measureKeys: [
      "bust",
      "coatLength",
      "waist",
      "wrist",
      "sleeveLength",
      "designEaseBust",
    ],
    defaults: {
      bust: 92,
      coatLength: 65,
      waist: 81,
      wrist: 12,
      sleeveLength: 27,
      designEaseBust: 6,
    },
  },
  {
    id: "manga",
    label: "Manga",
    kind: "part",
    implemented: true,
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "punho",
    label: "Punho",
    kind: "part",
    implemented: true,
    measureKeys: ["wrist"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "colarinho",
    label: "Colarinho",
    kind: "part",
    implemented: true,
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "cos",
    label: "Cós",
    kind: "part",
    implemented: true,
    measureKeys: ["waist", "height"],
    defaults: { bust: 92, height: 4, waist: 70, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "bolso-peito",
    label: "Bolso peito",
    kind: "part",
    implemented: true,
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "carcela",
    label: "Carcela",
    kind: "part",
    implemented: true,
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
];

export function listProducts(): ProductDefinition[] {
  return PRODUCTS;
}

export function listCatalogGroups(): CatalogGroup[] {
  return CATALOG_KIND_ORDER.map((kind) => ({
    kind,
    label: CATALOG_KIND_LABELS[kind],
    products: PRODUCTS.filter((p) => p.kind === kind),
  })).filter((g) => g.products.length > 0);
}

export function getProduct(id: string): ProductDefinition | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getCompositionPreset(
  productId: string,
  presetId: string
): CompositionPresetDef | undefined {
  const product = getProduct(productId);
  return product?.compositionPresets?.find((p) => p.id === presetId);
}
