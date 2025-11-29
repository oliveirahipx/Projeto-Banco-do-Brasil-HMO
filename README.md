Este projeto é um sistema completo para monitorar a saúde, desempenho (Latência) e conformidade (Content-Type) de APIs REST externas. Desenvolvido com Spring Boot para o backend e HTML/CSS/JavaScript para o frontend.
Funcionalidades Principais
Teste de Conformidade (SLA): Verifica se a API retorna Status 2xx, se o tempo de resposta é aceitável (< 50000ms) e se o Content-Type é o esperado (application/json).

Teste em Lote (Batch): Permite o envio de múltiplas URLs simultaneamente para testes sequenciais.

Persistência de Dados: Todos os resultados dos testes são salvos no PostgreSQL para histórico e relatórios.

Visualização: Painéis de resumo, histórico de testes detalhado e gráficos de desempenho.

Exportação de Relatórios: Geração de relatórios completos em formato PDF.

Autenticação: Sistema básico de login e gerenciamento de configurações de usuário.

O projeto utiliza as seguintes tecnologias em camadas:

Backend (Java 17+ / Spring Boot 3.x)
Persistência: PostgreSQL (via Spring Data JPA e Hibernate).

Testes HTTP: Spring RestTemplate (utilizado para fazer as chamadas às APIs externas).

Geração de PDF: iText 7 (com.itextpdf:itext7-core).

Frontend (HTML5, CSS, JavaScript)
Módulos JS: Arquitetura de Módulos ES6 (import/export) divididos em base.js, api.js, e resultados.js.

Bibliotecas: Bootstrap Icons e Chart.js (para renderização de gráficos).
