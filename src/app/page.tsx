
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ScanLine, ShoppingCart, ArrowRight, Wrench } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to ReFurrm SmartScan</h1>
        <p className="text-muted-foreground">Your AI assistant for de-cluttering and ethical selling.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className="flex flex-col rounded-lg shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="text-primary" />
              <span>List an Item</span>
            </CardTitle>
            <CardDescription>
              Use our AI to generate a listing in seconds. Just snap a photo.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
            <Button asChild className="w-full">
              <Link href="/list">Start Listing <ArrowRight className="ml-2" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col rounded-lg shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="text-primary" />
              <span>Verify Item Value</span>
            </CardTitle>
            <CardDescription>
              At a flea market? Scan an item to see its true market value before you buy.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
            <Button asChild className="w-full">
              <Link href="/verify">Verify Value <ArrowRight className="ml-2" /></Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="flex flex-col rounded-lg shadow-sm hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="text-primary" />
              <span>Browse Marketplace</span>
            </CardTitle>
            <CardDescription>
              Explore the ReFurrm Exchange for unique finds from other users.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
            <Button asChild className="w-full">
              <Link href="/marketplace">Go to Marketplace <ArrowRight className="ml-2" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col rounded-lg shadow-sm hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="text-primary" />
              <span>Ambassador Services</span>
            </CardTitle>
            <CardDescription>
             Need a hand with a big project? Request a clean-out or organization service.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
            <Button asChild className="w-full">
              <Link href="/services">Request a Service <ArrowRight className="ml-2" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
