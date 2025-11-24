package com.seumonitor.api_tester.Service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.seumonitor.api_tester.Model.ApiTestResult;
import com.seumonitor.api_tester.Repository.ApiTestResultRepository;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PdfExportService {

    private final ApiTestResultRepository repository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public PdfExportService(ApiTestResultRepository repository) {
        this.repository = repository;
    }

    /**
     * Gera um PDF contendo todos os resultados de testes da API.
     * @return Um array de bytes contendo o conteúdo do arquivo PDF.
     */
    public byte[] exportTestResultsToPdf() {
        // Usamos ByteArrayOutputStream para criar o PDF na memória antes de enviá-lo
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("Relatório de Monitoramento de APIs"));
            document.add(new Paragraph("Gerado em: " + LocalDateTime.now().format(FORMATTER)));
            document.add(new Paragraph(" "));

            // Cria uma tabela com 5 colunas: URL, Status, Duração, Latência OK, Conteúdo OK
            float[] columnWidths = {200f, 60f, 60f, 60f, 60f};
            Table table = new Table(UnitValue.createPercentArray(columnWidths));
            table.setWidth(UnitValue.createPercentValue(100));

            // Cabeçalhos da Tabela
            table.addHeaderCell("URL e Data/Hora");
            table.addHeaderCell("Status");
            table.addHeaderCell("Duração (ms)");
            table.addHeaderCell("Latência OK");
            table.addHeaderCell("Conteúdo OK");

            // Busca todos os resultados do banco
            Iterable<ApiTestResult> results = repository.findAll();

            // Preenche a tabela com os dados
            results.forEach(result -> {
                String fullUrl = result.getUrl() + "\n" + result.getTestDateTime().format(FORMATTER);
                String statusText = result.isSuccessful() ? "SUCESSO" : "FALHA";

                table.addCell(fullUrl);
                table.addCell(result.getStatusCode() + " (" + statusText + ")");
                table.addCell(String.valueOf(result.getResponseTimeMillis()));
                table.addCell(result.isLatencyOk() ? "Sim" : "Não");
                table.addCell(result.isContentValid() ? "Sim" : "Não");
            });

            document.add(table);

            // Adiciona uma seção para a mensagem detalhada (a "JSON" no seu requisito)
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Mensagens e Detalhes:"));

            results.forEach(result -> {
                document.add(new Paragraph("--- Teste: " + result.getUrl()));
                document.add(new Paragraph("Mensagem: " + result.getMessage()));
                document.add(new Paragraph("ID do Registro: " + result.getId()));
                document.add(new Paragraph("--------------------------------------------------"));
            });

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF: " + e.getMessage(), e);
        }
    }
}