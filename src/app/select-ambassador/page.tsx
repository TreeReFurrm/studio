'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserCheck, MapPin, Clock, Briefcase, Star, Handshake } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { Ambassador, AmbassadorListOutput } from '@/ai/schemas/ambassador-schema';
import { selectAmbassador, type AmbassadorFlowInput } from '@/ai/flows/select-ambassador';

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
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
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

    async function getAmbassadors() {
      setIsLoading(true);
      try {
        const suggestions: AmbassadorListOutput = await selectAmbassador(listingData as AmbassadorFlowInput);
        setAmbassadors(suggestions.ambassadors);
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

    getAmbassadors();
  }, [listingData, toast]);

  // 3. Final Selection Handler
  const handleAmbassadorSelect = useCallback((ambassadorId: string) => {
    const selectedAmbassador = ambassadors.find(a => a.id === ambassadorId);
    if (selectedAmbassador) {
      toast({
        title: 'Ambassador Selected!',
        description: `You have initiated pickup with ${selectedAmbassador.name}. They will contact you shortly.`,
      });
      // Final step: Send data to a fulfillment service/database
      router.push('/account'); 
    }
  }, [ambassadors, toast, router]);


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
      <h2 className="text-2xl font-semibold pt-4">Suggested Local Ambassadors</h2>
      <Card>
        <CardContent className="p-4 space-y-4">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
              <p className="mt-2 text-muted-foreground">Searching network for best matches...</p>
            </div>
          ) : ambassadors.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {ambassadors.map((ambassador) => (
                <AmbassadorCard key={ambassador.id} ambassador={ambassador} onSelect={handleAmbassadorSelect} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-muted/50 rounded-lg">
              <p className="font-medium">No Ambassadors found nearby.</p>
              <p className="text-sm text-muted-foreground">We will notify you when a match is available.</p>
              <Button variant="link" className="mt-2">Contact Support</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
