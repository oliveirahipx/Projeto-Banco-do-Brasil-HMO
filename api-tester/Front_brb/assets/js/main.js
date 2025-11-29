// Arquivo: assets/js/main.js

// --- 1. Configuração do Backend ---
// **VERIFIQUE A PORTA DO SEU SPRING BOOT AQUI**
const BACKEND_BASE_URL = 'http://localhost:8080';
// *******************************************************************

document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores de Elementos Globais ---
    const sidebar = document.querySelector('.sidebar');
    const dialogSair = document.querySelector(".dialog-sair");
    const btnSairNao = document.querySelector(".dialog-sair .btn-nao");
    const btnSairModal = document.querySelector(".logout-modal");

    // Elementos do Modal de Adicionar API (api.html)
    const btnAdicionar = document.querySelector('.btn-adicionar');
    const dialogAdicionar = document.getElementById('dialog-adicionar-api');
    const btnCancelarAdd = document.querySelector('.btn-cancelar-add');
    const btnExecutarTeste = document.getElementById('btn-cadastrar-teste');
    const inputApiUrl = document.getElementById('input-api-url');

    // Elementos de Resultados e Tabela (api.html)
    const tabelaTestesCorpoApi = document.getElementById('tabela-testes-corpo');
    const totalApisElement = document.getElementById('total-apis');

    // Elementos da página Resultados (resultados.html)
    const tabelaResultadosCorpo = document.querySelector('#tabela-resultados-corpo');
    const cardTotalTestes = document.querySelector('#card-total-testes');
    const cardSucessos = document.querySelector('#card-sucessos');
    const cardFalhas = document.querySelector('#card-falhas');
    const cardPendentes = document.querySelector('#card-pendentes');
    const btnBaixarPdf = document.querySelector('.btn-baixar'); // Botão Baixar PDF

    // Pega o caminho atual da URL
    const currentPath = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();


    // ----------------------------------------------------
    // --- FUNÇÕES AUXILIARES E CORE ---
    // ----------------------------------------------------

    /**
     * Converte a data do formato ISO para o formato brasileiro.
     */
    function formatDateTime(isoDateString) {
        if (!isoDateString) return 'Data Indisponível';
        try {
            const adjustedDateString = isoDateString.endsWith('Z') || isoDateString.endsWith('+00:00') ? isoDateString : `${isoDateString}Z`;
            const date = new Date(adjustedDateString);

            const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

            const formattedDate = date.toLocaleDateString('pt-BR', dateOptions);
            const formattedTime = date.toLocaleTimeString('pt-BR', timeOptions);

            return `${formattedDate} ${formattedTime}`;
        } catch (e) {
            return isoDateString;
        }
    }

    /**
     * Gera uma linha de tabela baseada no resultado do teste.
     * Esta função é usada tanto na api.html quanto na resultados.html
     */
    function createTableRow(result, tbodyElement, prepend) {
        if (!tbodyElement) return;

        // 1. Determina Status e Estilo com base no isSuccessful do backend
        const isSuccess = result.isSuccessful;

        let statusText = isSuccess ? 'Sucesso' : (result.statusCode === 0 ? 'Conexão Falhou' : 'Falha');
        if (!isSuccess && result.statusCode >= 200 && result.statusCode < 300) {
            statusText = 'Falha SLA'; // Status 2xx mas falha em Latência ou Content-Type
        }

        let statusClass = isSuccess ? 'status-success' : 'status-failure';

        let errorText = result.message;
        let durationText = `${result.responseTimeMillis}ms`;

        // Formata Data/URL
        const formattedDate = formatDateTime(result.testDateTime);
        const apiPath = result.url ? result.url.substring(result.url.indexOf('//') + 2) : 'URL Desconhecida';

        // CÓDIGO CORRIGIDO
        const newRow = `
            <tr>
                <td>${apiPath}</td>
                <td>${formattedDate}</td>
                <td class="${statusClass}">${statusText}</td>
                <td>${durationText}</td>
                <td>${errorText.length > 50 ? errorText.substring(0, 50) + '...' : errorText}</td>
                <td><button class="btn-acao">Ver</button></td>
            </tr>
        `;

        if (prepend) {
            tbodyElement.insertAdjacentHTML('afterbegin', newRow);
        } else {
            tbodyElement.insertAdjacentHTML('beforeend', newRow);
        }
    }

    // ----------------------------------------------------
    // --- LÓGICA DE TESTE E EXIBIÇÃO (PÁGINA API.HTML) ---
    // ----------------------------------------------------

    /**
     * Adiciona uma nova linha à tabela de testes na página 'api.html' após um novo teste.
     */
    function appendTestResultToTableApi(result, apiUrl) {
        if (currentPath === 'api.html' && tabelaTestesCorpoApi) {
            createTableRow(result, tabelaTestesCorpoApi, true);
        }

        if (totalApisElement && currentPath === 'api.html') {
            const currentCount = parseInt(totalApisElement.textContent.trim() || '0');
            totalApisElement.textContent = currentCount + 1;
        }
    }


    /**
     * LOGICA FALTANDO: Envia a requisição GET para o endpoint do Spring Boot.
     */
    async function executeApiTest(apiUrl) {

        let startTime = Date.now();

        const fullUrl = `${BACKEND_BASE_URL}/api/test?url=${encodeURIComponent(apiUrl)}`;
        console.log(`Chamando Spring Boot: ${fullUrl}`);

        try {
            const response = await fetch(fullUrl, { method: 'GET' });

            if (!response.ok) {
                throw new Error(`Erro de comunicação com o servidor de teste (Status: ${response.status})`);
            }

            const result = await response.json();

            if (!result.responseTimeMillis || result.responseTimeMillis === 0) {
                result.responseTimeMillis = Date.now() - startTime;
            }

            appendTestResultToTableApi(result, apiUrl);

        } catch (error) {
            console.error("Falha na comunicação com o backend Spring Boot:", error);

            const manualResult = {
                url: apiUrl,
                isSuccessful: false,
                statusCode: 0,
                message: error.message,
                responseTimeMillis: Date.now() - startTime,
                testDateTime: new Date().toISOString(),
            };

            appendTestResultToTableApi(manualResult, apiUrl);
        }
    }


    // ----------------------------------------------------
    // --- LÓGICA DE HISTÓRICO (PÁGINA RESULTADOS.HTML) ---
    // ----------------------------------------------------

    /**
     * Popula a tabela de resultados e os cards de resumo.
     */
    function populateResultsPage(results) {
        if (!tabelaResultadosCorpo) return;

        tabelaResultadosCorpo.innerHTML = ''; // Limpa a tabela existente

        let totalTestes = 0;
        let sucessos = 0;
        let falhas = 0;
        let pendentes = 0; // Mantido como 0 no backend atual

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
        if (currentPath !== 'resultados.html' || !tabelaResultadosCorpo) return;

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
    // --- LÓGICA DE EVENTOS E DOWNLOAD ---
    // ----------------------------------------------------

    // Executa a busca de resultados ao carregar a página de Resultados
    if (currentPath === 'resultados.html') {
        fetchResultsAndPopulateTable();
    }

    // --- Event Listener para o Botão "Executar Teste" (api.html) ---
    if (btnExecutarTeste) {
        btnExecutarTeste.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!inputApiUrl || !inputApiUrl.value.trim()) {
                alert('Por favor, insira a URL da API a ser testada.');
                return;
            }

            const urlParaTestar = inputApiUrl.value.trim();

            dialogAdicionar.close();
            executeApiTest(urlParaTestar);
        });
    }

    // --- Event Listener para o Botão "Baixar PDF" (resultados.html) ---
    if (currentPath === 'resultados.html' && btnBaixarPdf) {
        btnBaixarPdf.addEventListener('click', () => {
            const pdfUrl = `${BACKEND_BASE_URL}/api/export/pdf`;

            // Inicia o download diretamente
            window.open(pdfUrl, '_blank');
        });
    }


    // --- LÓGICA DE INICIALIZAÇÃO E GRÁFICOS ---

    // Sidebar e Modal Sair
    const sidebarLinks = sidebar ? sidebar.querySelectorAll('a') : [];
    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const linkPath = href.split('/').pop().toLowerCase();
        if (linkPath === currentPath) link.classList.add('active');
        link.addEventListener('click', () => {
            sidebarLinks.forEach(l => l.classList.remove('active'));
            l.classList.add('active');
        });
    });

    if (btnSairModal && dialogSair && btnSairNao) {
        btnSairModal.onclick = () => dialogSair.showModal();
        btnSairNao.onclick = () => dialogSair.close();
    }

    // Lógica de Abertura do Modal Adicionar API
    if(btnAdicionar && dialogAdicionar && btnCancelarAdd){
        btnAdicionar.addEventListener('click', () => {
            if(inputApiUrl) inputApiUrl.value = 'https://httpbin.org/status/200';
            dialogAdicionar.showModal();
        });
        btnCancelarAdd.addEventListener('click', () => dialogAdicionar.close());
    }

    // Lógica de Gráfico (mantida)
    const canvas = document.getElementById('grafico');
    if(canvas && typeof Chart !== 'undefined'){
        const ctx = canvas.getContext('2d');
        const data = {
            labels: ['Segunda', 'Terça', 'Quarta'],
            datasets: [
                { label: 'API 1', data: [12, 8, 15], backgroundColor: 'rgba(54, 162, 235, 0.7)' },
                { label: 'API 2', data: [7, 14, 10], backgroundColor: 'rgba(240, 242, 28, 0.85)' }
            ]
        };

        const config = {
            type: 'bar',
            data: data,
            options: { responsive: true, scales: { x: { stacked: false }, y: { beginAtZero: true } } }
        };

        new Chart(ctx, config);
    }
});