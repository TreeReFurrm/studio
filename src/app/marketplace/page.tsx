import { dummyMarketplaceItems } from '@/lib/data';
import { ItemCard } from '@/components/valuscan/item-card';

export default function MarketplacePage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">ValuScan Exchange</h1>
        <p className="text-muted-foreground">Discover unique items from the community.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {dummyMarketplaceItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
