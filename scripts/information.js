function getNodeType(nodeData) {
    let typeParts = [];

    // первая часть
    if (nodeData.commutativity === 1) typeParts.push('abelian');
    else typeParts.push('non-abelian'); // если 0
  
    // вторая часть
    if (nodeData.reversibility === 0) typeParts.push('semigroup');
    else if (nodeData.reversibility === 1) typeParts.push('monoid');
    else if (nodeData.reversibility === 2) typeParts.push('group');
  
    return typeParts.join(' ');
  }
 
function registerTooltip(cy) {
    const tooltip = document.getElementById('tooltip');

    // Когда узел схвачен мышью
    cy.on('grab', 'node', (evt) => {
      const node = evt.target;
      const data = node.data();
      let typeStr;

      console.log(node.id(), node.classes());
      if (node.hasClass('column-container'))
        typeStr = ' ';
      else
        typeStr = getNodeType(data)
      
      let tableHTML = '';
      if (data.table) {
        tableHTML += '<table border="1" style="border-collapse: collapse; font-size: 10px;">';
        data.table.forEach(row => {
          tableHTML += '<tr>';
          row.forEach(cell => tableHTML += `<td style="padding:2px;">${cell}</td>`);
          tableHTML += '</tr>';
        });
        tableHTML += '</table>';
      }
  
      tooltip.innerHTML = `
        <div style="font-size: 30px; font-weight: bold;">${data.name || 'Node'}</div>
        <div style="font-size: 15px>order = ${data.order}</div>
        <div style="font-size: 15px>${typeStr}</div>
        <div>${tableHTML}</div>
      `;
      tooltip.style.display = 'block';
    });
  
    // Когда узел отпущен
    cy.on('free', 'node', () => {
      tooltip.style.display = 'none';
    });
  }