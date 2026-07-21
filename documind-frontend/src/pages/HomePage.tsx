import React, { useState, useEffect } from 'react';
import { BrainCircuit, FileText, Sparkles, Loader2 } from 'lucide-react';
import PdfUpload from '../components/PdfUpload';
import ChatInterface from '../components/ChatInterface';
import SourceDisplay from '../components/SourceDisplay';



const HomePage: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uploadedDocumentIds, setUploadedDocumentIds] = useState<string[]>([]);
  const [showSources, setShowSources] = useState<boolean>(false);
  const [currentSources, setCurrentSources] = useState<string[]>([]);

  useEffect(() => {
    const startSession = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/chat/new-session');
        if (!response.ok) {
          throw new Error('Falha ao iniciar nova sessão.');
        }
        const newSessionId = await response.json();
        setSessionId(newSessionId);
      } catch (err) {
        console.error('Erro ao iniciar sessão:', err);
      }
    };
    startSession();
  }, []);

  const handleDocumentUploaded = (documentId: string) => {
    setUploadedDocumentIds((prev) => [...prev, documentId]);
  };

  const handleShowSources = (sources: string[]) => {
    setCurrentSources(sources);
    setShowSources(true);
  };

  const handleCloseSources = () => {
    setShowSources(false);
    setCurrentSources([]);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-dark-card/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-dark-accent/10 rounded-lg border border-dark-accent/20">
            <BrainCircuit className="h-6 w-6 text-dark-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              DocuMind <span className="text-xs px-2 py-0.5 rounded-full bg-dark-accent/20 text-dark-accent border border-dark-accent/30 font-medium">AI RAG</span>
            </h1>
            <p className="text-xs text-gray-400">Assistente Inteligente de Documentos Corporativos</p>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-81px)]">
        {/* Painel Esquerdo: Ingestão e Status de Documentos */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-1">
          <PdfUpload onDocumentUploaded={handleDocumentUploaded} />

          {uploadedDocumentIds.length > 0 && (
            <div className="bg-dark-card p-6 rounded-lg shadow-lg border border-gray-800">
              <h2 className="text-lg font-bold text-dark-text mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-dark-highlight" />
                Documentos Ingestados
              </h2>
              <ul className="space-y-2">
                {uploadedDocumentIds.map((id) => (
                  <li
                    key={id}
                    className="p-3 bg-gray-800/60 rounded-md border border-gray-700/50 text-xs text-gray-300 flex items-center justify-between font-mono"
                  >
                    <span className="truncate mr-2">ID: {id}</span>
                    <span className="h-2 w-2 rounded-full bg-dark-highlight flex-shrink-0 animate-pulse"></span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showSources && (
            <SourceDisplay
              documentIds={currentSources}
              onClose={handleCloseSources}
            />
          )}
        </div>

        {/* Painel Direito: Interface do Chat */}
        <div className="lg:col-span-8 h-full flex flex-col min-h-[500px]">
          {sessionId ? (
            <ChatInterface
              sessionId={sessionId}
              onShowSources={handleShowSources}
            />
          ) : (
            <div className="flex-1 bg-dark-card rounded-lg shadow-lg flex flex-col items-center justify-center p-8 text-center border border-gray-800">
              <Loader2 className="h-10 w-10 text-dark-accent animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-300">Iniciando sessão de chat...</p>
              <p className="text-sm text-gray-500 mt-1">Conectando ao serviço DocuMind RAG</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;