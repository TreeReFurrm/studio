
'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, DollarSign, Heart, Info, AlertTriangle, Gift } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useUser } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import Image from 'next/image';

const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  tags: z.array(z.string()).optional(),
  price: z.coerce.number().min(1, "Price must be at least $1."),
  enableEthicalContribution: z.boolean().default(false),
  contributionPercentage: z.coerce.number().min(1).max(100).optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

export function ListingForm() {
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listingAction, setListingAction] = useState<'SELL' | 'DONATE' | null>(null);
  
  // State for pre-loaded data from URL
  const [initialData, setInitialData] = useState<any>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: 'AI-generated description will appear here.', // Placeholder
      tags: [],
      price: 0,
      enableEthicalContribution: false,
    },
  });

  // Effect to load data from URL search params
  useEffect(() => {
    const data = {
      title: searchParams.get('title'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      appraisalNote: searchParams.get('appraisalNote'),
      isConsignmentViable: searchParams.get('isConsignmentViable') === 'true',
      photoDataUri: searchParams.get('photoDataUri'),
      categoryTag: searchParams.get('categoryTag'),
    };
    
    if (data.title && data.maxPrice) {
      setInitialData(data);
      form.reset({
        title: data.title,
        description: data.appraisalNote || '',
        price: parseFloat(data.maxPrice),
        tags: data.categoryTag ? [data.categoryTag.replace(/_/g, ' ')] : [],
        enableEthicalContribution: false,
      });
      if (data.photoDataUri) {
        setPhotoDataUri(data.photoDataUri);
      }
    } else {
      // If no data, redirect to verify page to start the flow
      router.replace('/verify');
    }
  }, [searchParams, form, router]);


  const handlePriceSuggestion = () => {
    if (!initialData) return;
    form.setValue('price', parseFloat(initialData.maxPrice));
    toast({ title: 'Price Reset', description: 'Price has been reset to the suggested maximum resale value.' });
  };
  
  const onSubmit = async (data: ListingFormData) => {
    if (!user) {
       toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to proceed.',
      });
      return;
    }
    // This function is triggered by the form's submit event.
    // We now use the button's onClick to set the action, then this confirms.
    confirmAction();
  };
  
  const handleReset = () => {
    router.push('/verify');
  }
  
  const confirmAction = () => {
    if (!listingAction) {
        toast({ title: "Please choose an action", description: "Select whether to sell or donate the item.", variant: "destructive" });
        return;
    }

    const { title, description, tags } = form.getValues();
    let price = form.getValues('price');

    // Smart pricing for donations
    if (listingAction === 'DONATE' && initialData?.minPrice) {
        price = parseFloat(initialData.minPrice);
        toast({ title: "Price Adjusted for Donation", description: `Item will be listed at the quick-sale price of $${price.toFixed(2)} to maximize its contribution.`})
    }
    
    const queryParams = new URLSearchParams({
      title,
      description: description || '',
      price: price.toString(),
      tags: tags?.join(',') || '',
      action: listingAction,
      img: photoDataUri || ''
    });

    router.push(`/select-ambassador?${queryParams.toString()}`);
  };


  if (!initialData) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading item data...</p>
        </div>
    );
  }

  if (!initialData.isConsignmentViable) {
      return (
          <Card>
              <CardContent className="p-6 flex flex-col items-center gap-6 text-center">
                   <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Consignment Not Possible</AlertTitle>
                      <AlertDescription>
                          {initialData.appraisalNote || "This item is not eligible for consignment due to authenticity or category restrictions."}
                      </AlertDescription>
                  </Alert>
                   <p className="text-sm text-muted-foreground">
                      While this item isn't eligible for consignment, you can still contribute by donating it for ethical recycling or local aid.
                  </p>
                  <div className="flex gap-4">
                      <Button onClick={handleReset} variant="outline">Scan a Different Item</Button>
                      <Button onClick={() => { setListingAction('DONATE'); confirmAction(); }}>
                          <Gift className="mr-2 h-4 w-4" />
                          Proceed with Donation
                      </Button>
                  </div>
              </CardContent>
          </Card>
      );
  }

  return (
    <FormProvider {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            {photoDataUri && (
                <CardHeader>
                    <Image src={photoDataUri} alt={form.getValues('title')} width={600} height={400} className="rounded-lg object-cover aspect-video mx-auto" />
                </CardHeader>
            )}
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Listing Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Vintage Leather Armchair" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your item..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Generated Tags</FormLabel>
                     <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[40px] bg-muted/50">
                        {field.value?.map((tag: string) => (
                            <Badge key={tag} variant="secondary">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                  </FormItem>
                )}
              />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="size-5"/> Set Your Price</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Listing Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="number" placeholder="0.00" className="pl-8" {...field} />
                    </div>
                  </FormControl>
                   <FormDescription>
                        Suggested range: ${parseFloat(initialData.minPrice).toFixed(2)} - ${parseFloat(initialData.maxPrice).toFixed(2)}
                    </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button type="button" variant="outline" onClick={handlePriceSuggestion}>
                <Sparkles className="mr-2 h-4 w-4" />
                Use Suggested Max Price
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Heart className="size-5" /> The Big Decision</CardTitle>
            <CardDescription>Choose how you want to proceed with your item.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Button type="submit" size="lg" disabled={isSubmitting} onClick={() => setListingAction('SELL')} className="h-auto py-4 flex flex-col items-start text-left">
                <span className="font-bold text-lg">Sell on Consignment</span>
                <span className="font-normal text-sm text-primary-foreground/80">Make money from your item. We handle the listing, you get the payout.</span>
            </Button>
             <Button type="button" variant="secondary" size="lg" disabled={isSubmitting} onClick={() => { setListingAction('DONATE'); form.handleSubmit(onSubmit)(); }} className="h-auto py-4 flex flex-col items-start text-left">
                <span className="font-bold text-lg">Donate Item Proceeds</span>
                <span className="font-normal text-sm text-secondary-foreground/80">All proceeds from the sale will go to the LEAN Foundation.</span>
            </Button>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}

    