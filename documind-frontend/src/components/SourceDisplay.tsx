import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, FileText, Loader2, X } from 'lucide-react';

interface SourceDisplayProps {
  documentIds: string[];
  onClose: () => void;
}

interface DocumentChunkDetail {
  id: string;
  documentName: string;
  conteudoTexto: string;
  numeroPagina?: number;
}

const SourceDisplay: React.FC<SourceDisplayProps> = ({ documentIds, onClose }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sourcesDetails, setSourcesDetails] = useState<DocumentChunkDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSourceDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulação de busca de detalhes dos chunks/documentos
        const simulatedDetails: DocumentChunkDetail[] = documentIds.map((id, index) => ({
          id: id,
          documentName: `Documento Referência ${index + 1}.pdf`,
          conteudoTexto: `Este é um trecho de texto simulado do documento com ID ${id}. Ele demonstra o contexto recuperado do vetor de embeddings para fundamentar a resposta da IA.`,
          numeroPagina: index + 1,
        }));
        setSourcesDetails(simulatedDetails);
      } catch (err: any) {
        console.error('Erro ao buscar detalhes das fontes:', err);
        setError('Não foi possível carregar os detalhes das fontes.');
      } finally {
        setLoading(false);
      }
    };

    if (documentIds && documentIds.length > 0) {
      fetchSourceDetails();
    } else {
      setSourcesDetails([]);
      setLoading(false);
    }
  }, [documentIds]);

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  if (loading) {
    return (
      <div className="p-4 bg-dark-card rounded-lg shadow-lg mt-4 text-center text-gray-400 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin inline-block mr-2 text-dark-accent" />
        Carregando fontes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/20 border border-red-500 text-red-300 rounded-lg shadow-lg mt-4">
        <p>{error}</p>
      </div>
    );
  }

  if (sourcesDetails.length === 0) {
    return (
      <div className="p-4 bg-dark-card rounded-lg shadow-lg mt-4 text-center text-gray-400">
        Nenhuma fonte detalhada disponível.
      </div>
    );
  }

  return (
    <div className="p-4 bg-dark-card rounded-lg shadow-lg mt-4 border border-gray-700">
      <h3 className="text-xl font-bold text-dark-text mb-3 flex items-center justify-between">
        Fontes Utilizadas
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-dark-accent text-sm font-normal flex items-center transition-colors"
        >
          <X className="h-4 w-4 mr-1" />
          Fechar
        </button>
      </h3>
      {sourcesDetails.map((source) => (
        <div key={source.id} className="border border-gray-700 rounded-md mb-2 overflow-hidden">
          <button
            className="w-full flex justify-between items-center p-3 bg-gray-800 hover:bg-gray-700 transition-colors text-left"
            onClick={() => toggleExpand(source.id)}
          >
            <span className="flex items-center text-dark-text font-medium text-sm">
              <FileText className="h-4 w-4 mr-2 text-dark-highlight flex-shrink-0" />
              {source.documentName} {source.numeroPagina && `(Pág. ${source.numeroPagina})`}
            </span>
            {expanded === source.id ? (
              <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
            )}
          </button>
          {expanded === source.id && (
            <div className="p-3 border-t border-gray-700 bg-dark-bg text-gray-300 text-sm">
              <p className="whitespace-pre-wrap">{source.conteudoTexto}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SourceDisplay;