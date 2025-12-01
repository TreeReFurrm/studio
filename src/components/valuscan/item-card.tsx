import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import type { MarketplaceItem } from '@/lib/data';
import { Button } from '../ui/button';

interface ItemCardProps {
  item: MarketplaceItem;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg rounded-lg">
      <Link href={`/marketplace/${item.id}`} className="block">
        <CardHeader className="p-0">
          <div className="aspect-square relative">
            <Image
              src={item.image.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={item.image.imageHint}
            />
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-4 flex-grow">
        <Link href={`/marketplace/${item.id}`} className="block">
          <h3 className="font-semibold truncate">{item.title}</h3>
        </Link>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-xl font-bold text-primary">${item.price.toFixed(2)}</p>
        <Button asChild size="sm">
          <Link href={`/marketplace/${item.id}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
