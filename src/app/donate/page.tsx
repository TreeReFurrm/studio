
'use client';

import { DollarSign, Gift, ArrowRight, UserPlus, Heart, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function DonationPage() {
  const router = useRouter();
  const [amount, setAmount] = useState(50); // Default donation amount
  const { toast } = useToast();

  // Define the impact tiers for transparency
  const impactTiers = [
    { amount: 25, label: '$25', description: 'Supports a Legacy User application review (admin time, background check).' },
    { amount: 50, label: '$50', description: 'Covers the cost of an Ambassador\'s specialized equipment (e.g., appraisal tools).' },
    { amount: 100, label: '$100', description: 'Pays storage rent for one Legacy User (1-2 weeks) to prevent auction loss.' },
    { amount: 250, label: '$250', description: 'Funds a full-scale community education seminar on ethical estate liquidation.' },
  ];

  // Handler for Monetary Donation (Placeholder for Stripe)
  const handleMonetaryDonate = () => {
    // **TODO: INTEGRATE STRIPE CHECKOUT HERE**
    // This function must call an API route to securely create a Stripe Checkout Session
    console.log(`Initiating donation for $${amount}. (Stripe integration needed)`);
    
    toast({
        title: 'Thank You!',
        description: `Your $${amount} donation is greatly appreciated. We are redirecting you to checkout...`
    })
    
    // In a real implementation:
    // fetch('/api/stripe/create-checkout', { method: 'POST', body: JSON.stringify({ amount: amount * 100 }) })
    //   .then(res => res.json())
    //   .then(data => router.push(data.url)); 
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
          Support ReFurrm Scan's Big Mission
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Every contribution, monetary or physical, powers our rescue network and ethical resale initiatives.
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
                ReFurrm Scan's core goal is to prevent valuable, historical, or sentimental items from being lost or destroyed through estate liquidations and storage auctions. We focus on **ethical preservation** and **community support**.
            </p>
            <p className="font-semibold text-balance">
                <span className="text-destructive">Legacy User Support:</span> Funds are primarily used for emergency interventions, such as paying a Legacy User's storage rent to prevent the contents from going to auction. This aid is **application-based**, reserved for individuals demonstrating genuine need and ethical alignment, and is not simply a debt payment service.
            </p>
            <p className="text-xs italic text-muted-foreground">
                **Disclosure:** All applications are reviewed based on the highest ethical standards. If funding is not immediately available for an approved Legacy User, **we will immediately launch a transparent, dedicated fundraiser** with full disclosure of the user's situation (while protecting their privacy) and the precise funding goal. **Any unused funds will be strictly reserved for future, approved Legacy User needs.**
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
              Your financial donation fuels direct action and infrastructure to support our network.
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
                  >
                    <span className="text-lg font-bold">{tier.label}</span>
                    <span className="text-xs text-muted-foreground/90 mt-1 block max-w-[90px] mx-auto text-balance">
                        {tier.description.split('(')[0].trim()}
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
                />
              </div>
              <Button 
                onClick={handleMonetaryDonate} 
                className="w-full h-12 text-lg"
                disabled={amount <= 0}
              >
                Donate ${amount.toFixed(2)} Now
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
                  Use our AI tools to submit your item. We handle the assessment and ethical resale to maximize the contribution to the Big Mission Fund.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4 list-disc pl-5">
                    <li>**AI Value Assessment:** We use AI to determine the item's potential resale value.</li>
                    <li>**Resale Profitability Check:** We proceed only if the item's value guarantees a profit for the mission after all costs (shipping, fees).</li>
                    <li>**Fulfillment Coordination:** Local pickup is arranged by a verified **Ambassador** (where available).</li>
                    <li>**100% Mission Funding:** All net proceeds from the sale are directed to the Big Mission Fund.</li>
                  </ul>
                  <Button onClick={handleItemDonate} className="w-full mt-auto">
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
