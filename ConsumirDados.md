Sim, é perfeitamente possível **exibir os dados da planilha em uma página HTML** usando o Google Apps Script. Isso é feito combinando a leitura dos dados no `Code.gs` com a renderização dinâmica desses dados no `Index.html`.

Aqui está como você pode fazer isso:

---

## 1. Modificar o `Code.gs` para retornar os dados

Precisamos de uma nova função no `Code.gs` que buscará os dados da planilha e os retornará para o lado do cliente (o HTML).

```javascript
// Arquivo: Code.gs

// Função principal que serve a página HTML
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index');
}

// Função para processar o envio do formulário (POST request) - Mantida do exemplo anterior
function doPost(e) {
  var sheetName = 'DadosFormulario'; // Mude para o nome da sua aba onde os dados do formulário são salvos
  var spreadsheetId = 'SEU_ID_DA_PLANILHA_AQUI'; // Mude para o ID da sua planilha

  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  var data = e.parameter;

  var rowData = [];
  rowData.push(data.nome);
  rowData.push(data.email);
  rowData.push(data.mensagem);
  rowData.push(new Date());

  sheet.appendRow(rowData);

  return ContentService.createTextOutput("Dados salvos com sucesso!").setMimeType(ContentService.MimeType.TEXT);
}

// --- NOVA FUNÇÃO PARA LER E RETORNAR DADOS DA PLANILHA ---
function getSheetData() {
  var sheetName = 'DadosFormulario'; // Mude para o nome da aba que você quer exibir
  var spreadsheetId = 'SEU_ID_DA_PLANILHA_AQUI'; // Mude para o ID da sua planilha

  try {
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
    if (!sheet) {
      throw new Error("A aba '" + sheetName + "' não foi encontrada na planilha.");
    }

    var range = sheet.getDataRange();
    var values = range.getValues();

    // Se a planilha estiver vazia (apenas uma linha sem dados), retorna um array vazio
    if (values.length === 1 && values[0].every(cell => cell === '')) {
      return [];
    }

    // Retorna todos os dados, incluindo os cabeçalhos (se houver)
    return values;

  } catch (error) {
    Logger.log("Erro ao ler dados da planilha: " + error.message);
    // Em um cenário real, você pode querer retornar um erro para o cliente
    return { error: error.message };
  }
}
```

**Alterações no `Code.gs`:**

* **`getSheetData()`**: Esta é a nova função que:
    * Abre a planilha e a aba especificada.
    * Usa `sheet.getDataRange().getValues()` para obter todos os dados da aba.
    * Retorna a matriz 2D de dados.
    * Adicionei um tratamento básico de erro para o caso de a aba não ser encontrada ou a planilha estar vazia.

---

## 2. Modificar o `Index.html` para exibir os dados

No seu arquivo `Index.html`, adicionaremos um lugar para exibir a tabela e o código JavaScript para chamar a função `getSheetData()` e construir a tabela.

```html
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <title>Formulário e Dados da Planilha</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .container { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h2 { text-align: center; color: #333; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input[type="text"], input[type="email"], textarea {
      width: calc(100% - 22px); /* Ajuste para padding e borda */
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
      display: block; /* Para o botão ocupar sua própria linha */
      width: 100%; /* Ocupa a largura total */
    }
    input[type="submit"]:hover {
      background-color: #45a049;
    }
    #responseMessage {
      margin-top: 20px;
      padding: 10px;
      border-radius: 4px;
      display: none;
    }
    .success { background-color: #d4edda; color: #155724; border-color: #c3e6cb; }
    .error { background-color: #f8d7da; color: #721c24; border-color: #f5c6cb; }

    /* Estilos para a tabela */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
      color: #333;
      font-weight: bold;
    }
    tr:nth-child(even) { background-color: #f9f9f9; } /* Linhas pares com fundo diferente */
  </style>
</head>
<body>
  <div class="container">
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

    <hr> <h2>Dados da Planilha</h2>
    <div id="loadingMessage" style="text-align: center; margin-top: 20px; display: none;">
      Carregando dados...
    </div>
    <div id="sheetDataTable"></div>
    <div id="noDataMessage" style="text-align: center; margin-top: 20px; display: none; color: #777;">
      Nenhum dado encontrado na planilha.
    </div>

  </div>

  <script>
    // Código JavaScript para lidar com o envio do formulário (mantido do exemplo anterior)
    document.getElementById('myForm').addEventListener('submit', function(e) {
      e.preventDefault();

      var form = e.target;
      var formData = new FormData(form);
      var responseMessage = document.getElementById('responseMessage');

      form.querySelector('input[type="submit"]').disabled = true;

      google.script.run
        .withSuccessHandler(function(response) {
          responseMessage.style.display = 'block';
          responseMessage.className = 'success';
          responseMessage.textContent = response;
          form.reset();
          form.querySelector('input[type="submit"]').disabled = false;
          loadSheetData(); // Recarrega os dados da tabela após o envio
        })
        .withFailureHandler(function(error) {
          responseMessage.style.display = 'block';
          responseMessage.className = 'error';
          responseMessage.textContent = 'Ocorreu um erro: ' + error.message;
          form.querySelector('input[type="submit"]').disabled = false;
        })
        .doPost(Object.fromEntries(formData.entries()));
    });

    // --- NOVO CÓDIGO JAVASCRIPT PARA CARREGAR E EXIBIR OS DADOS ---
    function loadSheetData() {
      var loadingMessage = document.getElementById('loadingMessage');
      var sheetDataTable = document.getElementById('sheetDataTable');
      var noDataMessage = document.getElementById('noDataMessage');

      loadingMessage.style.display = 'block'; // Mostra mensagem de carregamento
      sheetDataTable.innerHTML = ''; // Limpa a tabela anterior
      noDataMessage.style.display = 'none'; // Esconde a mensagem de "sem dados"

      google.script.run
        .withSuccessHandler(function(data) {
          loadingMessage.style.display = 'none'; // Esconde mensagem de carregamento

          if (data && data.length > 0) {
            // Verifica se a primeira linha (cabeçalhos) é válida (não vazia)
            const hasValidHeaders = data[0].some(cell => cell !== '');

            if (data.length === 1 && !hasValidHeaders) { // Se só tem uma linha e está vazia
                 noDataMessage.style.display = 'block';
                 return;
            }

            let tableHTML = '<table><thead><tr>';

            // Cria os cabeçalhos da tabela usando a primeira linha dos dados
            const headers = data[0];
            for (let i = 0; i < headers.length; i++) {
              tableHTML += '<th>' + (headers[i] ? headers[i] : 'Coluna ' + (i + 1)) + '</th>';
            }
            tableHTML += '</tr></thead><tbody>';

            // Adiciona as linhas de dados, começando da segunda linha (ignorando os cabeçalhos)
            for (let i = 1; i < data.length; i++) {
              tableHTML += '<tr>';
              for (let j = 0; j < data[i].length; j++) {
                // Formata datas se houver (o Apps Script retorna objetos Date)
                let cellValue = data[i][j];
                if (cellValue instanceof Date) {
                  cellValue = cellValue.toLocaleString(); // Formata a data para uma string legível
                }
                tableHTML += '<td>' + (cellValue !== null ? cellValue : '') + '</td>';
              }
              tableHTML += '</tr>';
            }
            tableHTML += '</tbody></table>';
            sheetDataTable.innerHTML = tableHTML;
          } else {
            noDataMessage.style.display = 'block'; // Mostra mensagem de "sem dados"
          }
        })
        .withFailureHandler(function(error) {
          loadingMessage.style.display = 'none'; // Esconde mensagem de carregamento
          sheetDataTable.innerHTML = '<p style="color: red;">Erro ao carregar dados: ' + error.message + '</p>';
        })
        .getSheetData(); // Chama a função getSheetData do Apps Script
    }

    // Chama loadSheetData quando a página é carregada
    document.addEventListener('DOMContentLoaded', loadSheetData);
  </script>
</body>
</html>
```

**Alterações no `Index.html`:**

* **Estrutura da Tabela:**
    * Adicionei um `div` com `id="sheetDataTable"` onde a tabela será inserida.
    * Adicionei mensagens de `loadingMessage` e `noDataMessage` para melhor experiência do usuário.
* **Novo Script JavaScript:**
    * **`loadSheetData()`**: Esta função:
        * Mostra uma mensagem de "Carregando dados...".
        * Chama `google.script.run.getSheetData()`.
        * No `withSuccessHandler`:
            * Recebe os `data` (a matriz 2D da planilha).
            * Verifica se há dados.
            * Constrói o HTML da tabela dinamicamente, criando `<th>` para cabeçalhos (a primeira linha dos dados) e `<td>` para as células subsequentes.
            * Incluí um tratamento para formatar objetos `Date` que vêm da planilha para strings legíveis.
            * Define o `innerHTML` de `sheetDataTable` com a tabela gerada.
            * Se não houver dados, exibe a mensagem `noDataMessage`.
        * No `withFailureHandler`, exibe uma mensagem de erro se a leitura da planilha falhar.
    * **`document.addEventListener('DOMContentLoaded', loadSheetData)`**: Garante que a função `loadSheetData()` seja chamada automaticamente quando a página HTML é totalmente carregada no navegador.
    * Adicionei `loadSheetData();` dentro do `withSuccessHandler` do `doPost` para que a tabela seja **recarregada automaticamente** após um novo envio de formulário, mostrando os dados atualizados.
* **Estilos CSS:** Adicionei alguns estilos básicos para a tabela (`<table>`, `<th>`, `<td>`) para que ela tenha uma aparência razoável.

---

## 3. Publicar o Script Novamente

**Muito importante:** Sempre que você fizer alterações no `Code.gs` ou no `Index.html` e quiser que elas sejam refletidas na sua aplicação web, você precisa **criar uma nova versão da implantação**.

1.  No editor do Apps Script, clique em **`Implantar`** (Deploy) > **`Gerenciar implantações`** (Manage deployments).
2.  Clique no ícone de lápis (Editar) ao lado da sua implantação existente.
3.  Para **`Versão`**, selecione **`Nova versão`** (New version).
4.  Clique em **`Implantar`** (Deploy).

---

Ao acessar o URL da sua aplicação web agora, você verá tanto o formulário quanto uma tabela abaixo dele, que será preenchida com os dados da sua planilha. Se você preencher o formulário, os dados serão salvos e a tabela será automaticamente atualizada para mostrar a nova entrada.
