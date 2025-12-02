
'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ImageUploader } from './image-uploader';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { verifyItemValue, type VerifyItemValueOutput } from '@/ai/flows/verify-item-value';
import { Loader2, Sparkles, DollarSign, TrendingUp, AlertCircle, BadgeCheck, ShoppingCart, ShieldCheck, ShieldAlert, FileQuestion, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useRouter } from 'next/navigation';
import { Progress } from '../ui/progress';
import { ComparablesModal } from './comparables-modal';
import { useUser } from '@/firebase';

const conditions = [
    "New (Sealed)",
    "Excellent (Like New)",
    "Good (Used, Working)",
    "Fair (Scratches/Minor Issue)",
] as const;

const sources = [
    "Personal Garage/Storage",
    "Yard Sale/Flea Market (Buying)",
    "Retail Store (Walmart/Target)",
    "Online Marketplace (eBay/Poshmark)",
] as const;

const verificationSchema = z.object({
  photoDataUri: z.string().optional(),
  itemName: z.string().optional(),
  condition: z.enum(conditions),
  source: z.enum(sources),
  askingPrice: z.coerce.number().optional(),
}).refine(data => !!data.photoDataUri || !!data.itemName, {
    message: "Please upload a photo or enter an item name.",
    path: ["itemName"],
});

type VerificationFormData = z.infer<typeof verificationSchema>;

export function VerificationTool() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerifyItemValueOutput | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      photoDataUri: undefined,
      itemName: '',
      condition: "Good (Used, Working)",
      source: "Yard Sale/Flea Market (Buying)",
      askingPrice: undefined,
    },
  });

  const onSubmit = async (data: VerificationFormData) => {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await verifyItemValue(data);
      setResult(output);
      setCurrentStep(4); // Move to result step
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "The AI could not determine the value. Please try again.",
      });
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setIsLoading(false);
    setCurrentStep(1);
    form.reset({
        photoDataUri: undefined,
        itemName: '',
        condition: "Good (Used, Working)",
        source: "Yard Sale/Flea Market (Buying)",
        askingPrice: undefined,
    });
  };
  
  const handleContinueToListing = () => {
    if (!result) return;
    const photoDataUri = form.getValues('photoDataUri');

    const queryParams = new URLSearchParams();
    queryParams.set('title', result.itemName);
    queryParams.set('price', result.maxResaleValue.toString());
    queryParams.set('description', `Based on a market valuation, this item is ready for listing. Condition: ${form.getValues('condition')}. Authenticity assessment: ${result.authenticity.verdict}.`);
    
    // Pass enriched data for analytics
    queryParams.set('suggestedPrice', result.maxResaleValue.toString());
    queryParams.set('userTier', 'Community'); // Placeholder for actual user tier
    queryParams.set('zipCode', '90210'); // Placeholder for actual user zip

    if (photoDataUri) {
      // For GET requests, data URIs can be very long. Let's pass a reference or handle differently in a real app.
      // For this prototype, we'll truncate if too long, or store it temporarily if we had a backend session.
      // A better approach would be to store the image and pass an ID. For now, we pass it if it's small enough.
      if (photoDataUri.length < 2000) {
        queryParams.set('img', photoDataUri);
      }
    }
    
    router.push(`/list?${queryParams.toString()}`);
  }

  const handleNextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
        isValid = !!form.getValues('photoDataUri') || !!form.getValues('itemName');
        if(!isValid) {
            form.setError("itemName", { type: "manual", message: "Please upload a photo or enter an item description." });
        } else {
            form.clearErrors("itemName");
        }
    } else if (currentStep === 2) {
        isValid = await form.trigger(['condition', 'source']);
    } else if (currentStep === 3) {
        isValid = await form.trigger(['askingPrice']);
        if(isValid) {
            form.handleSubmit(onSubmit)();
            return;
        }
    }

    if (isValid) {
        setCurrentStep(prev => prev + 1);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
        setCurrentStep(prev => prev - 1);
    }
  }

  const photoDataUri = form.watch('photoDataUri');
  const itemName = form.watch('itemName');

  const getVerdictIcon = (verdict: string) => {
    if (verdict.includes("BUY NOW")) return <BadgeCheck className="text-green-500" />;
    if (verdict.includes("Good Deal")) return <TrendingUp className="text-blue-500" />;
    if (verdict.includes("Break-even")) return <AlertCircle className="text-yellow-500" />;
    return <AlertCircle className="text-destructive" />;
  }

  const getAuthenticityInfo = (verdict: VerifyItemValueOutput['authenticity']['verdict']) => {
    switch (verdict) {
      case 'AUTHENTIC':
        return { icon: ShieldCheck, color: 'text-green-500', bgColor: 'bg-green-500/10', text: 'Likely Authentic' };
      case 'POSSIBLE_FAKE':
        return { icon: ShieldAlert, color: 'text-destructive', bgColor: 'bg-destructive/10', text: 'Potential Fake' };
      default:
        return { icon: FileQuestion, color: 'text-muted-foreground', bgColor: 'bg-muted/50', text: 'Not Applicable' };
    }
  };


  if (currentStep === 4 && result) {
    const authInfo = getAuthenticityInfo(result.authenticity.verdict);
    const isViable = result.authenticity.verdict !== 'POSSIBLE_FAKE';

    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">{result.itemName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <Card className="bg-secondary text-center p-4">
                    <CardDescription>Resale Value</CardDescription>
                    <p className="text-2xl font-bold text-primary">
                        ${result.minResaleValue.toFixed(2)} - ${result.maxResaleValue.toFixed(2)}
                    </p>
                     <ComparablesModal
                        priceRange={{min: result.minResaleValue, max: result.maxResaleValue}}
                        confidence={result.authenticity.confidenceScore}
                    >
                        <Button variant="link" size="sm" className="p-0 h-auto">See comparables</Button>
                    </ComparablesModal>
                </Card>
                <Card className={cn("p-4 text-center", authInfo.bgColor)}>
                    <CardDescription>Authenticity</CardDescription>
                    <div className="flex items-center justify-center gap-2">
                        <authInfo.icon className={cn("size-6", authInfo.color)} />
                        <p className={cn("text-2xl font-bold", authInfo.color)}>
                            {authInfo.text}
                        </p>
                    </div>
                     <CardDescription className="text-xs mt-1">
                        AI confidence: {result.authenticity.confidenceScore.toFixed(0)}%
                    </CardDescription>
                </Card>
            </div>
             <p className="text-sm text-muted-foreground pt-2">{result.justification}</p>
          </CardContent>
          {isViable && (
            <CardFooter className="flex-col gap-4">
                <Button onClick={handleContinueToListing} size="lg" className="w-full">
                    Create Listing from Appraisal <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
          )}
        </Card>
        
        {result.authenticity.verdict === 'POSSIBLE_FAKE' && (
            <Alert variant="destructive" className="w-full text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authenticity Warning</AlertTitle>
                <AlertDescription>
                    Our AI found the following potential issues:
                    <ul className="list-disc pl-5 mt-2">
                        {result.authenticity.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
                    </ul>
                     <p className="mt-2 font-semibold">This item is not eligible for consignment.</p>
                </AlertDescription>
            </Alert>
        )}

        {result.profitAnalysis && (
             <Card className="w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        {getVerdictIcon(result.profitAnalysis.verdict)}
                    </div>
                    <CardTitle className="text-2xl">{result.profitAnalysis.verdict}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-left flex items-center"><ShoppingCart className="inline-block mr-2 size-4" />Asking Price</div>
                    <div className="text-right font-medium">${form.getValues('askingPrice')?.toFixed(2)}</div>
                    
                    <div className="text-left flex items-center"><DollarSign className="inline-block mr-2 size-4" />Potential Profit</div>
                    <div className="text-right font-medium text-green-600">${result.profitAnalysis.potentialGrossProfit.toFixed(2)}</div>

                    <div className="text-left flex items-center"><TrendingUp className="inline-block mr-2 size-4" />Potential ROI</div>
                    <div className="text-right font-medium text-green-600">{result.profitAnalysis.potentialRoiPercent.toFixed(1)}%</div>
                </CardContent>
             </Card>
        )}

        <Button onClick={handleReset} variant="outline" className="w-full max-w-xs">
          Verify Another Item
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
            <Progress value={(currentStep/3) * 100} className="w-full"/>
        </CardHeader>
        <CardContent className="p-6">
            <FormProvider {...form}>
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col items-center gap-6">
                
                {currentStep === 1 && (
                    <>
                    <CardTitle>Step 1: Provide an Item</CardTitle>
                    <FormField
                        control={form.control}
                        name="photoDataUri"
                        render={({ field }) => (
                            <FormItem className="w-full">
                            <FormControl>
                                <ImageUploader
                                onImageUpload={(uri) => field.onChange(uri || undefined)}
                                disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage className="text-center" />
                            </FormItem>
                        )}
                        />

                        <div className="flex items-center w-full max-w-md gap-4">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <Separator className="flex-1" />
                        </div>

                        <FormField
                        control={form.control}
                        name="itemName"
                        render={({ field }) => (
                            <FormItem className="w-full max-w-md">
                            <FormLabel>Item Name / Description</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="e.g., 'iPhone 13 Pro Max 256GB' or 'Vintage wooden rocking chair'"
                                {...field}
                                disabled={isLoading}
                                />
                            </FormControl>
                             <FormDescription className="text-xs">We use your photo only to generate valuations. We do not train models on private images without permission.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </>
                )}

                {currentStep === 2 && (
                    <>
                        <CardTitle>Step 2: Add Context</CardTitle>
                        <FormField
                            control={form.control}
                            name="condition"
                            render={({ field }) => (
                                <FormItem className="w-full max-w-md">
                                <FormLabel>Item Condition</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select the item's condition" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {conditions.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                        <FormField
                        control={form.control}
                        name="source"
                        render={({ field }) => (
                            <FormItem className="w-full max-w-md">
                            <FormLabel>Valuation Intent</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Where are you seeing this item?" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {sources.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </>
                )}
                 
                {currentStep === 3 && (
                     <>
                        <CardTitle>Step 3: Check Profit</CardTitle>
                        <FormField
                            control={form.control}
                            name="askingPrice"
                            render={({ field }) => (
                                <FormItem className="w-full max-w-md">
                                <FormLabel>Asking Price (Optional)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input type="number" step="0.01" placeholder="Enter price to check profit" className="pl-8" {...field} value={field.value ?? ''} disabled={isLoading} />
                                    </div>
                                </FormControl>
                                <FormDescription>Enter the price you would pay to see the potential ROI.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                     </>
                )}

                <div className={cn("flex w-full max-w-md pt-4", currentStep > 1 ? "justify-between" : "justify-end")}>
                    {currentStep > 1 && (
                        <Button type="button" variant="outline" onClick={handleBackStep} disabled={isLoading}>
                            Back
                        </Button>
                    )}
                    <Button type="button" onClick={handleNextStep} disabled={isLoading || (currentStep === 1 && !photoDataUri && !itemName)}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                        </>
                    ) : currentStep === 3 ? (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Verify Value
                        </>
                    ) : (
                       'Next'
                    )}
                    </Button>
                </div>
              </form>
            </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
