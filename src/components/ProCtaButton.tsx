import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ProCtaButton() {
  const navigate = useNavigate();

  return (
    <Button
      className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
      onClick={() => navigate("/assinar-pro")}
    >
      Virar PRO 🚀
    </Button>
  );
}
