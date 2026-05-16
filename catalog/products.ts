import type { MeasurementKey } from "../engine/guardrails/types.js";

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
  | "punho"
  | "colarinho"
  | "cos"
  | "bolso-peito"
  | "carcela"
  | "malha"
  | "casaco";

export interface ProductDefinition {
  id: ProductId;
  label: string;
  kind: CatalogKind;
  implemented: boolean;
  measureKeys: MeasurementKey[];
  defaults: Record<string, number>;
}

export interface CatalogGroup {
  kind: CatalogKind;
  label: string;
  products: ProductDefinition[];
}

const PRODUCTS: ProductDefinition[] = [
  {
    id: "blusa",
    label: "Blusa",
    kind: "garment",
    implemented: true,
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "camisa",
    label: "Camisa",
    kind: "garment",
    implemented: true,
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "saia-reta",
    label: "Saia reta",
    kind: "garment",
    implemented: true,
    measureKeys: ["waist", "hip", "hipDepth", "skirtLength"],
    defaults: { waist: 70, hip: 96, hipDepth: 20, skirtLength: 60 },
  },
  {
    id: "calca",
    label: "Calça",
    kind: "garment",
    implemented: true,
    measureKeys: ["waist", "hip", "crotchDepth", "inseam"],
    defaults: { waist: 70, hip: 96, crotchDepth: 26, inseam: 78 },
  },
  {
    id: "bermuda",
    label: "Bermuda",
    kind: "garment",
    implemented: true,
    measureKeys: ["waist", "hip", "crotchDepth", "inseam"],
    defaults: { waist: 70, hip: 96, crotchDepth: 26, inseam: 78 },
  },
  {
    id: "vestido",
    label: "Vestido",
    kind: "garment",
    implemented: true,
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
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "malha",
    label: "Malha",
    kind: "garment",
    implemented: true,
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "casaco",
    label: "Casaco",
    kind: "garment",
    implemented: true,
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
