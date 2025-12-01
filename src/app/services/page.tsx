import { ServiceRequestForm } from '@/components/valuscan/service-request-form';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ServicesPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card className="border-none shadow-none bg-transparent mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Request an Ambassador Service</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Need help with a bigger project? Our Ambassadors are here to assist with clean-outs, organization, and more.
          </CardDescription>
        </CardHeader>
      </Card>
      <ServiceRequestForm />
    </div>
  );
}
