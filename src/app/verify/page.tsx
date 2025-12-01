import { VerificationTool } from '@/components/valuscan/verification-tool';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Price Verification Tool</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Snap a photo of any item to get its True Market Value instantly.
          </CardDescription>
        </CardHeader>
      </Card>
      <VerificationTool />
    </div>
  );
}
