import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import React from "react";

interface AccordionItemData {
    title: string;
    content: React.ReactNode;
}

interface AccordionProps {
    items: AccordionItemData[];
}

const BootstrapAccordion: React.FC<AccordionProps> = ({ items }) => {
    return (
        <Accordion defaultValue={["item-0"]} className="w-full">
            {items.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border-x-0 rounded-none">
                    <AccordionTrigger className="px-0 hover:no-underline">
                        <span className="text-lg font-semibold py-2">{item.title}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 pt-2 pb-4">
                        {item.content}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
};

export default BootstrapAccordion;
