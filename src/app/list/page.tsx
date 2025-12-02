
'use client';
import { ListingForm } from '@/components/valuscan/listing-form';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';

function ListPageContent() {
  return (
    <div className="container mx-auto max-w-3xl py-8">
       <Card className="border-none shadow-none bg-transparent mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Review & List Your Item</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Confirm the details and choose whether to sell or donate.
          </CardDescription>
        </CardHeader>
      </Card>
      <ListingForm />
    </div>
  );
}

export default function ListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListPageContent />
    </Suspense>
  );
}

    