# Projeto Frontend Banco do Brasil

## 📦 Pré-requisitos

- Node.js **18 ou superior** (projeto testado com **Node 22.19.0**)
- NPM instalado automaticamente com o Node

## 💡 Dica 
Para verificar sua versão do Node e NPM, use:
```bash
node -v
npm -v
```

## 📁 Estrutura de pastas
```
/frontend
 ├── assets/           → Imagens, ícones, arquivos estáticos
 │   ├── js/           → Scripts da aplicação (api.js, main.js)
 ├── scss/             → Código-fonte SASS organizado por módulos
 │   ├── base/         → Reset, variáveis globais
 │   ├── components/   → Botões, cards, etc
 │   ├── layout/       → Estruturas de grid / containers
 │   ├── pages/        → Estilos específicos por página
 │   └── main.scss     → Arquivo principal que importa todos
 ├── dist/             → Compilado final (NÃO editar aqui)
 │   ├── css/main.css  → CSS gerado automaticamente
 │   └── js/bundle.js  → JS empacotado
 ├── pages/            → Páginas HTML do projeto
 ├── index.html        → Página inicial
 └──  package.json     → Configuração do projeto / scripts
```
 > 🔹 **Atenção:** A pasta `dist/` é gerada automaticamente e **não deve ser editada manualmente**.
 

## 📜 Scripts úteis (já adicionado)

```json
  "scripts": {
    "dev": "sass --watch assets/scss/main.scss:dist/css/main.css",
    "build": "sass assets/scss/main.scss dist/css/main.css --style=compressed",
    "start": "live-server --open=./"
  },
```
## 🚀 Como rodar o projeto localmente

```bash
npm install    # 📥 Instalar dependências (Bootstrap, Sass, etc.)
npm run dev    # 🖌️ Desenvolvimento com watch
npm run build  # 📦 Versão final minificada
npm run start  # 🌐 Servidor local com live-server
```
## 🌐 Rodar online

O projeto está disponível no GitHub Pages:

[GitHub Pages](https://caioxdev.github.io/Frontend-Projeto-Banco-do-Brasil/)
