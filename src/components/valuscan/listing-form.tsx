
'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ImageUploader } from './image-uploader';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { scanItem, type ScanItemOutput } from '@/ai/flows/scan-item';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, DollarSign, Heart, Info, AlertTriangle, Gift } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';


const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  tags: z.array(z.string()).min(1, "Please add at least one tag."),
  price: z.coerce.number().min(1, "Price must be at least $1."),
  enableEthicalContribution: z.boolean().default(false),
  contributionPercentage: z.coerce.number().min(1).max(100).optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

export function ListingForm() {
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  const [scanResult, setScanResult] = useState<ScanItemOutput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listingAction, setListingAction] = useState<'SELL' | 'DONATE' | null>(null);
  const router = useRouter();

  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      price: undefined,
      enableEthicalContribution: false,
    },
  });

  const handleInitialScan = async (dataUri: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Please sign in to create a listing.'});
      return;
    }
    setPhotoDataUri(dataUri);
    setIsGenerating(true);
    setScanResult(null);

    try {
      const output = await scanItem({ photoDataUri: dataUri });
      setScanResult(output);

      if (!output.isConsignmentViable) {
        // Gatekeeper stops the flow here but still needs to set form values for donation
        form.setValue('title', output.suggestedTitle);
        form.setValue('description', output.suggestedDescription);
        form.setValue('price', output.maxPrice); // Use retail price for donation context
        form.setValue('tags', [output.categoryTag.replace(/_/g, ' ')]);
        return; 
      }
      
      form.setValue('title', output.suggestedTitle);
      form.setValue('description', output.suggestedDescription);
      form.setValue('price', output.maxPrice); 
      form.setValue('tags', [output.categoryTag.replace(/_/g, ' ')]);

    } catch (error: any) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Scan Failed',
            description: 'AI could not process the image. Please try again or fill details manually.',
        });
        setScanResult({ isConsignmentViable: true } as ScanItemOutput);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePriceSuggestion = async () => {
    if (!scanResult) return;
    setIsSuggestingPrice(true);
    setTimeout(() => {
      form.setValue('price', scanResult.maxPrice);
      toast({ title: 'Price Updated', description: 'Set to the suggested maximum resale value.' });
      setIsSuggestingPrice(false);
    }, 500);
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
    setListingAction('SELL');
  };
  
  const handleReset = () => {
    form.reset();
    setScanResult(null);
    setPhotoDataUri(null);
    setIsGenerating(false);
    setIsSubmitting(false);
    setListingAction(null);
  }
  
  const confirmAction = () => {
    if (!listingAction) return;

    const { title, description, tags, price } = form.getValues();
    
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


  if (!scanResult) {
    return (
      <Card>
        <CardContent className="p-6">
          <ImageUploader onImageUpload={(uri) => {
            if(uri) {
                handleInitialScan(uri)
            } else {
                setPhotoDataUri(null);
            }
          }} disabled={isGenerating} />
        </CardContent>
      </Card>
    );
  }

  if (!scanResult.isConsignmentViable) {
    return (
        <Card>
            <CardContent className="p-6 flex flex-col items-center gap-6 text-center">
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Consignment Rejected</AlertTitle>
                    <AlertDescription>
                        {scanResult.appraisalNote}
                        {scanResult.priceType === 'RETAIL' && (
                            <p className="mt-2 font-bold">Estimated Retail Value: ${scanResult.maxPrice.toFixed(2)}</p>
                        )}
                    </AlertDescription>
                </Alert>
                 <p className="text-sm text-muted-foreground">
                    While this item isn't eligible for consignment, you can still contribute by donating it for ethical recycling or local aid.
                </p>
                <div className="flex gap-4">
                    <Button onClick={handleReset} variant="outline">List a Different Item</Button>
                    <Button onClick={() => setListingAction('DONATE')}>
                        <Gift className="mr-2 h-4 w-4" />
                        Donate This Item
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
  }

  if (listingAction) {
    const { title, price } = form.getValues();
    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle>Confirm Your Action</CardTitle>
                <CardDescription>
                    You are about to start a '{listingAction}' request for '{title}' {listingAction === 'SELL' ? `with a listing price of $${price.toFixed(2)}` : ''}.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => setListingAction(null)}>Cancel</Button>
                <Button onClick={confirmAction}>Confirm & Find Ambassador</Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Review Your Listing</CardTitle>
            <CardDescription>Our AI has pre-filled the details. Feel free to make any changes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI-Suggested Title</FormLabel>
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
                  <FormLabel>AI-Suggested Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your item..." rows={5} {...field} />
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
                    <FormLabel>AI-Generated Tags</FormLabel>
                     <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[40px] bg-muted/50">
                        {field.value?.map((tag: string) => (
                            <Badge key={tag} variant="secondary">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <FormControl>
                        <Input
                          type="hidden"
                          {...field}
                          value={field.value?.join(', ') || ''}
                          onChange={(e) => field.onChange(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                        />
                    </FormControl>
                    <FormDescription>
                        Tags help us match your item with the right Ambassador specialist. You can edit them by typing, separated by commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="size-5"/> Pricing</CardTitle>
            <CardDescription>Set your price. Our AI has already provided a suggestion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="number" placeholder="0.00" className="pl-8" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button type="button" variant="outline" onClick={handlePriceSuggestion} disabled={isSuggestingPrice}>
                {isSuggestingPrice ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Reset to AI Suggestion
              </Button>
                {scanResult && scanResult.minPrice > 0 && (
                  <div className="mt-4 p-4 bg-accent/50 rounded-lg flex gap-3">
                    <Info className="size-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-accent-foreground">
                        Suggested Range: ${scanResult.minPrice.toFixed(2)} - ${scanResult.maxPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{scanResult.appraisalNote}</p>
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Heart className="size-5" /> Ethical Contribution</CardTitle>
            <CardDescription>Optionally, contribute a portion of your sale to fund industry change.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <FormField
                control={form.control}
                name="enableEthicalContribution"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Contribution</FormLabel>
                      <FormDescription>Donate a percentage of the sale.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              {form.watch('enableEthicalContribution') && (
                <FormField
                  control={form.control}
                  name="contributionPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contribution Percentage</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="number" placeholder="10" {...field} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
            <Button type="button" variant="secondary" size="lg" disabled={isSubmitting} onClick={() => setListingAction('DONATE')}>
              Donate Item
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sell on Consignment'}
            </Button>
        </div>
      </form>
    </FormProvider>
  );
}
