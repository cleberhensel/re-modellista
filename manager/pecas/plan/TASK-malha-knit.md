# TASK — Perfil tecido: Malha / knit

**Product ID:** `malha` ou flag global `fabricProfile`  
**Ficha:** [../malha-knit.md](../malha-knit.md)  
**Prioridade:** P4  
**Depende de:** [TASK-blusa.md](TASK-blusa.md), [TASK-top-sem-mangas.md](TASK-top-sem-mangas.md)

---

## Objetivo

Camada de transformação de medidas + opções de draft para tecido elástico, sem fork completo do motor.

---

## Modelo

```ts
interface FabricProfile {
  id: "woven" | "knit-light" | "knit-strong";
  stretchWidthPercent: number;
  stretchLengthPercent: number;
  suppressDarts: boolean;
}

const PROFILES: Record<string, FabricProfile> = {
  woven: { stretchWidthPercent: 0, stretchLengthPercent: 0, suppressDarts: false },
  "knit-light": { stretchWidthPercent: 0.05, stretchLengthPercent: 0.02, suppressDarts: true },
  "knit-strong": { stretchWidthPercent: 0.12, stretchLengthPercent: 0.05, suppressDarts: true },
};
```

---

## Pipeline

```ts
function applyFabricProfile(m: Measurements, profile: FabricProfile): Measurements {
  return {
    ...m,
    bust: m.bust * (1 - profile.stretchWidthPercent),
    waist: m.waist * (1 - profile.stretchWidthPercent),
    height: m.height * (1 - profile.stretchLengthPercent),
  };
}
```

### Draft

```ts
draftBlouse(applyFabricProfile(m, profile), {
  ...options,
  suppressDarts: profile.suppressDarts,
});
```

Em `blouse-front.ts`:

```ts
if (options.suppressDarts) {
  // omit dart path segments; straight side seam
}
```

---

## Front

- Select “Tecido”: Plano | Malha leve | Malha forte
- Ou produto `malha` que aplica profile knit-light por defeito

---

## Guardrails

- Malha: permitir `waist` mais próximo de `bust` (ease negativo).
- `stretchWidthPercent` não pode exceder 0.2.

---

## Testes

| # | Caso |
|---|------|
| 1 | applyFabricProfile reduces bust |
| 2 | suppressDarts → front paths sem pence |
| 3 | woven profile identical to raw |
| 4 | 100% fabricProfile.ts |

---

## Critérios de aceite

- [ ] Blusa malha sem segmentos de pence.
- [ ] Medidas efectivas menores que introduzidas.
- [ ] Não quebrar paridade woven (default profile).

---

## Fora de escopo

- Raglan knit
- % stretch por zona (bíceps vs cintura)
