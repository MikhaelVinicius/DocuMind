import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, FileText, Loader2, X } from 'lucide-react';

interface SourceDisplayProps {
  documentIds: string[];
  onClose: () => void;
}

interface DocumentDetail {
  id: string;
  nome: string;
  tamanhoBytes: number;
}

const SourceDisplay: React.FC<SourceDisplayProps> = ({ documentIds, onClose }) => {
  const [sourcesDetails, setSourcesDetails] = useState<DocumentDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSourceDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8080/api/documents/details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(documentIds)
        });
        
        if (!response.ok) throw new Error("Erro na comunicação com o servidor.");
        
        const data = await response.json();
        setSourcesDetails(data);
      } catch (err: any) {
        console.error('Erro ao buscar detalhes das fontes:', err);
        setError('Não foi possível carregar os detalhes das fontes reais.');
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

  if (loading) {
    return (
      <div className="p-4 bg-dark-card rounded-lg shadow-lg mt-4 text-center text-gray-400 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin inline-block mr-2 text-dark-accent" />
        Buscando documentos base...
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

  return (
    <div className="p-4 bg-dark-card rounded-lg shadow-lg mt-4 border border-gray-700">
      <h3 className="text-xl font-bold text-dark-text mb-3 flex items-center justify-between">
        Documentos Base Consultados
        <button onClick={onClose} className="text-gray-400 hover:text-dark-accent text-sm font-normal flex items-center transition-colors">
          <X className="h-4 w-4 mr-1" /> Fechar
        </button>
      </h3>
      {sourcesDetails.map((source) => (
        <div key={source.id} className="border border-gray-700 rounded-md mb-2 overflow-hidden p-3 bg-gray-800 text-left">
            <span className="flex items-center text-dark-text font-medium text-sm mb-1">
              <FileText className="h-4 w-4 mr-2 text-dark-highlight flex-shrink-0" />
              {source.nome}
            </span>
            <span className="text-xs text-gray-400 ml-6">
               ID Referência: {source.id.substring(0, 8)}... | Tamanho: {(source.tamanhoBytes / 1024).toFixed(2)} KB
            </span>
        </div>
      ))}
    </div>
  );
};

export default SourceDisplay;