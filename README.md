# Google Sheets WebApp 
### Projeto Web com Planilhas e Html e CSS e Google scrips.

Criar uma página de formulário HTML para salvar dados em uma planilha do Google Sheets usando Google Apps Script é um processo poderoso que permite transformar sua planilha em um banco de dados simples acessível via web.

Aqui está um guia passo a passo completo:

**1. Configurar sua Planilha Google (Google Sheet)**

Primeiro, você precisa de uma planilha onde seus dados serão salvos.

* Abra o Google Sheets e crie uma nova planilha (ou use uma existente).
* Na primeira linha, defina os cabeçalhos das colunas que correspondem aos campos que você terá em seu formulário HTML. Por exemplo: `Nome`, `Email`, `Mensagem`. **É crucial que os nomes dos atributos `name` dos seus campos HTML correspondam exatamente a esses cabeçalhos de coluna.**

**2. Abrir o Editor de Apps Script**

Com sua planilha aberta:

* Vá em `Extensões` > `Apps Script`. Isso abrirá o editor de script em uma nova aba.

**3. Escrever o Código Google Apps Script (`Code.gs`)**

No editor do Apps Script, você terá um arquivo `Code.gs` por padrão. Apague qualquer código existente e cole o seguinte:

```javascript
// Arquivo: Code.gs

// Função principal que serve a página HTML
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index'); // 'Index' é o nome do seu arquivo HTML
}

// Função para processar o envio do formulário (POST request)
function doPost(e) {
  var sheetName = 'NomeDaSuaPlanilha'; // **MUDE PARA O NOME DA SUA PLANILHA (ex: 'Página1')**
  var spreadsheetId = 'ID_DA_SUA_PLANILHA'; // **MUDE PARA O ID DA SUA PLANILHA**

  // Obter a planilha ativa
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

  // Obter os dados do formulário
  var data = e.parameter; // 'e.parameter' contém os dados enviados pelo formulário

  // Criar um array com os valores na ordem dos seus cabeçalhos na planilha
  // Certifique-se de que a ordem aqui corresponde à ordem das colunas na sua planilha
  var rowData = [];
  rowData.push(data.nome);    // 'nome' deve ser o 'name' do campo HTML para nome
  rowData.push(data.email);   // 'email' deve ser o 'name' do campo HTML para email
  rowData.push(data.mensagem); // 'mensagem' deve ser o 'name' do campo HTML para mensagem
  rowData.push(new Date());   // Adiciona um timestamp

  // Adicionar uma nova linha com os dados à planilha
  sheet.appendRow(rowData);

  // Retornar uma resposta de sucesso
  return ContentService.createTextOutput("Dados salvos com sucesso!").setMimeType(ContentService.MimeType.TEXT);
}
```

**Explicação do `Code.gs`:**

* `doGet()`: Esta função é acionada quando alguém acessa a URL da sua aplicação web. Ela carrega o arquivo HTML (`Index.html` neste exemplo) e o serve como uma página da web.
* `doPost(e)`: Esta função é acionada quando um formulário é enviado (requisição POST) para a sua aplicação web.
    * `sheetName`: **MUDE** para o nome exato da sua aba na planilha (ex: "Página1", "Form Responses").
    * `spreadsheetId`: **MUDE** para o ID da sua planilha. Você pode encontrar o ID na URL da sua planilha, é a parte entre `/d/` e `/edit`. Ex: `https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit#gid=0`.
    * `e.parameter`: Este objeto contém todos os dados enviados do formulário HTML, onde as chaves são os atributos `name` dos seus campos de input.
    * `sheet.appendRow(rowData)`: Adiciona uma nova linha à planilha com os dados do formulário.
    * `ContentService.createTextOutput(...)`: Envia uma resposta de volta ao navegador. Você pode personalizar esta mensagem.

**4. Criar o Arquivo HTML (`Index.html`)**

No editor do Apps Script, clique em `Arquivo` > `Novo` > `Arquivo HTML`. Nomeie o arquivo como `Index` (ou o nome que você usou em `createHtmlOutputFromFile`). Cole o seguinte código HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <base target="_top"> <title>Formulário de Contato</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .form-container { max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input[type="text"], input[type="email"], textarea {
      width: calc(100% - 20px);
      padding: 10px;
      margin-bottom: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    input[type="submit"] {
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    input[type="submit"]:hover {
      background-color: #45a049;
    }
    #responseMessage {
      margin-top: 20px;
      padding: 10px;
      border-radius: 4px;
      display: none; /* Esconde a mensagem inicialmente */
    }
    .success { background-color: #d4edda; color: #155724; border-color: #c3e6cb; }
    .error { background-color: #f8d7da; color: #721c24; border-color: #f5c6cb; }
  </style>
</head>
<body>
  <div class="form-container">
    <h2>Formulário de Contato</h2>
    <form id="myForm">
      <label for="nome">Nome:</label>
      <input type="text" id="nome" name="nome" required>

      <label for="email">Email:</label>
      <input type="email" id="email" name="email" required>

      <label for="mensagem">Mensagem:</label>
      <textarea id="mensagem" name="mensagem" rows="5" required></textarea>

      <input type="submit" value="Enviar">
    </form>
    <div id="responseMessage"></div>
  </div>

  <script>
    // Código JavaScript para lidar com o envio do formulário
    document.getElementById('myForm').addEventListener('submit', function(e) {
      e.preventDefault(); // Impede o envio padrão do formulário

      var form = e.target;
      var formData = new FormData(form);
      var responseMessage = document.getElementById('responseMessage');

      // Desabilitar o botão de envio para evitar múltiplos cliques
      form.querySelector('input[type="submit"]').disabled = true;

      // Enviar os dados para o Apps Script
      google.script.run
        .withSuccessHandler(function(response) {
          responseMessage.style.display = 'block';
          responseMessage.className = 'success';
          responseMessage.textContent = response; // Exibe a mensagem de sucesso do Apps Script
          form.reset(); // Limpa o formulário
          form.querySelector('input[type="submit"]').disabled = false; // Reabilita o botão
        })
        .withFailureHandler(function(error) {
          responseMessage.style.display = 'block';
          responseMessage.className = 'error';
          responseMessage.textContent = 'Ocorreu um erro: ' + error.message;
          form.querySelector('input[type="submit"]').disabled = false; // Reabilita o botão
        })
        .doPost(Object.fromEntries(formData.entries())); // Chama a função doPost no Apps Script
    });
  </script>
</body>
</html>
```

**Explicação do `Index.html`:**

* `<base target="_top">`: Essencial para que os links dentro da sua aplicação web abram em uma nova aba, em vez de dentro do iframe do Apps Script.
* **Formulário (`<form>`):**
    * Cada campo de input tem um atributo `name` (ex: `name="nome"`). **Estes `name` devem corresponder aos cabeçalhos das suas colunas na planilha e como você os acessa em `doPost()` (ex: `data.nome`).**
    * `id="myForm"`: Usado para referenciar o formulário no JavaScript.
* **JavaScript (`<script>`):**
    * `e.preventDefault()`: Impede que o formulário seja enviado da maneira tradicional (que recarregaria a página).
    * `new FormData(form)`: Coleta todos os dados do formulário.
    * `google.script.run`: Esta é a API especial do Apps Script que permite que o JavaScript do cliente chame funções do lado do servidor (seu `Code.gs`).
        * `.withSuccessHandler(function(response) { ... })`: Esta função é executada se a chamada ao Apps Script for bem-sucedida. `response` é o valor retornado pela sua função `doPost`.
        * `.withFailureHandler(function(error) { ... })`: Esta função é executada se houver um erro na chamada ao Apps Script.
        * `.doPost(Object.fromEntries(formData.entries()))`: Esta linha chama a função `doPost` no seu `Code.gs` e passa os dados do formulário como um objeto.

**5. Publicar o Script como uma Aplicação Web**

Agora que você tem o código, precisa publicá-lo para que ele possa ser acessado como uma página da web.

* No editor do Apps Script, clique em `Implantar` (Deploy) no canto superior direito e selecione `Nova implantação` (New deployment).
* Clique na engrenagem ao lado de "Selecionar tipo" (Select type) e escolha `Aplicativo da Web` (Web app).
* Preencha os detalhes:
    * **Descrição da implantação:** Dê um nome significativo (ex: "Formulário de Contato").
    * **Executar como:** Escolha `Minha conta` (My account) para que o script seja executado com suas permissões.
    * **Quem tem acesso:** Defina como `Qualquer pessoa` (Anyone) se você quiser que o formulário seja público, ou `Qualquer pessoa com conta do Google` (Anyone with Google account) se quiser restringir. **Para testes e um formulário público, `Qualquer pessoa` é geralmente o que você precisa.**
* Clique em `Implantar` (Deploy).
* Você será solicitado a autorizar o script pela primeira vez. Siga as instruções:
    * Clique em `Autorizar acesso`.
    * Selecione sua conta Google.
    * Clique em `Avançado` (Advanced) na parte inferior esquerda.
    * Clique no link `Ir para [nome do seu projeto]` (Go to [your project name]).
    * Clique em `Permitir` (Allow).
* Após a autorização, uma janela pop-up aparecerá com o **URL do aplicativo da web**. Copie este URL. Esta é a URL onde seu formulário HTML estará acessível.

**6. Testar o Formulário**

* Cole o URL do aplicativo da web que você copiou em seu navegador.
* Preencha o formulário e clique em "Enviar".
* Verifique sua planilha do Google Sheets. Os dados devem aparecer lá em uma nova linha.

**Dicas Importantes:**

* **Sempre que fizer alterações no `Code.gs` ou `Index.html`**, você precisará criar uma **nova versão da implantação** para que as alterações entrem em vigor.
    * No editor do Apps Script, vá em `Implantar` (Deploy) > `Gerenciar implantações` (Manage deployments).
    * Clique no ícone de lápis (Editar) ao lado da sua implantação.
    * Para `Versão`, selecione `Nova versão` (New version).
    * Clique em `Implantar` (Deploy).
* **Segurança:** Se você estiver lidando com dados sensíveis, tenha cuidado com a opção "Quem tem acesso". Para formulários públicos, a opção "Qualquer pessoa" é adequada.
* **Tratamento de Erros:** O código JavaScript inclui um `withFailureHandler` para exibir mensagens de erro, o que é útil para depuração e para o usuário final.
* **CSS:** Sinta-se à vontade para estilizar seu HTML com CSS para torná-lo mais atraente.
* **Validação:** Adicione mais validação de formulário (por exemplo, validação de lado do cliente com JavaScript) para garantir que os dados inseridos estejam corretos antes de serem enviados.

Este processo oferece uma maneira eficaz e de baixo custo para coletar dados por meio de um formulário web e armazená-los diretamente em uma planilha do Google Sheets.
