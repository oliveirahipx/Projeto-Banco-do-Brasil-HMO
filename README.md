Este projeto é um sistema completo para monitorar a saúde, desempenho (Latência) e conformidade (Content-Type) de APIs REST externas. Desenvolvido com Spring Boot para o backend e HTML/CSS/JavaScript para o frontend.
Funcionalidades Principais
Teste de Conformidade (SLA): Verifica se a API retorna Status 2xx, se o tempo de resposta é aceitável (< 50000ms) e se o Content-Type é o esperado (application/json).

Teste em Lote (Batch): Permite o envio de múltiplas URLs simultaneamente para testes sequenciais.

Persistência de Dados: Todos os resultados dos testes são salvos no PostgreSQL para histórico e relatórios.

Visualização: Painéis de resumo, histórico de testes detalhado e gráficos de desempenho.

Exportação de Relatórios: Geração de relatórios completos em formato PDF.

Autenticação: Sistema básico de login e gerenciamento de configurações de usuário.

Tecnologias Utilizadas
Camada	         Tecnologia                    	Dependência Chave
Backend	          Java 17+   	                   Spring Boot 3.x
Persistência      PostgreSQL	                    Spring Data JPA (Hibernate)
Testes HTTP	      Spring RestTemplate	            Spring Web
Geração de PDF  	iText 7	                        com.itextpdf:itext7-core
Frontend	        HTML5, CSS	                    Bootstrap Icons, Chart.js (Gráficos)
Módulos JS	      ES6 Modules (import/export)     base.js, api.js, resultados.js
