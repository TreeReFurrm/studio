import { dummyMarketplaceItems } from '@/lib/data';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Package, Truck, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function ItemDetailPage({ params }: { params: { itemId: string } }) {
  const item = dummyMarketplaceItems.find((i) => i.id === params.itemId);

  if (!item) {
    notFound();
  }

  return (
    <div>
      <Button asChild variant="outline" className="mb-6">
        <Link href="/marketplace">
          <ArrowLeft className="mr-2" />
          Back to Marketplace
        </Link>
      </Button>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <Card className="aspect-square relative overflow-hidden rounded-lg shadow-md">
          <Image
            src={item.image.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            data-ai-hint={item.image.imageHint}
          />
        </Card>
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold">{item.title}</h1>
            <p className="text-3xl font-bold text-primary">${item.price.toFixed(2)}</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-muted-foreground">{item.description}</p>
              <div className="flex items-center gap-2">
                <Tag className="text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Vintage</Badge>
                  <Badge variant="secondary">Furniture</Badge>
                  <Badge variant="secondary">Leather</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Button size="lg" className="w-full">Buy Now</Button>
            <Card className="bg-secondary/50">
              <CardContent className="p-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-primary" />
                  <div>
                    <h4 className="font-semibold">Pre-paid Shipping Label</h4>
                    <p className="text-sm text-muted-foreground">Generated upon purchase.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="h-6 w-6 text-primary" />
                  <div>
                    <h4 className="font-semibold">Local Pickup Available</h4>
                    <p className="text-sm text-muted-foreground">Schedule a pickup slot after purchase.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
