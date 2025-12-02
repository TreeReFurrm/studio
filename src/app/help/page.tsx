
import { Chatbot } from '@/components/valuscan/chatbot';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HelpPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
       <Card className="border-none shadow-none bg-transparent mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">ReFURRM Assist</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Your in-app helper for SmartScan, Ambassador Services, donations, and auction prevention.
          </CardDescription>
        </CardHeader>
      </Card>
      <Chatbot />
    </div>
  );
}
