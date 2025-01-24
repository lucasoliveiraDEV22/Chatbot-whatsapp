const http = require('http');
// Define a porta a partir da variável de ambiente ou usa a porta 3000 como padrão
const express = require('express');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js'); // Mudança Buttons

const app = express();
const PORT = process.env.PORT || 3004;

// Cria um servidor básico
// const server = http.createServer((req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end('Chatbot para WhatsApp esta rodando!');
// });

// Faz o servidor escutar na porta especificada
// Inicializando o servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Tratamento de erros relacionados à porta
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
      console.error(`A porta ${PORT} já está em uso. Por favor, tente uma porta diferente.`);
      process.exit(1); // Sai do processo para evitar travamentos
  } else {
      throw err;
  }
});

// leitor de qr code

const fs = require('fs');
const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'chatbot-deploy' }) // Sessão será salva automaticamente e identificador unico da sessão
});
// Variável para armazenar o QR Code
let qrCodeData = '';

// Variável para rastrear a disponibilidade de um atendente
let attendantAvailable = false;
// serviço de leitura do qr code
client.on('qr', (qr) => {
  // const qrcode = require('qrcode');
  // console.log('Escaneie o QR Code abaixo para conectar:');
  // Gera o QR Code e armazena os dados
  qrCodeData = qr;
  console.log('QR Code gerado! Acesse a interface web para escanear.');

  // Gera uma versão reduzida do QR Code e exibe como texto
  qrcode.toString(qr, { type: 'terminal', margin: 1 }, (err, output) => {
    if (err) {
      console.error('Erro ao gerar QR Code:', err);
    } else {
      console.log(output);
    }
  });
});
// apos isso ele diz que foi tudo certo
client.on('ready', () => {
  console.log('WhatsApp conectado com sucesso!');
});

// Evento disparado quando o cliente perde a conexão
client.on('disconnected', (reason) => {
  console.log('WhatsApp desconectado:', reason);
  qrCodeData = ''; // Reseta o QR Code
  // console.log('Reconecte manualmente se necessário.');
});
// E inicializa tudo
client.initialize();

// Rota para exibir o QR Code no navegador
app.get('/', async (req, res) => {
  if (!qrCodeData) {
    return res.send(
      '<h1>O QR Code ainda não está disponível. Tente novamente em alguns segundos.</h1>'
    );
  }
  // Gera o QR Code como imagem base64
  const qrCodeImage = await qrcode.toDataURL(qrCodeData);
  res.send(`
      <div style="text-align: center; margin-top: 50px;">
        <h1>Escaneie o QR Code abaixo para conectar o WhatsApp</h1>
        <img src="${qrCodeImage}" alt="QR Code" style="width: 300px; height: 300px;" />
      </div>
    `);
});
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

const delay = (ms) => new Promise((res) => setTimeout(res, ms)); // Função que usamos para criar o delay entre uma ação e outra

// Variável para rastrear interações do paciente

const interactions = new Map(); //Armazena o estado de cada usuário

async function handleOptions1(from) {
  await delay(3000);
  await client.sendMessage(
    from,
    '🔰Durabilidade média de 3 a 5 anos, dependendo dos cuidados.\n\n 🔰Manutenção a cada 6 meses\n\n🔰Procedimento indolor\n\n🔰Realizado em uma única sessão, levando de 3 a 4 horas.'
  );
}

async function handleOptions2(from) {
  await delay(3000);
  await client.sendMessage(
    from,
    '➡️ Nosso valor normal é de R$ X por arcada, totalizando R$ Y.\n\n➡️ Valores promocionais:\n\n➡️ Facetas de resina: R$ A na parte superior (até 10 facetas) e R$ B na parte inferior (até 10 facetas) à vista.\n\n➡️ Boca completa (até 20 dentes): R$ C.\n\n➡️ O valor pode ser parcelado em até X vezes no cartão de crédito com taxa da maquina.\n\n➡️ Manutenção a cada 6 meses, custo de R$ D (apenas para quem colocou facetas conosco).'
  );
}

async function handleOptions3(from) {
  await delay(3000);
  await client.sendMessage(
    from,
    'Agendamento 👇🏽\n\nAgende sua consulta pelo nosso WhatsApp, digitando 4.'
  );
}

async function handleOptions4(from) {
  await delay(3000);
  await client.sendMessage(
    from,
    'Transferindo para um atendente... Por favor, aguarde enquanto conectamos você com a nossa equipe.'
  );
  interactions.set(from, 'attendant'); // Marca o usuário como "falando com atendente"
  attendantAvailable = true; // Indica que o atendente está disponível
}

client.on('message', async (msg) => {
  const userId = msg.from;
  // Verifica se o menu inicial já foi enviado
  if (!interactions.has(userId)) {
    if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola)/i)) {
      const chat = await msg.getChat();
      await delay(3000);
      await chat.sendStateTyping();
      await delay(3000);
      const contact = await msg.getContact();
      const name = contact.pushname;
      await client.sendMessage(
        userId,
        `Olá, ${
          name.split(' ')[0]
        }. Sou o assistente virtual do consultório X Facetas em Resina. Como posso ajudá-lo hoje? Por favor, digite uma das opções abaixo:\n\n1 - Como funciona?\n2 - Valores dos serviços\n3 - Agendamento\n4 - Falar com um atendente`
      );
      interactions.set(userId, 'menu'); // Define estado inicial como "menu"
      return;
    }
  }

  const userState = interactions.get(userId);

  // Opções do menu inicial

  if (userState === 'menu') {
    if (msg.body === '1') {
      await handleOptions1(userId);
    } else if (msg.body === '2') {
      await handleOptions2(userId);
    } else if (msg.body === '3') {
      await handleOptions3(userId);
    } else if (msg.body === '4') {
      await handleOptions4(userId);
    } else {
      await client.sendMessage(
        userId,
        'Desculpe, não entendi sua mensagem. Por favor, escolha uma das opções enviadas no menu: 1, 2, 3 ou 4.'
      );
    }
  } else if (userState === 'attendant') {
    if (msg.body.match(/(encerrar|Encerrar)/i)) {
      await client.sendMessage(
        userId,
        'Obrigado por utilizar nosso serviço. Até logo!'
      );
      interactions.delete(userId); // Remove o estado do usuário
    } else if (!attendantAvailable) {
      await client.sendMessage(
        userId,
        'Por favor, aguarde. Um atendente já foi informado.'
      );
    }
  }
});
// Inicia o servidor
