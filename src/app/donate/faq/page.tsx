
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const faqSections = {
    "Donation Basics": [
        {
            question: "What types of items can I donate?",
            answer: "Most household goods, furniture, electronics, décor, clothing, shoes, books, toys, and small appliances that are clean and safe."
        },
        {
            question: "What items can you not accept?",
            answer: "Items that are moldy, infested, broken beyond light repair, hazardous materials, expired food, or anything unsafe for resale."
        },
        {
            question: "Do I need to clean items before donating?",
            answer: "No, but it helps. Every item goes through an intake standard for cleaning and basic prep before resale."
        },
        {
            question: "Do you pick up donations?",
            answer: "Yes. Pickup is available through Ambassador Service scheduling in eligible ZIP codes."
        }
    ],
    "Ownership and Legality": [
        {
            question: "Can I donate items from a storage unit I do not rent or own?",
            answer: "No. Only the verified renter or authorized legal party can donate items from a unit. Ambassadors are trained to request verification before processing."
        },
        {
            question: "What if I think an item was stolen?",
            answer: "If any item appears stolen, we freeze it, document it, and comply with verified law enforcement requests or legal instructions."
        }
    ],
    "Data and Electronics": [
        {
            question: "What happens to personal data on electronics?",
            answer: "All donated electronics go through industry standard data wipe before resale. If we cannot wipe a device safely, it is recycled instead of sold."
        }
    ],
    "Money And Impact": [
        {
            question: "Where do donation proceeds go?",
            answer: "Donation proceeds support the LEAN Foundation hardship fund, item returns to original owners, and operational support for ethical salvage."
        },
        {
            question: "Will I get a tax receipt?",
            answer: "Once nonprofit status is live, donation receipts will be available under “Donation History” in your account."
        },
        {
            question: "How can I see the impact of my donation?",
            answer: "Inside the app, impact summaries show anonymized stats like users assisted, funds allocated to hardship, and sentimental items successfully returned."
        }
    ],
    "Timeline": [
        {
            question: "How quickly will my items be listed?",
            answer: "Most items are listed within 72 hours after intake. Some specialty items may take longer due to additional research or photography needs."
        }
    ]
};

type FaqSection = keyof typeof faqSections;

export default function DonationFaqPage() {
  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-8">
        <header className="text-center">
            <h1 className="text-4xl font-bold tracking-tight mt-2">Donation FAQ</h1>
            <p className="text-xl text-muted-foreground">Everything you need to know before you donate.</p>
        </header>

        {Object.keys(faqSections).map(section => (
        <Card key={section}>
            <CardHeader>
                <CardTitle>{section}</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {(faqSections[section as FaqSection]).map((item, index) => (
                        <AccordionItem value={`item-${section}-${index}`} key={index}>
                            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                            <AccordionContent>
                            {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
      ))}
      <footer className="text-center text-sm text-muted-foreground pt-4 border-t">
        For hardship related support, contact <a href="mailto:lean@refurrm.org" className="text-primary underline">lean@refurrm.org</a>.
      </footer>
    </div>
  );
}
