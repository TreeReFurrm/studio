
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RefurrbishGuidePage() {
  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight mt-2">ReFURRBISH An Item</h1>
        <p className="text-xl text-muted-foreground">Turn unused items into hardship relief, ethical resale, and second chances.</p>
        <div className="flex justify-center gap-4">
            <Button asChild>
                <Link href="/list">Start A Donation</Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/donate">Learn About LEAN Foundation</Link>
            </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>What ReFURRBISH Means</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            ReFURRBISH is the process where your donated items are cleaned, lightly repaired, valued with SmartScan, and listed for ethical resale.
          </p>
          <p className="font-semibold text-foreground">
            Proceeds fund the LEAN Foundation to help users facing storage auctions and housing-related hardship.
          </p>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Choose How Your Item Helps</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-semibold text-lg">Donation</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                    <li>You give the item to ReFURRM.</li>
                    <li>100% of net proceeds support the LEAN hardship fund and mission costs.</li>
                    <li>You may receive a tax receipt when nonprofit status is active.</li>
                </ul>
            </div>
             <div>
                <h3 className="font-semibold text-lg">Quiet Consignment</h3>
                 <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                    <li>Item is valuable and you prefer to earn from it.</li>
                    <li>ReFURRM handles intake, photography, listing, and sale.</li>
                    <li>You receive a percentage of the final sale.</li>
                    <li>Great for higher value or specialty items.</li>
                </ul>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How Donations Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><Badge variant="secondary" className="rounded-full h-8 w-8 flex items-center justify-center">1</Badge> Start A Donation</h3>
            <p className="text-muted-foreground border-l-2 ml-4 pl-6 mt-2">
              Select “Donate” in the app or through an Ambassador visit. Add notes if an item is emotionally significant or tied to a specific story.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><Badge variant="secondary" className="rounded-full h-8 w-8 flex items-center justify-center">2</Badge> Intake and Processing</h3>
            <p className="text-muted-foreground border-l-2 ml-4 pl-6 mt-2">Items are checked for safety and condition. We perform light cleaning and minor repairs. Items needing major restoration may be declined.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><Badge variant="secondary" className="rounded-full h-8 w-8 flex items-center justify-center">3</Badge> SmartScan Valuation</h3>
            <p className="text-muted-foreground border-l-2 ml-4 pl-6 mt-2">
              Market data is used to estimate a fair resale price. Items are tagged as ReFURRBISHED and assigned to the ReFURRM Exchange.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><Badge variant="secondary" className="rounded-full h-8 w-8 flex items-center justify-center">4</Badge> Listing And Sale</h3>
            <p className="text-muted-foreground border-l-2 ml-4 pl-6 mt-2">
              Items are photographed and listed in the Exchange. Most donations are listed within 72 hours of processing.
            </p>
          </div>
           <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><Badge variant="secondary" className="rounded-full h-8 w-8 flex items-center justify-center">5</Badge> Proceeds Allocation</h3>
             <div className="text-muted-foreground border-l-2 ml-4 pl-6 mt-2">
                <p>Net proceeds support:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>LEAN Foundation hardship grants</li>
                    <li>Item return costs for original owners</li>
                    <li>Supplies and tools for Ambassador projects</li>
                </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader><CardTitle>How Your Donation Moves Money</CardTitle></CardHeader>
            <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Auction prevention assistance for users facing loss.</li>
                    <li>Support with fees that stand between a family and their belongings.</li>
                    <li>Operational costs for finding and returning items never meant to be sold.</li>
                </ul>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Respect For Sentimental Items</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">
                <p>If staff or Ambassadors believe an item may be sentimental, they pause processing, flag it, and confirm with you before resale. Your story and your boundaries come first.</p>
            </CardContent>
        </Card>
        <Card className="md:col-span-2">
            <CardHeader><CardTitle>Donation Receipts</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">
                <p>When LEAN Foundation nonprofit status is active, tax receipts will be available in your account under “Donation History”. Until then, donations still support the same hardship work, just without formal tax documentation.</p>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
