const cyStyles = [
  /* ===== Узлы ===== */
  {
    selector: 'node',
    style: {
      'label': 'data(name)',
      'text-valign': 'top',
      'text-halign': 'center',
      'font-size': 5,
      'color': '#000',
      'border-width': 2,
      'border-color': '#000',
      'background-color': '#ffffff',
      'width': 10,
      'height': 10,
      'z-index': node => 100 - node.data('order')
    }
  },

  /* commutativity = 0 → triangle */
  {
    selector: 'node[commutativity = 0]',
    style: {
      'shape': 'triangle'
    }
  },

  /* commutativity = 1 → circle */
  {
    selector: 'node[commutativity = 1]',
    style: {
      'shape': 'ellipse'
    }
  },

  /* reversibility = 0 → не закрашен */
  {
    selector: 'node[reversibility = 0]',
    style: {
      'background-color': '#ffffff',
    }
  },

  /* reversibility = 1 → вертикальная черта */
  {
    selector: 'node[reversibility = 1]',
    style: {
      'background-color': '#ffffff',
      'background-image': './data/line.png',
      'background-fit': 'cover',              // растянуть на весь узел
      'background-clip': 'node',              // обрезка по форме узла
    }
  },

  /* reversibility = 2 → полностью закрашен */
  {
    selector: 'node[reversibility = 2]',
    style: {
      'background-opacity': 1,
      'background-color': '#000000'
    }
  },

  /* ===== Рёбра ===== */

  /* Тип 1 — направленное */
  {
    selector: 'edge[type = 1]',
    style: {
      'text-valign': 'top',
      'text-halign': 'center',
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
      'target-arrow-color': '#000',
      'line-color': '#000',
      'width': 2,
      'label': 'data(repetition)',
      'font-size': 8
    }
  },

  /* Тип 2 — пунктир */
  {
    selector: 'edge[type = 2]',
    style: {
      'line-style': 'dashed',
      'line-dash-pattern': [6, 4],
      'line-color': '#444',
      'width': 2
    }
  },

  /*Контейнеры по order*/
  {
    selector: 'node.column-container',
    style: {
      'shape': 'roundrectangle',
      'background-color': '#000',
      'background-opacity': 0.05,       // прозрачный фон
      'border-color': '#999',        // бледно-серый контур → граница колонки
      'border-width': 1,
      'label': 'data(name)',         // подпись сверху
      'text-valign': 'top',
      'text-halign': 'center',
      'font-size': 50,
      'color': '#555',
      'padding': '10px'
    }
  }
];

