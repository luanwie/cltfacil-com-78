import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
  className?: string;
}

const FAQ = ({ items, title = "Perguntas Frequentes", className }: FAQProps) => {
  return (
    <div className={className}>
      {title && (
        <h2 className="text-2xl font-semibold mb-6 text-foreground">
          {title}
        </h2>
      )}
      <Accordion type="single" collapsible className="w-full">
        {items.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FAQ;