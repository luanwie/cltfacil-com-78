import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import cargosData from "@/data/cargos.json";
import ufsData from "@/data/ufs.json";

interface CargoUFSelectorProps {
  title?: string;
  description?: string;
}

const CargoUFSelector = ({ 
  title = "Acesso Rápido por Cargo e Estado",
  description = "Escolha seu cargo e estado para ir direto à calculadora personalizada"
}: CargoUFSelectorProps) => {
  const navigate = useNavigate();
  const [selectedCargo, setSelectedCargo] = useState<string>("");
  const [selectedUF, setSelectedUF] = useState<string>("");

  const handleNavigate = () => {
    if (selectedCargo && selectedUF) {
      // Telemetria
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'navigate_programmatic', {
          cargo: selectedCargo,
          uf: selectedUF
        });
      }
      
      navigate(`/clt/adicional-noturno/${selectedCargo}/${selectedUF.toLowerCase()}`);
    }
  };

  const canNavigate = selectedCargo && selectedUF;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo</Label>
            <Select value={selectedCargo} onValueChange={setSelectedCargo}>
              <SelectTrigger id="cargo">
                <SelectValue placeholder="Selecione um cargo" />
              </SelectTrigger>
              <SelectContent>
                {cargosData.map((cargo) => (
                  <SelectItem key={cargo.slug} value={cargo.slug}>
                    {cargo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="uf">Estado (UF)</Label>
            <Select value={selectedUF} onValueChange={setSelectedUF}>
              <SelectTrigger id="uf">
                <SelectValue placeholder="Selecione um estado" />
              </SelectTrigger>
              <SelectContent>
                {ufsData.map((uf) => (
                  <SelectItem key={uf.sigla} value={uf.sigla}>
                    {uf.nome} ({uf.sigla})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleNavigate} 
          disabled={!canNavigate}
          className="w-full"
        >
          <ArrowRight className="w-4 h-4" />
          Ir para Calculadora
        </Button>
      </CardContent>
    </Card>
  );
};

export default CargoUFSelector;