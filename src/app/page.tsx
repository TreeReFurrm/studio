
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgePercent, Sparkles, LayoutGrid, Handshake } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      
      <Card className="md:col-span-2 flex flex-col w-full rounded-lg shadow-lg bg-primary/10 border-primary/20 hover:shadow-xl transition-shadow cursor-pointer">
          <Link href="/list" className="flex flex-col flex-grow">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Ready to Declutter & Sell?</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
               <p className="text-muted-foreground">Let our AI create your first listing and turn your items into assets. Use our Instant Listing Generator to begin. Just upload a photo and let our AI do the heavy lifting, from writing an SEO-optimized title to suggesting a fair price.</p>
               <Button>Create Your First Listing</Button>
            </CardContent>
          </Link>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/verify" className="flex">
           <Card className="flex flex-col w-full rounded-lg shadow-sm hover:shadow-lg transition-shadow hover:bg-card/95 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-primary">
                  <span>Ethical Pricing Tool</span>
                  <BadgePercent className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">Get a fair price range based on real sales data, ensuring a quick and realistic sale.</p>
              </CardContent>
            </Card>
        </Link>

        <Link href="/marketplace" className="flex">
            <Card className="flex flex-col w-full rounded-lg shadow-sm hover:shadow-lg transition-shadow hover:bg-card/95 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-primary">
                  <span>ReFurrm Ethical Resale</span>
                   <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">Browse curated listings from the community on our ethical resale platform.</p>
              </CardContent>
            </Card>
        </Link>
      </div>

       <Link href="/services" className="flex">
       <Card className="flex flex-col w-full rounded-lg shadow-sm hover:shadow-lg transition-shadow hover:bg-card/95 cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-primary">
              <span>Ambassador Services</span>
              <Handshake className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">Need help with a bigger project? Our Ambassadors are here to assist with clean-outs, organization, and more.</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
