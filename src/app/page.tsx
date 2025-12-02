
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgePercent, LayoutGrid, Handshake } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      
      <Card className="md:col-span-2 flex flex-col w-full rounded-lg shadow-lg bg-primary/10 border-primary/20 hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Ready to declutter and sell?</CardTitle>
            <CardDescription>
              Upload a photo — our AI creates an SEO-optimized title, description, and a fair price in seconds.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
             <Button asChild size="lg">
                <Link href="/list">Create Your First Listing</Link>
             </Button>
             <div className="text-sm">
                <Button asChild variant="link">
                    <Link href="/verify">Try the Ethical Pricing Tool</Link>
                </Button>
             </div>
             <p className="text-xs text-muted-foreground pt-2">Trusted by hundreds of sellers • Average time to sale: 4 days</p>
          </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col w-full rounded-lg shadow-sm hover:shadow-lg transition-shadow hover:bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-primary">
              <span>Ethical Pricing Tool</span>
              <BadgePercent className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
             <CardDescription>Get a fair price range based on real sales data so you list competitively and sell faster.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-end">
            <Button asChild variant="secondary">
                <Link href="/verify">Check a Price</Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">See the comparables used to calculate each suggestion.</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col w-full rounded-lg shadow-sm hover:shadow-lg transition-shadow hover:bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-primary">
              <span>ReFurrm Ethical Resale</span>
               <LayoutGrid className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
            <CardDescription>Browse curated community listings that meet our ethical standards—buy or sell with confidence.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-end">
            <Button asChild variant="secondary">
                 <Link href="/marketplace">Explore Listings</Link>
            </Button>
             <p className="text-xs text-muted-foreground mt-2">Items with an Ethical Badge meet our resale and sourcing guidelines.</p>
          </CardContent>
        </Card>
      </div>

       <Card className="flex flex-col w-full rounded-lg shadow-sm hover:shadow-lg transition-shadow hover:bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-primary">
              <span>Ambassador Services</span>
              <Handshake className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
            <CardDescription>Need help with a large clean-out or inventory project? Book an Ambassador for hands-on support.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-end">
             <Button asChild variant="secondary">
                <Link href="/services">Book a Consult</Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Pricing starts at $75/hr. Custom quotes available.</p>
          </CardContent>
        </Card>
        
        <footer className="text-center text-xs text-muted-foreground py-4">
            <p>We only use your photos to create listings. We do not use your images to train models without your permission. <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
        </footer>
    </div>
  );
}
