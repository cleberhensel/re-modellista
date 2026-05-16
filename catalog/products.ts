import type { MeasurementKey } from "../engine/guardrails/types.js";

export type ProductId =
  | "blusa"
  | "manga"
  | "camisa"
  | "saia-reta"
  | "calca"
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
  implemented: boolean;
  measureKeys: MeasurementKey[];
  defaults: Record<string, number>;
}

const PRODUCTS: ProductDefinition[] = [
  {
    id: "blusa",
    label: "Blusa",
    implemented: true,
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "manga",
    label: "Manga",
    implemented: true,
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "camisa",
    label: "Camisa",
    implemented: true,
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "saia-reta",
    label: "Saia reta",
    implemented: true,
    measureKeys: ["waist", "hip", "hipDepth", "skirtLength"],
    defaults: { waist: 70, hip: 96, hipDepth: 20, skirtLength: 60 },
  },
  {
    id: "calca",
    label: "Calça",
    implemented: true,
    measureKeys: ["waist", "hip", "crotchDepth", "inseam"],
    defaults: { waist: 70, hip: 96, crotchDepth: 26, inseam: 78 },
  },
  {
    id: "vestido",
    label: "Vestido",
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
    implemented: true,
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "punho",
    label: "Punho",
    implemented: true,
    measureKeys: ["wrist"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "colarinho",
    label: "Colarinho",
    implemented: true,
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "cos",
    label: "Cós",
    implemented: true,
    measureKeys: ["waist", "height"],
    defaults: { bust: 92, height: 4, waist: 70, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "bolso-peito",
    label: "Bolso peito",
    implemented: true,
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "carcela",
    label: "Carcela",
    implemented: true,
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "malha",
    label: "Malha",
    implemented: true,
    measureKeys: ["bust", "height", "waist", "wrist", "sleeveLength"],
    defaults: { bust: 92, height: 45, waist: 81, wrist: 12, sleeveLength: 27 },
  },
  {
    id: "casaco",
    label: "Casaco",
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
];

export function listProducts(): ProductDefinition[] {
  return PRODUCTS;
}

export function getProduct(id: string): ProductDefinition | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
