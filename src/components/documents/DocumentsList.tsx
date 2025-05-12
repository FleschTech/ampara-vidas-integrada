
import { useState, useEffect } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Eye, Download, FileQuestion, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { CaseDocument, FollowupDocument } from '@/types';

interface DocumentsListProps {
  caseId?: string;
  followupId?: string;
  refreshTrigger?: number;
}

export const DocumentsList = ({ 
  caseId, 
  followupId,
  refreshTrigger = 0 
}: DocumentsListProps) => {
  const { listCaseDocuments, listFollowupDocuments, getDocumentUrl } = useDocuments();
  const [documents, setDocuments] = useState<(CaseDocument | FollowupDocument)[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Carregar documentos
  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      
      try {
        let docs: (CaseDocument | FollowupDocument)[] = [];
        
        if (caseId) {
          docs = await listCaseDocuments(caseId);
        } else if (followupId) {
          docs = await listFollowupDocuments(followupId);
        }
        
        setDocuments(docs);
      } finally {
        setLoading(false);
      }
    };
    
    loadDocuments();
  }, [caseId, followupId, listCaseDocuments, listFollowupDocuments, refreshTrigger]);
  
  // Abrir documento para visualização
  const handleViewDocument = async (filePath: string) => {
    const url = await getDocumentUrl(filePath);
    if (url) {
      window.open(url, '_blank');
    }
  };
  
  // Baixar documento
  const handleDownloadDocument = async (filePath: string, fileName: string) => {
    const url = await getDocumentUrl(filePath);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  // Ícone baseado no tipo do arquivo
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-10 w-10 text-red-500" />;
    } else if (fileType.includes('image')) {
      return <FileText className="h-10 w-10 text-blue-500" />;
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return <FileText className="h-10 w-10 text-indigo-500" />;
    } else {
      return <FileQuestion className="h-10 w-10 text-gray-500" />;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Documentos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Nenhum documento encontrado</p>
            <p className="text-sm">Faça o upload de documentos usando o formulário acima</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-md">
                <div className="flex-shrink-0">
                  {getFileIcon(doc.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.file_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Enviado em {format(new Date(doc.uploaded_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                  {doc.description && (
                    <p className="text-sm mt-1">{doc.description}</p>
                  )}
                </div>
                <div className="flex-shrink-0 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewDocument(doc.file_path)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadDocument(doc.file_path, doc.file_name)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Baixar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
