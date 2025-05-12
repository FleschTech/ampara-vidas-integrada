
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { FileUp, Loader2, FilePlus } from 'lucide-react';

interface DocumentUploaderProps {
  caseId?: string;
  followupId?: string;
  onUploadComplete?: () => void;
}

export const DocumentUploader = ({ 
  caseId, 
  followupId,
  onUploadComplete 
}: DocumentUploaderProps) => {
  const { user } = useAuth();
  const { uploadCaseDocument, uploadFollowupDocument } = useDocuments();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !user) return;
    
    setUploading(true);
    
    try {
      if (caseId) {
        await uploadCaseDocument({
          case_id: caseId,
          file,
          uploaded_by: user.id,
          description: description || null
        });
      } else if (followupId) {
        await uploadFollowupDocument({
          followup_id: followupId,
          file,
          uploaded_by: user.id,
          description: description || null
        });
      }
      
      // Limpar formulário
      setFile(null);
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Notificar que upload foi concluído
      if (onUploadComplete) {
        onUploadComplete();
      }
    } finally {
      setUploading(false);
    }
  };
  
  if (!caseId && !followupId) {
    return null;
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document">Documento</Label>
            <Input
              ref={fileInputRef}
              id="document"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              disabled={uploading}
              required
            />
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: PDF, DOC, DOCX, JPG, JPEG, PNG. Tamanho máximo: 5MB
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descreva brevemente o conteúdo do documento"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={!file || uploading} 
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <FileUp className="mr-2 h-4 w-4" />
                Enviar Documento
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
