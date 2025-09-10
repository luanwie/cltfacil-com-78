import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface LogoUploadProps {
  onLogoUploaded: (logoUrl: string) => void;
  currentLogoUrl?: string;
}

export const LogoUpload = ({ onLogoUploaded, currentLogoUrl }: LogoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(currentLogoUrl || null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar um arquivo para upload.');
      }

      const file = event.target.files[0];
      
      // Validar tipo de arquivo
      if (!file.type.includes('image/')) {
        throw new Error('Arquivo deve ser uma imagem (PNG, JPG, JPEG).');
      }

      // Validar tamanho (máx 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Arquivo deve ter no máximo 2MB.');
      }

      if (!user) {
        throw new Error('Usuário não autenticado.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      // Atualizar perfil com URL da logo
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ logo_url: urlData.publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      setLogoPreview(urlData.publicUrl);
      onLogoUploaded(urlData.publicUrl);

      toast({
        title: "Logo enviada com sucesso!",
        description: "Sua logo será incluída nos PDFs exportados.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar logo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = async () => {
    try {
      if (!user) return;

      // Remover do storage
      if (logoPreview) {
        const fileName = `${user.id}/logo.${logoPreview.split('.').pop()}`;
        await supabase.storage
          .from('company-logos')
          .remove([fileName]);
      }

      // Atualizar perfil
      const { error } = await supabase
        .from('profiles')
        .update({ logo_url: null })
        .eq('user_id', user.id);

      if (error) throw error;

      setLogoPreview(null);
      onLogoUploaded('');

      toast({
        title: "Logo removida",
        description: "A logo foi removida dos seus PDFs.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover logo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {logoPreview ? (
        <div className="relative">
          <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/50">
            <img 
              src={logoPreview} 
              alt="Logo da empresa" 
              className="w-8 h-8 object-contain rounded"
            />
            <span className="text-sm text-foreground">Logo carregada</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeLogo}
              className="ml-auto text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="logo-upload"
          />
          <label htmlFor="logo-upload">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={uploading}
              asChild
              className="cursor-pointer w-full sm:w-auto"
            >
              <span>
                {uploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Adicionar Logo
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      )}
    </div>
  );
};