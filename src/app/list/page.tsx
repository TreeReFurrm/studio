import { ListingForm } from '@/components/valuscan/listing-form';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ListPage() {
  return (
    <div className="container mx-auto max-w-3xl py-8">
       <Card className="border-none shadow-none bg-transparent mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Create a New Listing</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Let our AI do the heavy lifting. Just provide a photo to get started.
          </CardDescription>
        </CardHeader>
      </Card>
      <ListingForm />
    </div>
  );
}
