import SaveCalcModal from "./SaveCalcModal";

type Props = {
  calculator: string;       // ex: "adicional_noturno"
  calculationType: string;  // ex: "adicional_noturno"
  input: unknown;           // dados de entrada do cálculo
  result: unknown;          // resultado do cálculo
  note?: string;            // observação opcional
  disabled?: boolean;
};

export default function SaveCalcButton({ calculator, calculationType, input, result, note, disabled }: Props) {
  return (
    <SaveCalcModal
      calculator={calculator}
      calculationType={calculationType}
      input={input}
      result={result}
      disabled={disabled}
    />
  );
}
