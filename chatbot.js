const http = require('http');
// Define a porta a partir da variável de ambiente ou usa a porta 3000 como padrão
const express = require('express');
const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js'); // Mudança Buttons

const app = express();
const PORT = process.env.PORT || 3004;

// Faz o servidor escutar na porta especificada
const server = app.listen(PORT, () => {
  console.log(`✅Servidor rodando na porta ${PORT}`);
  console.log(
    `🌐Acesse http://localhost:${PORT} para verificar o funcionamento.`
  );
});
// Impede que o Render mate a aplicação por inatividade
server.keepAliveTimeout = 60 * 1000;
server.headersTimeout = 65 * 1000;

// Tratamento de erros relacionados à porta
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `❌A porta ${PORT} já está em uso. Por favor, tente uma porta diferente.`
    );
    process.exit(1);
  } else {
    throw err;
  }
});

// ✅ Configuração do WhatsApp Web
const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'chatbot-deploy' }),
  puppeteer: {
    headless: true,
    executablePath: process.env.CHROME_BIN || null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--disable-gpu',
      '--disable-features=site-per-process',
      '--disable-extensions',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-blink-features=AutomationControlled' // Faz o Puppeteer parecer um navegador normal
    ]
  }
});

// Variável para armazenar o QR Code
let qrCodeData = '';

// Variável para rastrear a disponibilidade de um atendente
let attendantAvailable = false;

// serviço de leitura do qr code
client.on('qr', async (qr) => {
  console.log('🔄 Novo QR Code gerado. Atualizando imediatamente...');
  qrCodeData = qr; // Atualiza para o novo QR Code válido

  const startTime = Date.now(); // Início do monitoramento de tempo

  try {
    const qrCodeImage = await qrcode.toDataURL(qrCodeData);
    const endTime = Date.now(); // Fim do monitoramento de tempo
    console.log(`✅ QR Code atualizado e pronto! Tempo de geração: ${endTime - startTime} ms`);
  } catch (error) {
    console.error('❌ Erro ao gerar QR Code:', error);
  }
});

// apos isso ele diz que foi tudo certo
client.on('ready', () => {
  console.log('WhatsApp conectado com sucesso!');
  qrCodeData = ''; // Limpa o QR Code quando conectado
});

client.on('authenticated', () => {
  console.log('🔑 Cliente autenticado com sucesso!');
});
client.on('auth_failure', (msg) => {
  console.error('❌ Falha na autenticação:', msg);
  setTimeout(() => client.initialize(), 5000); // Tenta reconectar após 5s
});

// Evento disparado quando o cliente perde a conexão
client.on('disconnected', (reason) => {
  console.log(`⚠️ WhatsApp desconectado: ${reason}`)
  qrCodeData = ''; // Limpa o QR Code antigo
  console.log('🔄 Tentando reconectar em 5 segundos...');
  setTimeout(() => {
    client.initialize();
  }, 5000); // Aguarda 5 segundos antes de reiniciar
});

// ✅ Ping para evitar que Render mate o processo
setInterval(() => {
  console.log('🔄 Mantendo o bot ativo...');
}, 50000); // A cada 50 segundos

// ✅ Monitoramento de mensagens recebidas
client.on('message', async (msg) => {
  if (!client.info?.wid) {
    console.log('❌ O bot ainda não está conectado ao WhatsApp.');
    return;
  }
  console.log(
    `📩 Mensagem recebida de ${msg.from}: ${msg.body}`
  );
});

// Rota para exibir o link do QR Code
app.get('/', (req, res) => {
  console.log(' 🌐Rota principal acessada');
  console.log('Estado do QR Code:', qrCodeData); // Log do estado do QR Code
  if (!qrCodeData) {
    return res.status(200).send(
      `
         <div style="text-align: center; margin-top: 50px;">
        <h1>O QR Code ainda não está disponível. Tente novamente em alguns segundos.</h1>
        <p>Se o QR Code não aparecer em alguns segundos, <a href="/start">clique aqui</a> para reiniciar.</p>
        <script>
        setTimeout(() => { window.location.reload(); }, 10000); // Aumentando o tempo de atualização para 10 segundos
      </script>
      </div>
      `
    );
  }
  console.log('Redirecionando para /qrcode'); // Log de redirecionamento
  return res.redirect('/qrcode');
});

app.get('/start', (req, res) => {
  client.initialize(); // Inicializa o cliente e gera o QR Code
  return res.redirect('/'); // Redireciona imediatamente
});

// Adicionando uma nova rota para inicializar o QR Code
app.get('/qrcode', async (req, res) => {
  console.log('🌐 Rota /qrcode acessada');
  if (!qrCodeData) return res.redirect('/');

  try {
    const qrCodeImage = await qrcode.toDataURL(qrCodeData);
    res.status(200).send(`
      <div style="text-align: center; margin-top: 50px;">
        <h1>Escaneie o QR Code abaixo para conectar o WhatsApp</h1>
        <img src="${qrCodeImage}" alt="QR Code" style="width: 300px; height: 300px;" />
        <p>Se o QR Code expirar, a página será atualizada automaticamente.</p>
        <script>setTimeout(() => { window.location.reload(); }, 30000);</script>
      </div>
    `);
  } catch (error) {
    console.error('❌ Erro ao gerar QR Code:', error);
    res.status(500).send('<h1>Erro ao gerar QR Code. Tente novamente mais tarde.</h1>');
  }
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
      await delay(2000);
      await chat.sendStateTyping();
      await delay(2000);
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
