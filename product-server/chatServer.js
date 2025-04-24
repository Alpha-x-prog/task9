const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 3003 });

// Хранилище подключений
const clients = new Map();
const chatHistoryFile = 'chat_history.json';

// Загружаем историю чата при старте сервера
let chatHistory = [];
if (fs.existsSync(chatHistoryFile)) {
    chatHistory = JSON.parse(fs.readFileSync(chatHistoryFile, 'utf8'));
}

wss.on('connection', (ws, req) => {
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'init') {
                // Инициализация соединения
                ws.userId = data.userId;
                ws.role = data.role; // 'customer' или 'admin'
                clients.set(data.userId, ws);
                console.log(`User connected: ${data.userId} as ${data.role}`);

                // Отправка истории сообщений
                ws.send(JSON.stringify({ type: 'history', history: chatHistory }));
            }

            if (data.type === 'message') {
                const chatMessage = { from: data.userId, to: data.to, message: data.message, timestamp: new Date().toISOString() };
                chatHistory.push(chatMessage);
                fs.writeFileSync(chatHistoryFile, JSON.stringify(chatHistory, null, 2));

                console.log(`Message from ${data.userId} to ${data.to}: ${data.message}`);
                
                const recipient = clients.get(data.to);
                if (recipient) {
                    recipient.send(JSON.stringify(chatMessage));
                }
                
                // Отправка сообщения отправителю
                if (clients.has(data.userId)) {
                    clients.get(data.userId).send(JSON.stringify(chatMessage));
                }
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        clients.delete(ws.userId);
        console.log(`User disconnected: ${ws.userId}`);
    });
});

console.log('WebSocket server is running on ws://localhost:3003');
