import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PdfUploadProps {
  onDocumentUploaded: (documentId: string) => void;
}

const PdfUpload: React.FC<PdfUploadProps> = ({ onDocumentUploaded }) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      setErrorMessage('Nenhum arquivo selecionado ou o tipo de arquivo não é PDF.');
      setUploadStatus('error');
      return;
    }

    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      setErrorMessage('Apenas arquivos PDF são permitidos.');
      setUploadStatus('error');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('idle');
    setFileName(file.name);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const totalSize = file.size;
      let uploaded = 0;
      const interval = setInterval(() => {
        uploaded += totalSize / 10;
        const progress = Math.min(100, Math.round((uploaded / totalSize) * 100));
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);

      const response = await fetch('http://localhost:8080/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro desconhecido no upload.');
      }

      const result = await response.text();
      const documentIdMatch = result.match(/ID: ([0-9a-fA-F-]+)/);

      if (documentIdMatch && documentIdMatch[1]) {
        onDocumentUploaded(documentIdMatch[1]);
        setUploadStatus('success');
      } else {
        throw new Error('ID do documento não encontrado na resposta.');
      }
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setErrorMessage(error.message || 'Falha no upload do documento.');
      setUploadStatus('error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onDocumentUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-dark-text mb-4">Upload de Documentos</h2>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-dark-accent bg-dark-card/50' : 'border-gray-700 hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-gray-500 mb-3" />
        <p className="text-lg text-gray-400">
          {isDragActive ? 'Solte o PDF aqui...' : 'Arraste e solte um PDF aqui, ou clique para selecionar'}
        </p>
        <p className="text-sm text-gray-500 mt-1">(Apenas arquivos .pdf)</p>
      </div>

      {uploading && (
        <div className="mt-4">
          <p className="text-dark-text">Enviando: {fileName}...</p>
          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
            <div
              className="bg-dark-accent h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mt-1">{uploadProgress}%</p>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="mt-4 flex items-center text-dark-highlight">
          <CheckCircle className="h-5 w-5 mr-2" />
          <p>Documento '{fileName}' enviado com sucesso!</p>
        </div>
      )}

      {uploadStatus === 'error' && errorMessage && (
        <div className="mt-4 flex items-center text-red-500">
          <XCircle className="h-5 w-5 mr-2" />
          <p>Erro: {errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default PdfUpload;