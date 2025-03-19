import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';

// Armazenar todas as conexões ativas
const clients = new Set<WebSocket>();

let wss: WebSocketServer;

export const initializeWebSocket = (server: HttpServer) => {
    console.log("🔄 Inicializando WebSocket Server...");
    
    wss = new WebSocketServer({ server });

    // Função para enviar mensagem para todos os clientes conectados
    const broadcast = (data: any) => {
        const message = JSON.stringify(data);
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    };

    // Função que lida com as conexões WebSocket
    wss.on('connection', (ws) => {
        console.log('🔌 Nova conexão WebSocket estabelecida');
        
        // Adicionar novo cliente ao conjunto de conexões
        clients.add(ws);

        // Enviar mensagem de boas-vindas
        ws.send(JSON.stringify({
            type: 'WELCOME',
            message: 'Conexão estabelecida com sucesso!',
            timestamp: new Date().toISOString()
        }));

        // Lidar com mensagens recebidas do cliente
        ws.on('message', (message) => {
            console.log('📩 Mensagem recebida:', message.toString());
            
            try {
                const data = JSON.parse(message.toString());
                console.log('📨 Dados recebidos:', data);
            } catch (error) {
                console.error('❌ Erro ao processar mensagem:', error);
            }
        });

        // Lidar com desconexão do cliente
        ws.on('close', () => {
            console.log('❌ Cliente desconectado');
            clients.delete(ws);
        });

        // Lidar com erros
        ws.on('error', (error) => {
            console.error('❌ Erro na conexão WebSocket:', error);
            clients.delete(ws);
        });
    });

    console.log('✅ WebSocket Server inicializado com sucesso!');
    return wss;
};

export const emitOcurrence = (data: any) => {
    if (!wss || clients.size === 0) {
        console.log('❌ Nenhum cliente WebSocket conectado');
        return;
    }

    try {
        console.log('📡 Emitindo nova ocorrência para', clients.size, 'clientes');
        
        const message = JSON.stringify({
            type: 'NEW_OCURRENCE',
            data,
            timestamp: new Date().toISOString()
        });

        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });

        console.log('✅ Ocorrência emitida com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao emitir ocorrência:', error);
    }
}; 