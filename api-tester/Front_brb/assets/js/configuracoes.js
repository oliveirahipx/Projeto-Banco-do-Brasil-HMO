// Arquivo: assets/js/configuracoes.js

import { BACKEND_BASE_URL } from './base.js';

document.addEventListener('DOMContentLoaded', () => {

    // Simula a obtenção do email do usuário logado (salvo após o login)
    const currentEmail = localStorage.getItem('currentUserEmail');

    // Seletores de elementos críticos
    const updateForm = document.getElementById('config-form');
    const btnSalvar = document.getElementById('btn-salvar');

    // Seletores de inputs (devem corresponder aos IDs no configuracoes.html)
    const nomeInput = document.getElementById('input-nome');
    const emailInput = document.getElementById('input-email');
    const senhaInput = document.getElementById('input-senha');
    const projetoInput = document.getElementById('input-projeto');
    const urlBaseInput = document.getElementById('input-url-base');
    const userIdInput = document.getElementById('user-id');

    if (!currentEmail) {
        console.error("Usuário não logado. O script de Configurações não será executado.");
        // Opcional: window.location.href = '../index.html';
        return;
    }

    /**
     * Busca os dados do usuário logado (GET) e preenche o formulário.
     */
    async function fetchAndPopulateConfig() {
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/auth/user/${currentEmail}`);

            if (response.ok) {
                const user = await response.json();

                // Preenche os inputs com os dados atuais
                if (nomeInput) nomeInput.value = user.name || '';
                if (emailInput) emailInput.value = user.email || '';
                if (projetoInput) projetoInput.value = user.projectName || '';
                if (urlBaseInput) urlBaseInput.value = user.baseUrl || '';

                // Guarda o ID (CRUCIAL para a requisição PUT)
                if (userIdInput) userIdInput.value = user.id;

            } else {
                console.error("Erro ao carregar dados do usuário:", response.status);
            }
        } catch (error) {
            console.error("Falha de rede ao buscar configurações:", error);
        }
    }

    // ----------------------------------------------------
    // --- LÓGICA DE ATUALIZAÇÃO (PUT) ---
    // ----------------------------------------------------

    if (updateForm) {
        updateForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            btnSalvar.disabled = true;
            btnSalvar.textContent = 'Salvando...';

            // Coleta os dados editados
            const updatedData = {
                id: userIdInput.value, // ID é obrigatório para atualização
                name: nomeInput.value,
                email: emailInput.value,
                // Envia a senha apenas se o campo não estiver vazio
                password: senhaInput.value || null,
                projectName: projetoInput.value,
                baseUrl: urlBaseInput.value
            };

            try {
                const response = await fetch(`${BACKEND_BASE_URL}/api/auth/user/update`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });

                if (response.ok) {
                    const savedUser = await response.json();
                    alert("Configurações salvas com sucesso!");

                    // Atualiza o email salvo localmente (caso o usuário tenha mudado o email)
                    localStorage.setItem('currentUserEmail', savedUser.email);

                    // Atualiza o formulário e limpa o campo de senha
                    senhaInput.value = '';
                    fetchAndPopulateConfig();

                } else {
                    alert("Falha ao salvar as configurações. Verifique os dados.");
                }
            } catch (error) {
                console.error("Erro na atualização:", error);
                alert("Erro de conexão com o servidor ao tentar salvar.");
            } finally {
                btnSalvar.disabled = false;
                btnSalvar.textContent = 'Salvar alterações';
            }
        });
    }

    // Chamada inicial para preencher os dados ao carregar a página
    if (currentEmail) {
        fetchAndPopulateConfig();
    }
});