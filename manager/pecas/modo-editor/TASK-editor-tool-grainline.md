# TASK — Ferramenta Fio / grainline (V2.1)

**Prioridade:** P1  
**Onda:** 5  
**Depende de:** [TASK-editor-canvas-mount.md](TASK-editor-canvas-mount.md)  
**Bloqueia:** —

---

## Objetivo

Desenhar e editar **linha de fio** (grainline) por peça: segmento com setas nas extremidades.

---

## Modelo

```ts
type GrainlineAnnotation = {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
};
```

Ou path dedicado `role: 'grain'` com 2 nós.

---

## Interacção

| Acção | Comportamento |
|-------|----------------|
| Tool Fio | drag linha nova na peça seleccionada |
| Seleccionar extremo | mover como nó |
| Duplicar de draft | adapter já importa grain existente |

---

## Export

Setas SVG no meio e extremidades; label opcional "FIO" (PT no PDF apenas se já existir no produto).

---

## Critérios de aceite

- [ ] Uma grainline por peça (MVP); segunda substitui
- [ ] Undo move grainline
- [ ] PDF mostra grainline
