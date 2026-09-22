export const Diagram = {

    //==================================================
    // DIMENSÕES GERAIS DO DIAGRAMA
    //==================================================

    width: 10000,
    height: 5900,

    //==================================================
    // CONFIGURAÇÃO DA GRADE
    //==================================================

    grid: {

        enabled: false,

        size: 100,

        color: "#b7c3cc",

        opacity: 0.18,

        strokeWidth: 0.6
    },

    //==================================================
    // ESPESSURAS PADRONIZADAS
    //==================================================

    strokes: {

        // Linhas verticais e ramais principais
        mainWire: 1.55,

        // Linhas superiores de transferência
        transferWire: 1.45,

        // Barramentos principais
        bus: 2.10,

        // Geradores, transformadores, RE e facas
        equipment: 1.80,

        // Contornos dos painéis
        panel: 1.35
    },

    //==================================================
// CONFIGURAÇÃO DE NAVEGAÇÃO
//==================================================

navigation: {

    /*
     * Menor escala permitida.
     * Valor menor permite maior afastamento.
     */
    minZoom: 0.90,

    /*
     * Maior escala permitida.
     * Valor maior permite maior aproximação.
     */
    maxZoom: 5,

    /*
     * Margem aplicada pelo botão AJUSTAR
     * e pelo duplo clique no diagrama.
     */
    fitPadding: 35,

    /*
     * Reserva visual para o painel lateral esquerdo.
     */
    leftSafeRatio: 0.001
},

    //==================================================
    // ÁREAS DO DIAGRAMA
    // Utilizadas pelo Navigation.focusArea()
    //==================================================

    areas: {

        //==================================================
        // ÁREA SUPERIOR
        // UGs, fontes externas, QDs, REs, TR-SAs e DJs
        //==================================================

        upperArea: {

            x: 350,
            y: 100,

            width: 9300,
            height: 2200
        },

        //==================================================
        // BARRAMENTOS PRINCIPAIS
        // 1QP e 3QP
        //==================================================

        mainPanelsArea: {

            x: 400,
            y: 2250,

            width: 9300,
            height: 850
        },

        //==================================================
        // QUADROS pCA P/R
        // P14 até P1720
        //==================================================

        pcaPanelsArea: {

            x: 500,
            y: 3100,

            width: 9300,
            height: 1450
        },

        //==================================================
        // PAINÉIS AUXILIARES
        // SE do HM, 5qA, 7qS, CMCS, qA e 8qV
        //==================================================

        auxPanelsArea: {

            /*
             * A área começa antes do eixo zero porque
             * as saídas E1 a E5 avançam para a esquerda.
             */
            x: -150,
            y: 3050,

            width: 9700,
            height: 2550
        },

        //==================================================
        // ÁREA INFERIOR COMPLETA
        // pCA + painéis auxiliares
        //==================================================

        lowerPanelsArea: {

            x: -150,
            y: 3050,

            width: 9850,
            height: 2600
        },

        //==================================================
        // DIAGRAMA ELÉTRICO PRINCIPAL
        // UTILIZADO PELO BOTÃO AJUSTAR
        //==================================================

        mainDiagramArea: {

            /*
             * Área ajustada após a remoção do rodapé
             * técnico interno do SVG.
             */
            x: -150,
            y: 300,

            width: 9850,
            height: 5350
        }
    }
};