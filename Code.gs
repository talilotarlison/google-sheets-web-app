// Arquivo: Code.gs

// Função principal que serve a página HTML
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index'); // 'Index' é o nome do seu arquivo HTML
}

// Função para processar o envio do formulário (POST request)
function doPost(e) {
  var sheetName = 'Clientes'; // **MUDE PARA O NOME DA SUA PLANILHA (ex: 'Página1')**
  var spreadsheetId = '1MA05ruT_lyNXICz5vJo4mMrDS-E5C9dS0V-kUdYR5oA'; // **MUDE PARA O ID DA SUA PLANILHA**

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
