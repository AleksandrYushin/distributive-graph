function contractionDashedChains() {
  if (!cy) return;

  const dashedEdges = cy.edges('[type = 2]');
  const visited = new Set();

  // вспомогательная функция: соседи по пунктирным рёбрам
  function dashedNeighbors(node) {
    return node.connectedEdges('[type = 2]').connectedNodes();
  }

  cy.nodes().forEach(startNode => {
    const startId = startNode.id();
    if (visited.has(startId)) return;

    // BFS/DFS для одной компоненты
    const stack = [startNode];
    const component = [];

    while (stack.length > 0) {
      const node = stack.pop();
      const id = node.id();

      if (visited.has(id)) continue;

      visited.add(id);
      component.push(node);

      dashedNeighbors(node).forEach(n => {
        if (!visited.has(n.id())) stack.push(n);
      });
    }

    // если компонентa из одного узла — пропускаем
    if (component.length <= 1) return;

    // ищем минимальный order
    let minNode = component[0];
    component.forEach(n => {
      if (n.data('order') < minNode.data('order')) {
        minNode = n;
      }
    });

    const targetPos = {
      x: minNode.position('x'),
      y: minNode.position('y')
    };

    // перемещаем все узлы компоненты
    component.forEach(n => n.position(targetPos));
  });
}


  
/* Привязка к кнопке*/
document.getElementById('contraction-button').onclick = () => {
    console.log('Кнопка нажата');
    contractionDashedChains();
  };