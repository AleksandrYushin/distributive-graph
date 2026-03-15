//Ручное определение координат
function layoutNodesByOrderPosition(nodes, maxN) {
    const columnWidth = 100;   // ширина колонки
    const rowX = 200;      // сдвиг между узлами
    const xOffset = 50;        // отступ слева
    const yOffset = 50;        // отступ сверху
  
    // Разбиваем узлы по колонкам
    const columns = {};
    for (let i = 1; i <= maxN; i++) {
      columns[i] = [];
    }
  
    nodes.forEach(n => {
      let col = n.data.order;
      if (col > maxN) col = maxN;  // ограничение по maxN
      if (!columns[col]) columns[col] = [];
      columns[col].push(n);
    });
  
    // Вычисляем координаты
    for (let col = 1; col <= maxN; col++) {
      const colNodes = columns[col];
      const totalNodes = colNodes.length;
      colNodes.forEach((n, idx) => {
        if (col === 1) {
          n.position = {
            x: xOffset + col * col * columnWidth,
            y: yOffset
          }
        }
        else {
          const divider = col*(col-1);
          n.position = {
            x: xOffset + (divider*2) * columnWidth + (idx%divider)*rowX + (Math.floor(idx/divider)%2)*(rowX/2),
            y: yOffset + Math.floor(idx/divider) *(rowX/2)
          };
        }
      });
    }
  
    return nodes;
  }

//Версия через компоновку
function layoutNodesByOrder(nodes, maxN) {
    // Создаём колонку-контейнер для каждого столбца
    const columnContainers = [];
    for (let i = 1; i <= maxN; i++) {
      columnContainers.push({
        data: { id: `col${i}`, name: `Order = ${i}` }, // label сверху
        classes: 'column-container'
      });
    }
  
    // Назначаем parent каждому узлу
    nodes.forEach(n => {
      let col = n.data.order;
      if (col > maxN) col = maxN;
      n.data.parent = `col${col}`;
    });
  
    // Возвращаем оба массива — контейнеры и узлы
    return [...columnContainers, ...nodes];
  }
  