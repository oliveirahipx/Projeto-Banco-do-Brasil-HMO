package com.seumonitor.api_tester.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
@Entity
public class ApiTestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;
    private boolean isSuccessful;
    private int statusCode;
    private String message;
    private long responseTimeMillis;
    private LocalDateTime testDateTime;

    // Novos Getters e Setters
    // VALIDAÇÃO SLA
    private boolean isLatencyOk;     // Se a latência está dentro do limite (ex: < 500ms)
    private boolean isContentValid;  // Se o Content-Type esperado foi retornado

    public ApiTestResult() {
        this.testDateTime = LocalDateTime.now();
    }


    public ApiTestResult(String url, boolean isSuccessful, int statusCode, String message, long responseTimeMillis,
                         boolean isLatencyOk, boolean isContentValid) {
        this.url = url;
        this.isSuccessful = isSuccessful;
        this.statusCode = statusCode;
        this.message = message;
        this.responseTimeMillis = responseTimeMillis;
        this.isLatencyOk = isLatencyOk;
        this.isContentValid = isContentValid;
        this.testDateTime = LocalDateTime.now();
    }

}