
'use client';

import { DollarSign, Gift, ArrowRight, UserPlus, Heart, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import Link from 'next/link';

export default function DonationPage() {
  const router = useRouter();
  const [amount, setAmount] = useState(50); // Default donation amount
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useUser();

  // Define the impact tiers for transparency
  const impactTiers = [
    { amount: 25, label: '$25', description: 'Supports one application review.' },
    { amount: 50, label: '$50', description: 'Covers Ambassador equipment.' },
    { amount: 100, label: '$100', description: 'Funds emergency storage rent.' },
    { amount: 250, label: '$250', description: 'Funds a community seminar.' },
  ];

  // Handler for Monetary Donation
  const handleMonetaryDonate = async () => {
    setIsProcessing(true);
    toast({
        title: 'Processing Donation...',
        description: `We are redirecting you to our secure payment processor.`
    });

    try {
      const response = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              amount: amount,
              donorEmail: user?.email,
              donorName: user?.displayName || 'Anonymous Supporter'
          }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      if (url) {
        // Redirect to Stripe's checkout page
        router.push(url);
      } else {
        throw new Error('Could not initiate donation. Please try again.');
      }
    } catch (err: any) {
        console.error(err);
        toast({
            variant: 'destructive',
            title: 'Donation Failed',
            description: err.message || 'An unexpected error occurred. Please try again later.'
        });
        setIsProcessing(false);
    }
  };

  // Handler for Item Donation - Reroutes to the item scanning/listing flow
  const handleItemDonate = () => {
    router.push('/list'); 
  };
    
  // Handler to route to the Ambassador sign-up page
  const handleAmbassadorInterest = () => {
    router.push('/ambassadors/apply'); 
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-10">
      <header className="text-center space-y-3">
        <Heart className="w-12 h-12 text-primary mx-auto" />
        <h1 className="text-4xl font-extrabold tracking-tight">
          Support ReFurrm SmartScan's Big Mission
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your contributions power our rescue network and ethical resale initiatives.
        </p>
      </header>
      
      {/* --- Mission & Disclosure Block --- */}
      <Card className="bg-primary/5 border-primary/20 shadow-inner">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <Info className="w-5 h-5" />
                Our Big Mission & Transparency
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
            <p>
                ReFurrm SmartScan prevents valuable items from being lost in estate liquidations and storage auctions through ethical preservation and community support.
            </p>
            <p className="font-semibold text-balance">
                Funds are primarily used for application-based emergency interventions for individuals in need, such as paying storage rent to prevent auction. <Button variant="link" asChild className="p-0 h-auto"><Link href="#">Learn More</Link></Button>
            </p>
            <p className="text-xs italic text-muted-foreground">
                **Disclosure:** We are committed to transparency. If funds are not available for an approved case, we will launch a dedicated fundraiser. Any unused funds are strictly reserved for future approved needs.
            </p>
        </CardContent>
      </Card>
      {/* ------------------------------------- */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* === COLUMN 1: MONETARY DONATION (IMPACT TIERS) === */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <DollarSign className="w-6 h-6" />
              Fund the Mission
            </CardTitle>
            <CardDescription>
              Your financial donation fuels direct action and supports our network.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {impactTiers.map((tier) => (
                  <Button 
                    key={tier.amount} 
                    variant={amount === tier.amount ? 'default' : 'outline'}
                    onClick={() => setAmount(tier.amount)}
                    className="flex flex-col h-auto py-4 text-center justify-center items-center"
                    disabled={isProcessing}
                  >
                    <span className="text-lg font-bold">{tier.label}</span>
                    <span className="text-xs text-muted-foreground/90 mt-1 block max-w-[90px] mx-auto text-balance">
                        {tier.description}
                    </span>
                  </Button>
                ))}
              </div>

              <div className="space-y-4">
                <Label htmlFor="amount-custom" className="font-semibold">Custom Amount (USD)</Label>
                <Input
                  id="amount-custom"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  min="5"
                  step="5"
                  className="text-lg py-6"
                  placeholder="50"
                  disabled={isProcessing}
                />
              </div>
              <Button 
                onClick={handleMonetaryDonate} 
                className="w-full h-12 text-lg"
                disabled={isProcessing || amount <= 0}
              >
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isProcessing ? 'Processing...' : `Donate $${amount.toFixed(2)} Now`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* === COLUMN 2: PHYSICAL ITEM DONATION & AMBASSADOR CALL === */}
        <div className="space-y-6">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Gift className="w-6 h-6" />
                  Contribute an Item for Ethical Resale
                </CardTitle>
                <CardDescription>
                  Use our AI tools to submit an item. We handle the rest.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4 list-disc pl-5">
                    <li>AI-powered value assessment.</li>
                    <li>Pickup coordination by a verified Ambassador.</li>
                    <li>100% of net proceeds go to the Big Mission Fund.</li>
                  </ul>
                  <Button onClick={handleItemDonate} className="w-full mt-auto" disabled={isProcessing}>
                    Submit Item for Assessment <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
              </CardContent>
            </Card>

            <Card className="h-full bg-primary text-primary-foreground flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <UserPlus className="w-6 h-6" />
                  Become an Ambassador
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Ready to coordinate local pickups and events? Join our leadership team.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex items-end">
                <Button 
                    variant="secondary" 
                    onClick={handleAmbassadorInterest} 
                    className="w-full text-primary"
                    disabled={isProcessing}
                >
                  Apply to Lead
                </Button>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
