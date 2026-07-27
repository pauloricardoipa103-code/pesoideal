# Peso Ideal

App de acompanhamento de peso e dose semanal, para duas pessoas, sincronizado em tempo real via **Google Sheets**.

**Arquitetura:**

```
Celular (index.html, no GitHub Pages)
        │  fetch (GET / POST)
        ▼
Google Apps Script (Code.gs, Web App)
        │  lê e escreve
        ▼
Google Sheets (banco de dados)
```

Não precisa de servidor próprio, banco pago nem login: o Apps Script roda de graça na conta Google de quem criar a planilha.

---

## 1. Criar a planilha (banco de dados)

1. Acesse [sheets.google.com](https://sheets.google.com) e crie uma planilha nova.
2. Renomeie a **Aba1** para `Pesos`. Na linha 1, preencha os cabeçalhos:
   ```
   id | pessoa | data | peso
   ```
3. Crie uma segunda aba chamada `Doses`. Na linha 1:
   ```
   id | pessoa | data
   ```
4. Pode deixar as duas abas vazias abaixo do cabeçalho — o app preenche sozinho.

## 2. Publicar a API (Apps Script)

1. Na planilha, vá em **Extensões > Apps Script**.
2. Apague o conteúdo do arquivo padrão (`Code.gs`) e cole o conteúdo do arquivo [`apps-script/Code.gs`](./apps-script/Code.gs) deste repositório.
3. Clique em **Implantar > Nova implantação**.
4. Em "Selecionar tipo", escolha **App da Web**.
5. Configure:
   - **Executar como:** Eu (seu e-mail)
   - **Quem pode acessar:** Qualquer pessoa
6. Clique em **Implantar**. Autorize o acesso quando solicitado (é a sua própria planilha).
7. Copie a **URL do app da Web** — termina em `/exec`. Você vai usar essa URL no próximo passo.

> Sempre que editar o `Code.gs`, é preciso ir em **Implantar > Gerenciar implantações > editar (ícone de lápis) > Nova versão > Implantar** para as mudanças valerem. A URL não muda.

## 3. Configurar o app

1. Abra o arquivo [`index.html`](./index.html) deste repositório.
2. Encontre a linha:
   ```js
   const API_URL = "COLE_AQUI_A_URL_DO_SEU_APPS_SCRIPT";
   ```
3. Substitua pelo link copiado no passo anterior, ex:
   ```js
   const API_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
4. Salve e envie (commit) essa alteração para o GitHub.

## 4. Publicar no GitHub Pages

1. No repositório, vá em **Settings > Pages**.
2. Em "Source", selecione a branch `main` e a pasta `/root`.
3. Salve. O GitHub gera uma URL do tipo:
   ```
   https://pauloricardoipa103-code.github.io/pesoideal/
   ```
4. Esse é o link que vocês dois vão abrir no celular (dá pra adicionar à tela inicial como atalho).

## Como funciona no dia a dia

- Cada um alterna entre as abas **Você** / **Esposa** no topo do app.
- Registra o peso do dia e, aos domingos, registra a dose de 2,5 ml.
- Tudo é salvo direto na planilha — abrindo o link em qualquer celular, os dois veem os mesmos dados, sem precisar exportar/importar nada.
- Se quiser, é possível abrir a planilha do Google Sheets a qualquer momento para conferir os dados brutos ou fazer backup.

## Estrutura do repositório

```
pesoideal/
├── index.html          # app (front-end), hospedado no GitHub Pages
├── apps-script/
│   └── Code.gs          # backend (API), publicado como Web App do Apps Script
└── README.md
```
