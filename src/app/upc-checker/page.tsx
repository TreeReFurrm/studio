
import { UpcChecker } from '@/components/valuscan/upc-checker';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UpcCheckerPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">UPC Deal Checker</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Enter a UPC and asking price to instantly evaluate profit and resale potential.
          </CardDescription>
        </CardHeader>
      </Card>
      <UpcChecker />
    </div>
  );
}
