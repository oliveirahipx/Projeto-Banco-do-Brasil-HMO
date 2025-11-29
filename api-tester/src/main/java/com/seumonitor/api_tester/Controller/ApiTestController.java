package com.seumonitor.api_tester.Controller;
import com.seumonitor.api_tester.DTO.MultiTestRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.seumonitor.api_tester.Model.ApiTestResult;
import com.seumonitor.api_tester.Service.ApiTestService;
import com.seumonitor.api_tester.Service.PdfExportService;
import com.seumonitor.api_tester.DTO.SummaryDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class ApiTestController {

    private final ApiTestService apiTestService;
    // NOVA INJEÇÃO: Serviço para geração de PDF
    private final PdfExportService pdfExportService;

    @Autowired
    public ApiTestController(ApiTestService apiTestService, PdfExportService pdfExportService) {
        this.apiTestService = apiTestService;
        this.pdfExportService = pdfExportService;
    }

    // Endpoint 1: Para executar um novo teste
    @GetMapping("/api/test")
    public ApiTestResult testApi(@RequestParam String url) {

        System.out.println("Recebida requisição para testar a URL: " + url);
        return apiTestService.runTest(url);
    }

    // Endpoint 2: Para buscar todos os resultados
    @GetMapping("/api/results")
    public Iterable<ApiTestResult> getAllResults() {
        System.out.println("Recebida requisição para buscar todos os resultados.");
        return apiTestService.getAllResults();
    }

    // Endpoint 3: NOVO - Para gerar o relatório PDF
    @GetMapping("/api/export/pdf")
    public ResponseEntity<byte[]> exportPdf() {
        System.out.println("Recebida requisição para gerar relatório PDF.");

        // 1. Gera o PDF chamando o novo serviço
        byte[] pdfBytes = pdfExportService.exportTestResultsToPdf();

        // 2. Configura os Headers para o navegador fazer o download
        HttpHeaders headers = new HttpHeaders();
        // Define o tipo de conteúdo como PDF
        headers.setContentType(MediaType.APPLICATION_PDF);

        // Define o nome do arquivo para download
        String filename = "relatorio_api_monitoramento_" + System.currentTimeMillis() + ".pdf";
        headers.setContentDispositionFormData(filename, filename);

        // Configura o cache para garantir que o navegador baixe o arquivo
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        // Retorna o array de bytes com status 200 OK
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    // Endpoint 4: - Para buscar o resumo da aplicação (cards e gráfico)
    @GetMapping("/api/summary")
    public SummaryDto getSummary() {
        System.out.println("Recebida requisição para buscar dados de resumo.");
        return apiTestService.getSummaryData();
    }
    // Endpoint 5: Para executar múltiplos testes de uma vez
    @PostMapping("/api/test/multiple")
    public ResponseEntity<List<ApiTestResult>> testMultipleApis(@RequestBody MultiTestRequest request) {
        System.out.println("Recebida requisição para executar múltiplos testes.");

        List<ApiTestResult> results = apiTestService.runMultipleTests(request.getApiUrls());

        if (results.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(results);
    }
}