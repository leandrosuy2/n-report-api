import React, { useEffect, useRef, useState } from 'react';
import { X, Send, Paperclip, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  userId?: string;
  user_id?: string;
  userName?: string;
  created_at: string;
  type?: 'text' | 'image' | 'system';
  image_url?: string | null;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  occurrenceId: string;
  userId: string;
  token: string;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  occurrenceId,
  userId,
  token
}) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const wsRef = useRef<WebSocket | null>(null);
  const chatIdRef = useRef<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsModalOpen(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsModalOpen(false);
    onClose();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isModalOpen) {
      if (wsRef.current) {
        wsRef.current.close();
      }
      setIsConnected(false);
      setError(null);
      chatIdRef.current = null;
      return;
    }

    const loadChat = async () => {
      try {
        if (!occurrenceId || !token) {
          setError('Dados necessários não fornecidos');
          return;
        }

        // Fecha conexão anterior se existir
        if (wsRef.current) {
          wsRef.current.close();
        }

        // Requisição para obter/criar o chat
        const chatResponse = await fetch(`http://localhost:3000/api/v1/ocurrences/${occurrenceId}/chat`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const chatData = await chatResponse.json();

        if (chatData.message === "Já existe um chat para esta ocorrência") {
          // Se já existe um chat, usa as informações dele
          const chatId = chatData.chat.id;
          chatIdRef.current = chatId;

          // Carregar mensagens do chat existente
          const messagesResponse = await fetch(`http://localhost:3000/api/v1/chats/${chatId}/messages`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            const formattedMessages = messagesData.map((msg: any) => ({
              id: msg.id,
              content: msg.content,
              userId: msg.user_id,
              userName: msg.user_id === userId ? 'Você' : 'Usuário',
              created_at: msg.created_at,
              type: msg.type || 'text',
              image_url: msg.image_url
            }));

            setMessages(formattedMessages);
          }
        } else if (chatData.id) {
          // Se é um chat novo
          chatIdRef.current = chatData.id;
        } else {
          setError('Erro ao obter chat');
          return;
        }

        // Conecta ao WebSocket
        const wsInstance = new WebSocket(`ws://localhost:3000?chatId=${chatIdRef.current}&userId=${userId}&token=${token}`);
        
        wsInstance.onopen = () => {
          setIsConnected(true);
          setError(null);
          
          wsInstance.send(JSON.stringify({
            type: 'JOIN_CHAT',
            chatId: chatIdRef.current,
            userId: userId,
            userName: 'Você'
          }));
        };

        wsInstance.onclose = () => {
          setIsConnected(false);
        };

        wsInstance.onerror = () => {
          setError('Erro na conexão');
          setIsConnected(false);
        };

        wsInstance.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            switch(data.type) {
              case 'WELCOME':
                break;
                
              case 'CHAT_CONNECTED':
                setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  content: `${data.userName || 'Usuário'} entrou na conversa`,
                  userId: 'system',
                  created_at: new Date().toISOString(),
                  type: 'system'
                }]);
                break;
                
              case 'ERROR':
                setError(data.message);
                break;
                
              case 'NEW_MESSAGE':
                const message = data.message;
                setMessages(prev => {
                  if (prev.some(m => m.id === message.id)) return prev;
                  return [...prev, {
                    id: message.id,
                    content: message.content,
                    userId: message.user_id,
                    userName: message.user_id === userId ? 'Você' : 'Usuário',
                    created_at: message.created_at,
                    type: message.type || 'text',
                    image_url: message.image_url
                  }];
                });
                break;
                
              case 'CHAT_CLOSED':
                setError('Este chat foi fechado.');
                break;
            }
          } catch (error) {
            console.error('Erro ao processar mensagem:', error);
          }
        };

        wsRef.current = wsInstance;
      } catch (error) {
        console.error('Erro ao conectar:', error);
        setError('Erro ao conectar ao chat');
      }
    };

    loadChat();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isModalOpen, occurrenceId, userId, token]);

  const sendMessage = () => {
    if (!newMessage.trim() || !wsRef.current || !chatIdRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const messageData = {
      type: 'CHAT_MESSAGE',
      chatId: chatIdRef.current,
      content: newMessage,
      userId: userId,
      userName: 'Você'
    };

    wsRef.current.send(JSON.stringify(messageData));
    setNewMessage('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !wsRef.current || !chatIdRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const messageData = {
        type: 'CHAT_MESSAGE',
        chatId: chatIdRef.current,
        content: e.target?.result,
        userId: userId,
        messageType: 'image',
        userName: 'Você'
      };

      wsRef.current?.send(JSON.stringify(messageData));
    };
    reader.readAsDataURL(file);
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">Chat da Ocorrência</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.userId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.type === 'system'
                    ? 'bg-gray-100 text-gray-600 text-center w-full text-sm italic'
                    : message.userId === userId
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {message.type !== 'system' && (
                  <div className={`text-sm mb-1 ${
                    message.userId === userId
                      ? 'text-blue-100'
                      : 'text-gray-500'
                  }`}>
                    {message.userName}
                  </div>
                )}
                {(message.type === 'image' || message.content?.startsWith('data:image')) ? (
                  <img
                    src={message.image_url || message.content}
                    alt="Imagem compartilhada"
                    className="mt-2 max-w-full rounded-lg shadow-sm"
                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                  />
                ) : (
                  <p className="break-words leading-relaxed">{message.content}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Digite sua mensagem..."
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              disabled={!isConnected || !chatIdRef.current}
            />
            <input
              type="file"
              id="image-input"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={!isConnected || !chatIdRef.current}
            />
            <button
              onClick={() => document.getElementById('image-input')?.click()}
              className="p-3 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
              disabled={!isConnected || !chatIdRef.current}
            >
              <Paperclip className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={sendMessage}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              disabled={!isConnected || !chatIdRef.current}
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal; 