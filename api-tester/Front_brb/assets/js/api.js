// Arquivo: assets/js/api.js

import { BACKEND_BASE_URL, createTableRow } from './base.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores Específicos da Página ---
    const btnAdicionar = document.querySelector('.btn-adicionar');
    const dialogAdicionar = document.getElementById('dialog-adicionar-api');
    const btnCancelarAdd = document.querySelector('.btn-cancelar-add');
    const btnExecutarTeste = document.getElementById('btn-cadastrar-teste');
    const inputApiUrls = document.getElementById('input-api-urls'); // Alterado para TEXTAREA

    const tabelaTestesCorpoApi = document.getElementById('tabela-testes-corpo');
    const totalApisElement = document.getElementById('total-apis');

    // ----------------------------------------------------
    // --- LÓGICA DE TESTE E EXIBIÇÃO (MÚLTIPLOS) ---
    // ----------------------------------------------------

    /**
     * Adiciona uma linha à tabela de testes e atualiza o contador.
     */
    function appendTestResultToTableApi(result, isBatch) {
        if (tabelaTestesCorpoApi) {
            createTableRow(result, tabelaTestesCorpoApi, true); // Adiciona no início
        }

        if (totalApisElement) {
            const currentCount = parseInt(totalApisElement.textContent.trim() || '0');
            // Aumenta o contador (se for lote, esta lógica será executada N vezes)
            totalApisElement.textContent = currentCount + 1;
        }
    }


    /**
     * Envia as requisições para o endpoint de teste em lote do Spring Boot (POST).
     * @param {Array<string>} urls Array de URLs a serem testadas.
     */
    async function executeMultipleApiTests(urls) {

        const fullUrl = `${BACKEND_BASE_URL}/api/test/multiple`;
        console.log(`Chamando endpoint em lote com ${urls.length} URLs: ${fullUrl}`);

        try {
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Envia a lista de URLs conforme o MultiTestRequest DTO
                body: JSON.stringify({ apiUrls: urls })
            });

            if (response.status === 204) {
                alert("Nenhuma URL válida foi enviada.");
                return;
            }

            if (!response.ok) {
                console.error("Erro no servidor ao executar lote:", response.status);
                alert(`Erro no servidor de testes (Status: ${response.status}).`);
                return;
            }

            // O backend retorna uma lista de ApiTestResult
            const results = await response.json();

            // Adiciona cada resultado à tabela
            results.forEach(result => {
                appendTestResultToTableApi(result, true);
            });

            alert(`Lote de ${results.length} testes concluído com sucesso!`);


        } catch (error) {
            console.error("Falha de rede ao comunicar com o backend:", error);
            alert("Erro de conexão ao executar lote. Verifique o servidor Spring Boot.");
        }
    }


    // ----------------------------------------------------
    // --- INICIALIZAÇÃO DE EVENTOS ESPECÍFICOS ---
    // ----------------------------------------------------

    // Lógica de Abertura do Modal Adicionar API
    if(btnAdicionar && dialogAdicionar && btnCancelarAdd){
        btnAdicionar.addEventListener('click', () => {
            // Preenche com URLs de exemplo ao abrir
            if(inputApiUrls) inputApiUrls.value = "https://httpbin.org/status/200\nhttps://google.com";
            dialogAdicionar.showModal();
        });
        btnCancelarAdd.addEventListener('click', () => dialogAdicionar.close());
    }

    // Event Listener para o Botão "Executar Testes (Lote)"
    if (btnExecutarTeste) {
        btnExecutarTeste.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!inputApiUrls || !inputApiUrls.value.trim()) {
                alert('Por favor, insira pelo menos uma URL.');
                return;
            }

            // Quebra o texto por quebras de linha, filtra linhas vazias e remove espaços
            const urlsParaTestar = inputApiUrls.value
                .split('\n')
                .map(url => url.trim())
                .filter(url => url.length > 0);

            if (urlsParaTestar.length === 0) {
                alert('Nenhuma URL válida foi inserida.');
                return;
            }

            dialogAdicionar.close();
            executeMultipleApiTests(urlsParaTestar);
        });
    }

   
});