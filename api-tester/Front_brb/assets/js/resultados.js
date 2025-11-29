// Arquivo: assets/js/resultados.js

// Importa as funções e constantes de outro módulo
import { BACKEND_BASE_URL, createTableRow } from './base.js';

// **ENVELOPAMENTO NO DOMContentLoaded**
document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores Específicos da Página ---
    const tabelaResultadosCorpo = document.getElementById('tabela-resultados-corpo');
    const cardTotalTestes = document.getElementById('card-total-testes');
    const cardSucessos = document.getElementById('card-sucessos');
    const cardFalhas = document.getElementById('card-falhas');
    const cardPendentes = document.getElementById('card-pendentes');
    const btnBaixarPdf = document.querySelector('.btn-baixar');

    // ----------------------------------------------------
    // --- LÓGICA DE HISTÓRICO E RESUMO ---
    // ----------------------------------------------------

    /**
     * Popula a tabela de resultados e os cards de resumo.
     */
    function populateResultsPage(results) {
        if (!tabelaResultadosCorpo) return;

        tabelaResultadosCorpo.innerHTML = ''; // Limpa a tabela

        let totalTestes = 0;
        let sucessos = 0;
        let falhas = 0;
        let pendentes = 0;

        results.forEach(result => {
            totalTestes++;
            createTableRow(result, tabelaResultadosCorpo, false);

            if (result.isSuccessful) {
                sucessos++;
            } else {
                falhas++;
            }
        });

        // Atualiza os Cards de Resumo
        if (cardTotalTestes) cardTotalTestes.querySelector('p').textContent = totalTestes;
        if (cardSucessos) cardSucessos.querySelector('p').textContent = sucessos;
        if (cardFalhas) cardFalhas.querySelector('p').textContent = falhas;
        if (cardPendentes) cardPendentes.querySelector('p').textContent = pendentes;
    }

    /**
     * Faz a chamada ao endpoint /api/results para obter o histórico.
     */
    async function fetchResultsAndPopulateTable() {
        if (!tabelaResultadosCorpo) return;

        console.log("Carregando histórico de testes do backend...");

        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/results`);

            if (!response.ok) {
                console.error("Erro ao buscar resultados do servidor:", response.status);
                if (cardTotalTestes) cardTotalTestes.querySelector('p').textContent = 'Erro! (Ver Console)';
                return;
            }
            const results = await response.json();
            populateResultsPage(results);

        } catch (error) {
            console.error("Falha de rede ao conectar com o backend:", error);
            if (cardTotalTestes) cardTotalTestes.querySelector('p').textContent = 'Erro de Conexão!';
        }
    }


    // ----------------------------------------------------
    // --- INICIALIZAÇÃO E EVENTOS ESPECÍFICOS ---
    // ----------------------------------------------------

    // Inicia a busca dos resultados quando o DOM estiver pronto
    fetchResultsAndPopulateTable();

    // Event Listener para o Botão "Baixar PDF"
    if (btnBaixarPdf) {
        btnBaixarPdf.addEventListener('click', () => {
            const pdfUrl = `${BACKEND_BASE_URL}/api/export/pdf`;
            window.open(pdfUrl, '_blank');
        });
    }

}); // FIM DO DOMContentLoaded