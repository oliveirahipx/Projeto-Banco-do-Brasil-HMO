// Arquivo: assets/js/chart-loader.js

import { BACKEND_BASE_URL } from './base.js';

// --- Seletores da Página Resumo ---
const cardTotalTestes = document.getElementById('resumo-total-testes');
const cardSucesso = document.getElementById('resumo-sucesso');
const cardFalhas = document.getElementById('resumo-falhas');
const canvas = document.getElementById('grafico');

/**
 * Mapeia os dados do DTO do backend para o formato Chart.js e renderiza.
 * @param {object} summaryData - O DTO retornado pelo Spring Boot.
 */
function renderChart(summaryData) {
    if (!canvas || typeof Chart === 'undefined') return;

    // Se já existe um gráfico, destrua-o antes de criar um novo (previne leaks)
    if (window.myChart) {
        window.myChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    const chartData = summaryData.chartData;

    // Cores para os datasets
    const chartColors = ['#0d6efd', '#ffc107', '#198754', '#dc3545', '#0dcaf0', '#6f42c1', '#20c997'];
    let colorIndex = 0;

    // Mapeia os datasets dinamicamente
    const datasets = Object.keys(chartData)
        .filter(key => key !== 'labels')
        .map((url, index) => {
            const apiPath = url.length > 20 ? url.substring(0, 20) + '...' : url;

            const color = chartColors[colorIndex % chartColors.length];
            colorIndex++; // Avança o índice de cor

            return {
                label: apiPath, // Exibe o caminho da API no label
                data: chartData[url],
                backgroundColor: color
            };
        });

    // Os labels são os dias da semana (1 a 7)
    const labels = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    const data = {
        labels: labels,
        datasets: datasets
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: false,
                    title: { display: true, text: 'Dia da Semana' }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Total de Testes Agrupados' }
                }
            }
        }
    };

    // Armazena a instância do gráfico
    window.myChart = new Chart(ctx, config);
}


document.addEventListener('DOMContentLoaded', async () => {

    console.log("Carregando dados de resumo...");

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/summary`);

        if (!response.ok) {
            console.error(`Erro ao buscar dados de resumo: Status ${response.status}`);
            if (cardTotalTestes) cardTotalTestes.querySelector('p').textContent = 'Erro de Servidor!';
            return;
        }

        const summaryData = await response.json();

        // 1. Atualizar Cards de Resumo
        if (cardTotalTestes) cardTotalTestes.querySelector('p').textContent = summaryData.totalTests;
        if (cardSucesso) cardSucesso.querySelector('p').textContent = summaryData.successfulTests;
        // O card 'Falhas' usa o número de 'failedTests' do backend
        if (cardFalhas) cardFalhas.querySelector('p').textContent = summaryData.failedTests;

        // 2. Renderizar Gráfico
        renderChart(summaryData);

    } catch (error) {
        console.error("Falha de rede ao conectar com o backend para resumo:", error);
        if (cardTotalTestes) cardTotalTestes.querySelector('p').textContent = 'Conexão Falhou!';
    }
});