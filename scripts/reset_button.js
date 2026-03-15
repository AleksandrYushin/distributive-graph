let cy = null;

async function loadGraph() {
  const response = await fetch('./scripts/data.json');
  if (!response.ok) {
    console.warn("data.json не найден, пробуем соседний файл");
    // Пробуем альтернативный файл
    response = await fetch('./data/data4.json');
  }

  const data = await response.json();

  const elements = [];

  /* Узлы */
  data.nodes.forEach(n => {
    elements.push({
      data: {
        id: String(n.id),
        name: n.name || n.id,
        order: n.order,
        commutativity: n.commutativity,
        reversibility: n.reversibility,
        table: n.table
      }
    });
  });

  /* Рёбра типа 1 */
  data.edges_type_1.forEach(e => {
    elements.push({
      data: {
        id: 'e1_' + e.id,
        source: String(e.nodes[0]),
        target: String(e.nodes[1]),
        name: e.name || '',
        repetition: e.repetition,
        type: 1
      }
    });
  });

  /* Рёбра типа 2 */
  data.edges_type_2.forEach(e => {
    elements.push({
      data: {
        id: 'e2_' + e.id,
        source: String(e.nodes[0]),
        target: String(e.nodes[1]),
        type: 2
      }
    });
  });

  return elements;
}

//Ручная версия
// async function createGraph(maxN) {
//   const elements = await loadGraph();

//    // layout вручную
//    const nodes = elements.filter(e => e.data && e.data.id);
//    layoutNodesByOrder(nodes, maxN);
  
//   if (cy) {
//     cy.destroy();
//   }

//   cy = cytoscape({
//     container: document.getElementById('graph-container'),
//     elements: elements,
//     style: cyStyles,
//     // layout: {
//     //   name: 'cose',
//     //   animate: 0
//     // }
//   });
// }

//Версия через компоновку
async function createGraph(maxN) {
  const elementsFromJson = await loadGraph();

  // Отделяем узлы и рёбра
  const nodes = elementsFromJson.filter(e => e.data && e.data.id).filter(n => n.data.order <= maxN);
  const edgesAll = elementsFromJson.filter(e => e.data && e.data.source);

  // 2. множество допустимых id
  const allowedIds = new Set(nodes.map(n => n.data.id));
  const edges = edgesAll.filter(e =>
    allowedIds.has(e.data.source) &&
    allowedIds.has(e.data.target)
  );

  // layout + compound nodes
  const elements = layoutNodesByOrderPosition(layoutNodesByOrder(nodes, maxN), maxN);

  // Добавляем edges
  elements.push(...edges);

  // Если граф уже есть — уничтожаем
  if (cy) cy.destroy();

  cy = cytoscape({
    container: document.getElementById('graph-container'),
    elements: elements,
    style: cyStyles,
    layout: {
      name: 'preset',   // или 'preset', если хочешь фиксированные позиции
      // animate: 0,
      // padding: 10,
      // nodeRepulsion: 200000000,
      // idealEdgeLength: 1
    }
  });

  registerTooltip(cy);

  reFlags();
}


/* Привязка к кнопке Reset */
document.getElementById('reset-button').onclick = () => {
  console.log('Кнопка Reset нажата');
  const maxN = parseInt(document.querySelector('input[type="number"]').value, 10);
  createGraph(maxN);
};

/* Первый запуск */
const maxN = parseInt(document.querySelector('input[type="number"]').value, 10);
createGraph(maxN);

