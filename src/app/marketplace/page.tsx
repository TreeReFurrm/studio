'use client';
import { ItemCard } from '@/components/valuscan/item-card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Item } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

export default function MarketplacePage() {
  const firestore = useFirestore();
  const itemsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'items'), orderBy('createdAt', 'desc')) : null,
    [firestore]
  );
  const { data: items, isLoading } = useCollection<Item>(itemsQuery);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">ReFurrm Exchange</h1>
        <p className="text-muted-foreground">Discover unique items from the community.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading && Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[250px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        ))}
        {!isLoading && items && items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
        {!isLoading && (!items || items.length === 0) && (
          <p className="col-span-full text-center text-muted-foreground">
            No items in the marketplace yet.
          </p>
        )}
      </div>
    </div>
  );
}
