package com.seumonitor.api_tester.Service;

import com.seumonitor.api_tester.Model.ApiTestResult;
import com.seumonitor.api_tester.Repository.ApiTestResultRepository;
import com.seumonitor.api_tester.DTO.SummaryDto;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.LongStream;
import java.util.Collections;
import java.util.ArrayList;
import java.util.HashMap;


@Service
public class ApiTestService {

    // --- Configurações de SLA ---
    private static final long MAX_LATENCY_MS = 50000;
    private static final String EXPECTED_CONTENT_TYPE = "application/json";

    private final RestTemplate restTemplate;
    private final ApiTestResultRepository repository;

    public ApiTestService(ApiTestResultRepository repository) {
        this.restTemplate = new RestTemplate();
        this.repository = repository;
    }

    // ----------------------------------------------------
    // --- LÓGICA DE EXECUÇÃO DE TESTE ---
    // ----------------------------------------------------

    public ApiTestResult runTest(String apiUrl) {

        long startTime = System.currentTimeMillis();
        ApiTestResult result;

        try {
            // Executa a requisição GET e obtém todos os metadados
            ResponseEntity<String> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.GET,
                    null,
                    String.class
            );

            long endTime = System.currentTimeMillis();
            long latency = endTime - startTime;

            // Variáveis para rastrear o status de SLA
            boolean isStatusCodeSuccessful = response.getStatusCode().is2xxSuccessful();
            boolean latencyCheck = false;
            boolean contentCheck = false;
            String messageDetails = "";

            if (isStatusCodeSuccessful) {
                // 1. VALIDAÇÃO DE SLA: Latência
                latencyCheck = latency <= MAX_LATENCY_MS;
                if (!latencyCheck) {
                    messageDetails += " (Latência acima de " + MAX_LATENCY_MS + "ms: " + latency + "ms)";
                }

                // 2. VALIDAÇÃO DE SLA: Content Type
                contentCheck = isContentTypeValid(response.getHeaders());
                if (!contentCheck) {
                    messageDetails += " (Falha SLA: Content-Type esperado '" + EXPECTED_CONTENT_TYPE + "' inválido/ausente)";
                }
            }

            // A condição de sucesso final depende do Status OK E SLA OK
            boolean isOverallSuccessful = isStatusCodeSuccessful && latencyCheck && contentCheck;

            if (isOverallSuccessful) {
                messageDetails = "Teste completo: Sucesso.";
            } else if (isStatusCodeSuccessful) {
                messageDetails = "Status 2xx OK, mas Falha no SLA." + messageDetails;
            } else {
                messageDetails = "Erro de Status HTTP (não 2xx): " + response.getStatusCode().value();
            }

            // Cria a Entidade de Resultado
            result = new ApiTestResult(
                    apiUrl,
                    isOverallSuccessful,
                    response.getStatusCode().value(),
                    messageDetails,
                    latency,
                    latencyCheck,
                    contentCheck
            );

        } catch (HttpClientErrorException e) {
            long endTime = System.currentTimeMillis();
            long latency = endTime - startTime;

            // Erros de Cliente (4xx)
            result = new ApiTestResult(
                    apiUrl,
                    false,
                    e.getStatusCode().value(),
                    "Erro de Cliente: Status " + e.getStatusCode().value() + ". " + e.getMessage(),
                    latency,
                    false,
                    false
            );
        } catch (ResourceAccessException e) {
            long endTime = System.currentTimeMillis();
            long latency = endTime - startTime;

            // Erro de Conexão/Rede (Timeout/Indisponível)
            result = new ApiTestResult(
                    apiUrl,
                    false,
                    0,
                    "Erro de Conexão (Timeout/Indisponível): O serviço não respondeu. ",
                    latency,
                    false,
                    false
            );
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long latency = endTime - startTime;

            // Outros Erros (incluindo Server Errors 5xx)
            result = new ApiTestResult(
                    apiUrl,
                    false,
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Erro Desconhecido ou 5xx Server Error: " + e.getMessage(),
                    latency,
                    false,
                    false
            );
        }

        // Salva o resultado no banco de dados e retorna
        return repository.save(result);
    }

    /**
     * Verifica se o cabeçalho Content-Type existe e contém o valor esperado.
     */
    private boolean isContentTypeValid(HttpHeaders headers) {
        String contentType = headers.getFirst(HttpHeaders.CONTENT_TYPE);
        // Garante que o Content-Type contenha o valor esperado (ex: lida com 'application/json;charset=UTF-8')
        return contentType != null && contentType.toLowerCase().contains(EXPECTED_CONTENT_TYPE);
    }


    /**
     * Busca todos os resultados de teste e os agrega para gerar o SummaryDto.
     */
    public SummaryDto getSummaryData() {
        // Busca todos os resultados do banco
        List<ApiTestResult> allResults = repository.findAll();

        long totalTests = allResults.size();
        long successfulTests = allResults.stream().filter(ApiTestResult::isSuccessful).count();
        long failedTests = totalTests - successfulTests;

        // --- LÓGICA DE AGREGAÇÃO PARA O GRÁFICO ---

        // Coleta os últimos 7 dias (rótulos de 1 a 7)
        List<Long> last7DaysLabels = LongStream.rangeClosed(1, 7).boxed().collect(Collectors.toList());

        // Agrupamento dos resultados por URL e dia da semana
        // Map<URL, Map<Dia da Semana (1-7), Contagem>>
        Map<String, Map<Integer, Long>> aggregatedData = allResults.stream()
                .collect(Collectors.groupingBy(
                        ApiTestResult::getUrl,
                        Collectors.groupingBy(
                                result -> result.getTestDateTime().getDayOfWeek().getValue(), // Dia da semana (1=Segunda, 7=Domingo)
                                Collectors.counting()
                        )
                ));

        // Estrutura de dados para Chart.js
        Map<String, List<Long>> chartData = new HashMap<>();
        chartData.put("labels", last7DaysLabels);

        // Itera sobre as URLs únicas para criar um dataset para cada API
        aggregatedData.forEach((url, dailyCounts) -> {
            // Inicializa a lista de contagens com zero para 7 dias
            List<Long> apiDailyCounts = new ArrayList<>(Collections.nCopies(7, 0L));

            // Mapeia a contagem real para o índice correto (0 a 6)
            dailyCounts.forEach((dayOfWeek, count) -> {
                int index = dayOfWeek - 1; // Dia da semana (1-7) vira índice (0-6)
                if (index >= 0 && index < 7) {
                    apiDailyCounts.set(index, count);
                }
            });

            // Adiciona o dataset da API
            chartData.put(url, apiDailyCounts);
        });

        return new SummaryDto(totalTests, successfulTests, failedTests, chartData);
    }

    public Iterable<ApiTestResult> getAllResults() {
        // Busca todos os resultados ordenados por data (mais recente primeiro)
        return repository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "testDateTime"));
    }
}