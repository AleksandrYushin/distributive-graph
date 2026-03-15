function createLegendGraph() {
    const elements = [];

    // Узлы всех 6 типов: commutativity = 0/1, reversibility = 0/1/2
    let id = 1;
    for (let comm = 0; comm <= 1; comm++) {
        for (let rev = 0; rev <= 2; rev++) {
            elements.push({
                data: { id: 'n' + id, name: getNodeType({commutativity: comm, reversibility: rev }), commutativity: comm, reversibility: rev },
                position: { x: 50 + rev * 50, y: 50 + comm*50 }
            });
            id++;
        }
    }

    // Пример рёбер: type 1 и type 2
    elements.push({ data: { id: 'e1', name: 'Distributive', source: 'n1', target: 'n4', type: 1 } });
    elements.push({ data: { id: 'e2', name: 'Zero expansion', source: 'n3', target: 'n6', type: 2 } });

    cytoscape({
        container: document.getElementById('legend-graph'),
        elements: elements,
        style: cyStyles, // используем те же стили, что и основной граф
        layout: { name: 'preset' } // позиции мы задали вручную
    });
}

// Запускаем после загрузки страницы
createLegendGraph();