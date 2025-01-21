# Chatbot para WhatsApp do Consultório Odontológico

Este projeto é um chatbot para WhatsApp desenvolvido para um consultório odontológico especializado em facetas de resina. O bot oferece respostas automáticas para perguntas frequentes, agendamento de consultas e suporte com atendente ao vivo.

## Funcionalidades

- **Login com QR Code**: Conecte o bot a uma conta do WhatsApp escaneando um QR code.
- **Interação Baseada em Menu**: Os usuários podem interagir com o bot escolhendo opções de um menu pré-definido.
- **Respostas Automáticas**: Responde automaticamente a perguntas sobre detalhes dos serviços, preços e agendamentos.
- **Suporte com Atendente**: Transfere o usuário para um atendente ao vivo para assistência personalizada.
- **Gerenciamento de Sessão**: Acompanha as interações do usuário usando um sistema baseado em estados.
- **Reconexão**: Registra quando o bot é desconectado e solicita reconexão manual, se necessário.

---

## Instalação

### Pré-requisitos
- Node.js (v14 ou superior)
- npm (v6 ou superior)
- Conta no WhatsApp Web

### Passos

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/whatsapp-chatbot.git
   cd whatsapp-chatbot

2. Instale as dependências:
   ```bash
   npm install

3. Inicie o bot:
   ```bash
   node index.js

4.Escaneie o QR code exibido no terminal usando o WhatsApp no seu celular.

## Como Funciona
### Opções de Menu
 Quando o usuário envia uma mensagem como "Menu," "Oi" ou "Olá," o bot responde com o seguinte menu:
1. Como Funciona: Fornece informações sobre a durabilidade, manutenção e duração do procedimento de facetas de resina.
2. Valores: Compartilha informações sobre preços, promoções e opções de pagamento.
3. Agendamento: Orienta o usuário a agendar uma consulta.
4. Falar com um Atendente: Conecta o usuário a um atendente ao vivo para suporte.

###  Gerenciamento de Estados
O bot mantém uma sessão para cada usuário:
- Estado de Menu: Rastreamento da interação do usuário com o menu principal.
- Estado de Atendente: Indica quando um usuário é transferido para um atendente ao vivo.

### Reconexão
Caso o bot perca a conexão, ele registra o motivo da desconexão no terminal e permite reconexão manual.

## Estrutura de Arquivos
```bash

.
├── index.js       # Arquivo principal da aplicação
├── package.json   # Dependências e scripts
└── README.md      # Documentação
```
## Dependências
- whatsapp-web.js: Biblioteca para integração com a API do WhatsApp Web.
- qrcode-terminal: Gera QR codes diretamente no terminal.
- fs: Módulo do Node.js para manipulação de arquivos.

Instale todas as dependências usando:

```bash
npm install
```
## Uso
1. Inicie o bot executando:
 ```bash
node index.js
```
2. Abra o WhatsApp no seu celular e escaneie o QR code exibido no terminal.
3. Interaja com o bot enviando mensagens como "Oi" ou "Menu" para receber as opções disponíveis.

## Personalização
Você pode personalizar as respostas e as opções do menu editando o arquivo index.js. Por exemplo:
- Atualize as funções handleOptions1, handleOptions2, etc., para refletir seus serviços e preços.
- Altere o texto do menu no manipulador client.on('message').

## Solução de Problemas
### Problemas Comuns
1. Sessão Desconectada:
   - O bot registra o motivo da desconexão no terminal.
   - Reconecte reiniciando o bot e escaneando o QR code novamente.
2. Erros de Dependência:
   - Verifique se todas as dependências estão instaladas usando npm install.
3. QR Code Não Exibido:
   - Certifique-se de que você está conectado à internet e que o WhatsApp está acessível.

## Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests com melhorias ou correções de bugs.


