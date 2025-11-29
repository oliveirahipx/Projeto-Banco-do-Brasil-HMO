// Arquivo: assets/js/base.js

// --- 1. Configuração do Backend ---
export const BACKEND_BASE_URL = 'http://localhost:8080';

// --- 2. Variáveis Globais (Selecione após o DOM estar pronto) ---
// Estas variáveis são selecionadas dentro de initCommonEvents, mas exportadas para referência em outros módulos.
export const dialogSair = document.querySelector(".dialog-sair");
export const btnSairNao = document.querySelector(".dialog-sair .btn-nao");
export const btnSairModal = document.querySelector(".logout-modal");

// ----------------------------------------------------
// --- FUNÇÕES AUXILIARES E CORE ---
// ----------------------------------------------------

/**
 * Converte a data do formato ISO (LocalDateTime) para o formato brasileiro.
 */
export function formatDateTime(isoDateString) {
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
 * Implementa a lógica de categorização de status (Sucesso, Falha SLA, Falha HTTP, etc.).
 */
export function createTableRow(result, tbodyElement, prepend) {
    if (!tbodyElement) return;

    // 1. Determina Status e Estilo com base no isSuccessful (True = Sucesso completo)
    const isSuccess = result.isSuccessful;
    let statusText;
    let statusClass;
    let errorText = result.message;
    let durationText = `${result.responseTimeMillis}ms`;

    if (isSuccess) {
        // Se isSuccessful é TRUE, teste passou em TUDO (incluindo SLA).
        statusText = 'Sucesso';
        statusClass = 'status-success'; // VERDE
    } else {
        // Se isSuccessful é FALSE, SEMPRE é uma falha na contagem e exibição.
        statusClass = 'status-failure'; // VERMELHO

        if (result.statusCode === 0) {
            statusText = 'Conexão Falhou';
        } else if (result.statusCode >= 200 && result.statusCode < 300) {
            // Status 2xx + Falha na contagem = Falha SLA
            statusText = `Falha SLA (${result.statusCode})`;
        } else {
            // Falha por Status Code (4xx ou 5xx)
            statusText = `Falha HTTP (${result.statusCode})`;
        }
    }

    // Formata Data/URL
    const formattedDate = formatDateTime(result.testDateTime);
    const apiPath = result.url ? result.url.substring(result.url.indexOf('//') + 2) : 'URL Desconhecida';

    // CÓDIGO HTML DA LINHA DA TABELA
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
// --- FUNÇÃO DE INICIALIZAÇÃO DE EVENTOS COMUNS (Sidebar, Modal Sair) ---
// ----------------------------------------------------

export function initCommonEvents() {
    // Inicialização da funcionalidade da Sidebar (Links Ativos)
    const sidebar = document.querySelector('.sidebar');
    const sidebarLinks = sidebar ? sidebar.querySelectorAll('a') : [];
    const currentPath = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const linkPath = href.split('/').pop().toLowerCase();

        if (linkPath === currentPath) {
            link.classList.add('active');
        }

        link.addEventListener('click', () => {
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Modal Sair
    const localDialogSair = document.querySelector(".dialog-sair");
    const localBtnSairNao = document.querySelector(".dialog-sair .btn-nao");
    const localBtnSairModal = document.querySelector(".logout-modal");

    if (localBtnSairModal && localDialogSair && localBtnSairNao) {
        localBtnSairModal.onclick = () => localDialogSair.showModal();
        localBtnSairNao.onclick = () => localDialogSair.close();
    }
}

// CRÍTICO: Executa a inicialização de eventos comuns assim que o DOM está pronto.
// Isso garante que os eventos de sidebar e modal 'Sair' funcionem em todas as páginas.
document.addEventListener('DOMContentLoaded', initCommonEvents);