package com.seumonitor.api_tester.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;
@Getter
@Setter
// DTO para a página de Resumo
public class SummaryDto {

    private final long totalTests;
    private final long successfulTests;
    private final long failedTests;
    private final Map<String, List<Long>> chartData; // Dados para o gráfico (ex: { 'labels': [...], 'data': [...] })

    public SummaryDto(long totalTests, long successfulTests, long failedTests, Map<String, List<Long>> chartData) {
        this.totalTests = totalTests;
        this.successfulTests = successfulTests;
        this.failedTests = failedTests;
        this.chartData = chartData;
    }

}