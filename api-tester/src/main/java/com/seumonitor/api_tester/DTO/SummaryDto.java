package com.seumonitor.api_tester.DTO;

import lombok.Getter;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor // Gera o construtor que inicializa todos os campos 'final'

public class SummaryDto {

    private final long totalTests;
    private final long successfulTests;
    private final long failedTests;
    private final Map<String, List<Long>> chartData; // Dados para o gráfico
    
}