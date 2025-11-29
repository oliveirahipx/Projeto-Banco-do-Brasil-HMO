// Arquivo: assets/js/login.js

const BACKEND_BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const btnLogin = document.getElementById('btn-login');

    if (loginForm) {
        // Preenche com o usuário de teste para facilitar
        emailInput.value = "caio@exemplo.com";
        passwordInput.value = "123456";

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o envio tradicional do formulário

            btnLogin.disabled = true;
            btnLogin.textContent = 'Entrando...';

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            try {
                const response = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    // Login Bem-Sucedido
                    const userData = await response.json();

                    // Armazena informações do usuário (pode ser usado na página de configurações)
                    localStorage.setItem('currentUserEmail', userData.email);
                    localStorage.setItem('currentUserName', userData.name);

                    alert('Login bem-sucedido! Redirecionando...');
                    window.location.href = './pages/resumo.html'; // Redireciona
                } else if (response.status === 401) {
                    // Não Autorizado
                    alert('Falha no login: Credenciais inválidas.');
                } else {
                    // Outro erro do servidor
                    alert(`Erro do servidor (${response.status}). Verifique o console.`);
                }
            } catch (error) {
                console.error("Erro de rede:", error);
                alert('Erro de conexão com o servidor. Verifique se o backend está rodando.');
            } finally {
                btnLogin.disabled = false;
                btnLogin.textContent = 'entrar';
            }
        });
    }
});