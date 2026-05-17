# TASK — Ferramenta Pique (V2.1)

**Prioridade:** P1  
**Onda:** 5  
**Depende de:** [TASK-editor-canvas-mount.md](TASK-editor-canvas-mount.md)  
**Bloqueia:** —

---

## Objetivo

Inserir **piques** (notches) em arestas do contorno ou da margem para alinhamento na costura.

---

## Modelo

```ts
type NotchAnnotation = {
  id: string;
  pathId: string;
  edgeIndex: number;
  t: number;
  side: 'in' | 'out';
  depthCm: number;
};
```

Armazenar em `EditablePiece.annotations`.

---

## Interacção

- Tool **Pique**: clique na aresta → criar notch em `t`
- Arrastar ao longo da aresta move `t`
- Delete com nó seleccionado ou tool −

Render: triângulo ou T perpendicular à aresta (estilo V1 legado se existir).

---

## Export

`to-svg` desenha notch no layer de annotations; PDF inclui.

---

## Critérios de aceite

- [ ] Múltiplos piques na mesma aresta
- [ ] Undo remove pique
- [ ] Não afecta `pathLength` do cut
