// Состояния флагов
const flags = {
    semigroupFull: false,
    semigroupNoSR: true,
    semigroupNoR: true,
    distLink: true,
    semiring: true,
    ring: false,
};


const flagButtons = document.querySelectorAll('.flag-buttons button');


async function reFlags() {
        // Сначала показываем все узлы и линии
        cy.nodes().forEach(n => n.show());
        cy.edges().forEach(e => e.show());

        if (flags.semigroupFull){
            // 1) убираем все узлы с reversibility === 0
            cy.nodes().forEach(n => {
                if (n.data('reversibility') === 0) n.hide();
            });
        }
        if (flags.semigroupNoSR){
            // 2) убираем узлы без входящих рёбер от SR
            cy.nodes().forEach(n => {
            if (n.data('reversibility') === 0){
                const incoming = n.incomers('edge[type = 1]');
                const hasIncoming = incoming.some(e => e.source().data('reversibility') > 0);
                if (!hasIncoming) n.hide();
            }
            });
        }
        if (flags.semigroupNoR){
            // 2) убираем узлы без входящих рёбер от SR
            cy.nodes().forEach(n => {
            if (n.data('reversibility') < 2){
                const incoming = n.incomers('edge[type = 1]');
                const hasIncoming = incoming.some(e => e.source().data('reversibility') > 1);
                if (!hasIncoming) n.hide();
            }
            });
        }
        if (flags.distLink){
            // 3) убираем линии от пустых точек
            cy.edges('[type = 1]').forEach(e => {
            const src = e.source();
            if (src.data('reversibility') === 0) {
                e.hide();};
            });
        }
        if (flags.semiring){
            // 3) убираем линии от моноидов
            cy.edges('[type = 1]').forEach(e => {
            const src = e.source();
            if (src.data('reversibility') === 1) 
                e.hide();
            });
        }
        if (flags.ring){
            // 3) убираем линии - кольца, но не поля
            cy.edges('[type = 1]').forEach(e => {
            const src = e.source();
            const tgt = e.target();
            if (src.data('reversibility') === 2) {
                const incoming2 = tgt.incomers('edge[type = 2]');
                const hasValidIncoming = incoming2.some(e2 => {
                    return e2.target().data('reversibility') === 2;
                });
                if (!hasValidIncoming) 
                    e.hide();
            }
            });
        }
}


flagButtons.forEach(btn => {
    btn.onclick = () => {
        const label = btn.textContent.trim();
        console.log("Выбран флаг:", label);

        switch(label) {
            case "Semigroup (full)":
                flags.semigroupFull = !flags.semigroupFull;
                break;
            case "Semigroup (no in SR)":
                flags.semigroupNoSR = !flags.semigroupNoSR;
                break;
            case "Semigroup (no in R)":
                flags.semigroupNoR = !flags.semigroupNoR;
                break;
            case "Dist. link (no SR)":
                flags.distLink = !flags.distLink;
                break;
            case "Semiring":
                flags.semiring = !flags.semiring;
                break;
            case "Ring":
                flags.ring = !flags.ring;
                break;
        }
        
        btn.classList.toggle('active');

        reFlags();
    };
});



