import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Loader2, MessageSquare, Bot, User, Info } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  referencedDocuments?: string[];
}

interface ChatInterfaceProps {
  sessionId: string;
  onShowSources: (sources: string[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId, onShowSources }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/chat/${sessionId}`);
        if (!response.ok) {
          throw new Error('Falha ao carregar histórico do chat.');
        }
        const history = await response.json();
        const formattedHistory: ChatMessage[] = history.map((msg: any) => ({
          id: msg.id,
          sender: msg.tipoMensagem.toLowerCase() as 'user' | 'ai',
          text: msg.conteudoMensagem,
          timestamp: new Date(msg.dataHora).toLocaleTimeString(),
          referencedDocuments: msg.documentosReferenciados || [],
        }));
        setMessages(formattedHistory);
      } catch (err: any) {
        console.error('Erro ao carregar histórico:', err);
        setError('Não foi possível carregar o histórico do chat.');
      }
    };

    if (sessionId) {
      loadChatHistory();
    }
  }, [sessionId]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setError(null);

    try {
      const eventSource = new EventSource(`http://localhost:8080/api/chat/${sessionId}/ask`);
      let aiResponseText = '';
      const aiMessageId = Date.now().toString() + '-ai';

      eventSource.onmessage = (event) => {
        const token = event.data;
        aiResponseText += token;
        setMessages((prev) => {
          const existingAiMessageIndex = prev.findIndex((msg) => msg.id === aiMessageId);
          if (existingAiMessageIndex > -1) {
            const updatedMessages = [...prev];
            updatedMessages[existingAiMessageIndex] = {
              ...updatedMessages[existingAiMessageIndex],
              text: aiResponseText,
            };
            return updatedMessages;
          } else {
            return [
              ...prev,
              {
                id: aiMessageId,
                sender: 'ai',
                text: aiResponseText,
                timestamp: new Date().toLocaleTimeString(),
              },
            ];
          }
        });
      };

      eventSource.onerror = (err) => {
        console.error('EventSource failed:', err);
        eventSource.close();
        setIsTyping(false);
        setError('Erro na conexão com o chat. Tente novamente.');
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.sender === 'ai' && lastMessage.id === aiMessageId) {
            return prev;
          } else {
            return [
              ...prev,
              {
                id: Date.now().toString(),
                sender: 'ai',
                text: 'Desculpe, houve um erro ao gerar a resposta. Por favor, tente novamente.',
                timestamp: new Date().toLocaleTimeString(),
              },
            ];
          }
        });
      };

      eventSource.onopen = () => {
        console.log('EventSource connected.');
      };

      eventSource.addEventListener('end', () => {
        console.log('Streaming ended by backend.');
        eventSource.close();
        setIsTyping(false);
      });
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);
      setError(err.message || 'Falha ao enviar mensagem.');
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-card rounded-lg shadow-lg">
      <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare className="h-16 w-16 mb-4" />
            <p className="text-lg">Comece uma conversa com o DocuMind!</p>
            <p className="text-sm">Faça uma pergunta sobre seus documentos.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <Bot className="h-8 w-8 text-dark-accent mr-3 flex-shrink-0" />
              )}
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-dark-accent text-white rounded-br-none'
                    : 'bg-gray-700 text-dark-text rounded-bl-none'
                }`}
              >
                <div className="font-bold text-sm mb-1">
                  {msg.sender === 'user' ? 'Você' : 'DocuMind'}
                  <span className="ml-2 text-xs text-gray-400">{msg.timestamp}</span>
                </div>
                <div className="prose prose-invert max-w-none">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {msg.text}
  </ReactMarkdown>
</div>
                {msg.sender === 'ai' && msg.referencedDocuments && msg.referencedDocuments.length > 0 && (
                  <button
                    onClick={() => onShowSources(msg.referencedDocuments || [])}
                    className="mt-2 text-xs text-dark-highlight hover:underline flex items-center"
                  >
                    <Info className="h-3 w-3 mr-1" /> Ver fontes
                  </button>
                )}
              </div>
              {msg.sender === 'user' && (
                <User className="h-8 w-8 text-dark-highlight ml-3 flex-shrink-0" />
              )}
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex items-start mb-4 justify-start">
            <Bot className="h-8 w-8 text-dark-accent mr-3 flex-shrink-0" />
            <div className="max-w-[70%] p-3 rounded-lg bg-gray-700 text-dark-text">
              <div className="font-bold text-sm mb-1">DocuMind</div>
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin text-dark-accent mr-2" />
                <span className="text-sm">Digitando...</span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-500 text-center mt-4">{error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex p-4 border-t border-gray-700">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Faça uma pergunta sobre seus documentos..."
          className="flex-grow p-3 rounded-l-lg bg-gray-800 text-dark-text border border-gray-700 focus:outline-none focus:border-dark-accent"
          disabled={isTyping}
        />
        <button
          type="submit"
          className="bg-dark-accent text-white p-3 rounded-r-lg hover:bg-dark-highlight transition-colors disabled:opacity-50"
          disabled={isTyping}
        >
          {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;