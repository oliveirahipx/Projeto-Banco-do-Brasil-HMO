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
import java.time.LocalDateTime;

@Service
public class ApiTestService {

    // --- Configurações de SLA (Acordo de Nível de Serviço) ---
    private static final long MAX_LATENCY_MS = 50000; // Limite de latência em milissegundos
    private static final String EXPECTED_CONTENT_TYPE = "application/json"; // Content-Type esperado

    private final RestTemplate restTemplate;
    private final ApiTestResultRepository repository;

    public ApiTestService(ApiTestResultRepository repository) {
        this.restTemplate = new RestTemplate();
        this.repository = repository;
    }

    // ----------------------------------------------------
    // --- LÓGICA DE EXECUÇÃO DE TESTE SIMPLES (GET) ---
    // ----------------------------------------------------

    /**
     * Executa um teste de API GET, aplicando validações de SLA e persistindo o resultado.
     * * @param apiUrl URL da API a ser testada.
     * @return O resultado do teste, salvo no banco de dados.
     */
    public ApiTestResult runTest(String apiUrl) {

        long startTime = System.currentTimeMillis();
        ApiTestResult result;

        try {
            // Executa a requisição GET e obtém todos os metadados (Headers, Status)
            ResponseEntity<String> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.GET,
                    null,
                    String.class
            );

            long endTime = System.currentTimeMillis();
            long latency = endTime - startTime;

            boolean isStatusCodeSuccessful = response.getStatusCode().is2xxSuccessful();
            boolean latencyCheck = true;
            boolean contentCheck = true;
            StringBuilder failureDetails = new StringBuilder();

            if (isStatusCodeSuccessful) {
                // 1. Validação de Latência
                latencyCheck = latency <= MAX_LATENCY_MS;
                if (!latencyCheck) {
                    failureDetails.append(" (Latência acima de ").append(MAX_LATENCY_MS).append("ms: ").append(latency).append("ms)");
                }

                // 2. Validação de Content-Type
                contentCheck = isContentTypeValid(response.getHeaders());
                if (!contentCheck) {
                    failureDetails.append(" (Content-Type esperado '").append(EXPECTED_CONTENT_TYPE).append("' inválido/ausente)");
                }
            }

            // Define a verdade final do teste (Contador de Sucesso/Falha)
            boolean isOverallSuccessful = isStatusCodeSuccessful && latencyCheck && contentCheck;
            String messageDetails;

            // Define a mensagem final baseada na verdade do SLA
            if (isOverallSuccessful) {
                messageDetails = "Teste completo: Sucesso.";
            } else if (isStatusCodeSuccessful) {
                // Status 2xx OK, mas Falha no SLA (Sucesso com Interferências)
                messageDetails = "Status 2xx OK, mas Falha no SLA." + failureDetails.toString();
            } else {
                // Falha HTTP (4xx/5xx)
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
            result = new ApiTestResult(apiUrl, false, e.getStatusCode().value(), "Erro de Cliente: Status " + e.getStatusCode().value() + ". " + e.getMessage(), latency, false, false);

        } catch (ResourceAccessException e) {
            long endTime = System.currentTimeMillis();
            long latency = endTime - startTime;
            // Erro de Conexão/Rede
            result = new ApiTestResult(apiUrl, false, 0, "Erro de Conexão (Timeout/Indisponível): O serviço não respondeu. ", latency, false, false);

        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long latency = endTime - startTime;
            // Outros Erros (incluindo Server Errors 5xx)
            result = new ApiTestResult(apiUrl, false, HttpStatus.INTERNAL_SERVER_ERROR.value(), "Erro Desconhecido ou 5xx Server Error: " + e.getMessage(), latency, false, false);
        }

        // Persiste o resultado no banco
        return repository.save(result);
    }

    // ----------------------------------------------------
    // --- NOVO MÉTODO: MÚLTIPLOS TESTES ---
    // ----------------------------------------------------

    /**
     * Executa uma lista de testes sequencialmente.
     * * @param apiUrls Lista de URLs para testar.
     * @return Lista de todos os resultados salvos no banco.
     */
    public List<ApiTestResult> runMultipleTests(List<String> apiUrls) {
        if (apiUrls == null || apiUrls.isEmpty()) {
            return Collections.emptyList();
        }

        List<ApiTestResult> results = new ArrayList<>();

        // Executa cada teste da lista, chamando o método runTest
        for (String url : apiUrls) {
            try {
                ApiTestResult result = runTest(url);
                results.add(result);
            } catch (Exception e) {
                // Captura exceções para que um teste não interrompa os demais
                System.err.println("Falha ao executar teste para URL " + url + ": " + e.getMessage());
                // Poderíamos adicionar um resultado de falha manual aqui, se necessário.
            }
        }
        return results;
    }


    // ----------------------------------------------------
    // --- MÉTODOS AUXILIARES E REPOSITORY ---
    // ----------------------------------------------------

    /**
     * Verifica se o cabeçalho Content-Type existe e contém o valor esperado.
     */
    private boolean isContentTypeValid(HttpHeaders headers) {
        String contentType = headers.getFirst(HttpHeaders.CONTENT_TYPE);
        return contentType != null && contentType.toLowerCase().contains(EXPECTED_CONTENT_TYPE);
    }

    /**
     * Busca dados agregados de teste para o painel de resumo.
     */
    public SummaryDto getSummaryData() {
        // ... (Lógica de agregação de dados para SummaryDto permanece a mesma) ...
        List<ApiTestResult> allResults = repository.findAll();

        long totalTests = allResults.size();
        long successfulTests = allResults.stream().filter(ApiTestResult::isSuccessful).count();
        long failedTests = totalTests - successfulTests;

        // Lógica de Agregação de Gráfico (mantida do código anterior)
        List<Long> last7DaysLabels = LongStream.rangeClosed(1, 7).boxed().collect(Collectors.toList());
        Map<String, Map<Integer, Long>> aggregatedData = allResults.stream()
                .collect(Collectors.groupingBy(
                        ApiTestResult::getUrl,
                        Collectors.groupingBy(
                                result -> result.getTestDateTime().getDayOfWeek().getValue(),
                                Collectors.counting()
                        )
                ));

        Map<String, List<Long>> chartData = new HashMap<>();
        chartData.put("labels", last7DaysLabels);

        aggregatedData.forEach((url, dailyCounts) -> {
            List<Long> apiDailyCounts = new ArrayList<>(Collections.nCopies(7, 0L));
            dailyCounts.forEach((dayOfWeek, count) -> {
                int index = dayOfWeek - 1;
                if (index >= 0 && index < 7) {
                    apiDailyCounts.set(index, count);
                }
            });
            chartData.put(url, apiDailyCounts);
        });

        return new SummaryDto(totalTests, successfulTests, failedTests, chartData);
    }

    /**
     * Busca todos os resultados ordenados por data (mais recente primeiro).
     */
    public Iterable<ApiTestResult> getAllResults() {
        return repository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "testDateTime"));
    }
}