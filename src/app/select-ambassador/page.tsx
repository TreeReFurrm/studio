
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserCheck, MapPin, Clock, Briefcase, Star, Handshake, Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { selectAmbassador, type AmbassadorFlowInput, type Ambassador, type AmbassadorListOutput } from '@/ai/flows/select-ambassador';


// Define the required interface based on the URL query parameters
interface ListingData {
  title: string;
  description: string;
  price: number;
  tags: string[];
  action: 'SELL' | 'DONATE';
  img?: string; // Base64 Data URI
  service: 'pickup' | 'cleanout' | 'organize' | 'downsize';
  zipCode: string;
}

interface FulfillmentViability {
  isProfitable: boolean;
  ambassadorsAvailable: boolean;
  suggestedAmbassadors: Ambassador[];
}

// Ambassador Card Component (Re-using the structure we planned)
const AmbassadorCard: React.FC<{ ambassador: Ambassador; onSelect: (id: string) => void }> = ({ ambassador, onSelect }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
        <div>
            <CardTitle>{ambassador.name}</CardTitle>
            <CardDescription className="flex items-center text-sm mt-1">
              <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
              {ambassador.rating.toFixed(1)} Rating
            </CardDescription>
        </div>
        <Button onClick={() => onSelect(ambassador.id)} size="sm">
            Select <UserCheck className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground pt-4">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span>Area: {ambassador.area}</span>
        </div>
        <div className="flex items-center">
          <Briefcase className="h-4 w-4 mr-2 text-primary" />
          <span>Specialty: {ambassador.specialty}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-primary" />
          <span>Pickup: {ambassador.expectedPickupTime}</span>
        </div>
      </CardContent>
    </Card>
  );
};


export default function AmbassadorSelectionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [viability, setViability] = useState<FulfillmentViability | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Data Parsing from URL
  useEffect(() => {
    const rawTags = searchParams.get('tags');
    const data: ListingData = {
      title: searchParams.get('title') || 'Untitled Item',
      description: searchParams.get('description') || '',
      price: parseFloat(searchParams.get('price') || '0'),
      tags: rawTags ? rawTags.split(',').filter(t => t.length > 0) : [],
      action: (searchParams.get('action') as 'SELL' | 'DONATE') || 'SELL',
      img: searchParams.get('img') || undefined,
      service: 'pickup', // Hardcoded for now as it's the default consignment action
      zipCode: '90210' // Hardcoded for now, would come from user profile
    };
    
    // Simple validation
    if (data.title === 'Untitled Item' && !data.img) {
        toast({ title: 'Error', description: 'Missing item data.', variant: 'destructive' });
        router.push('/list');
        return;
    }

    setListingData(data);
  }, [searchParams, router, toast]);

  // 2. Fetch Ambassador Suggestions (Calls the Genkit Flow)
  useEffect(() => {
    if (!listingData) return;

    async function getFulfillmentViability() {
      setIsLoading(true);
      try {
        const suggestions: AmbassadorListOutput = await selectAmbassador(listingData as AmbassadorFlowInput);
        
        // Mocking the viability logic for now
        const tags = listingData.tags;
        let isProfitable = true;

        if (tags.includes('small') || tags.includes('low-value') || listingData.price < 20) {
            isProfitable = Math.random() > 0.3; // 70% chance of being deemed not viable
        }

        setViability({
            isProfitable: isProfitable,
            ambassadorsAvailable: isProfitable && suggestions.ambassadors.length > 0,
            suggestedAmbassadors: suggestions.ambassadors
        });

      } catch (error) {
        console.error('Failed to fetch ambassadors:', error);
        toast({
          title: 'Fulfillment Error',
          description: 'Could not find Ambassador matches at this time.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    getFulfillmentViability();
  }, [listingData, toast]);

  // 3. Final Selection Handler
  const handleAmbassadorSelect = useCallback((ambassadorId: string) => {
    const selectedAmbassador = viability?.suggestedAmbassadors.find(a => a.id === ambassadorId);
    if (selectedAmbassador) {
      toast({
        title: 'Ambassador Selected!',
        description: `You have initiated pickup with ${selectedAmbassador.name}. They will contact you shortly.`,
      });
      // Final step: Send data to a fulfillment service/database
      router.push('/confirmation'); 
    }
  }, [viability, toast, router]);
  
  const handleFlexibleFulfillment = () => {
      toast({
        title: 'DIY Fulfillment Selected',
        description: `Your item will be listed. You will be notified with a shipping label upon sale.`,
      });
      router.push('/marketplace');
  }


  if (!listingData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          {listingData.action === 'SELL' ? 'Consignment Fulfillment' : 'Donation Drop-off'}
        </h1>
        <p className="text-muted-foreground">
          Your item, "{listingData.title}", is ready for pickup. Select an Ambassador below.
        </p>
      </div>

      {/* Item Overview Card */}
      <Card className="shadow-lg border-primary/20">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
              {listingData.img && (
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border">
                      <Image src={listingData.img} alt={listingData.title} fill className="object-cover" />
                  </div>
              )}
              <div className="flex-grow space-y-1">
                  <h2 className="text-xl font-semibold">{listingData.title}</h2>
                  <div className="flex flex-wrap gap-2">
                      <Badge variant="default">Price: ${listingData.price.toFixed(2)}</Badge>
                      <Badge variant="outline">{listingData.action} Action</Badge>
                      {listingData.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                  </div>
              </div>
              <div className="md:self-center">
                  <Handshake className="w-8 h-8 text-primary" />
              </div>
          </CardContent>
      </Card>

      {/* Ambassador Selection Section */}
      <h2 className="text-2xl font-semibold pt-4">Fulfillment Options</h2>
      <Card>
        <CardContent className="p-4 space-y-4">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
              <p className="mt-2 text-muted-foreground">Searching network for best matches...</p>
            </div>
          ) : !viability?.isProfitable ? (
            <div className="p-8 text-center bg-yellow-50 rounded-lg border border-yellow-200 space-y-3">
              <Sparkles className="w-8 h-8 text-yellow-600 mx-auto" />
              <p className="font-medium text-lg text-yellow-800">
                Managed Fulfillment Not Currently Viable
              </p>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Based on current market data and your item's size, the expected resale <strong>contribution value</strong> does not cover the cost of our managed pickup or shipping logistics.
              </p>
              <p className="text-sm font-semibold">
                <strong>Solution:</strong> We will finalize the listing. You hold the item, and when it sells, we provide the shipping label. Your contribution to the Mission is determined after the sale.
              </p>
              <Button onClick={() => handleFlexibleFulfillment()} className="mt-4">
                List for DIY Sale & Mission Contribution <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : viability.suggestedAmbassadors.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {viability.suggestedAmbassadors.map((ambassador) => (
                <AmbassadorCard key={ambassador.id} ambassador={ambassador} onSelect={handleAmbassadorSelect} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-lg">
              <p className="font-medium">Item has high Mission Contribution Value, but no Ambassador is currently available.</p>
              <p className="text-sm text-muted-foreground">We will notify you when a match is available, or you can opt for the flexible DIY fulfillment option now.</p>
              <Button variant="link" className="mt-2" onClick={() => handleFlexibleFulfillment()}>
                Opt for Flexible DIY Fulfillment Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
