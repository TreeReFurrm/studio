
'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { upcDealChecker, type UpcInput, type UpcOutput } from '@/ai/flows/upc-deal-checker';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Loader2, Sparkles, DollarSign, TrendingUp, AlertCircle, BadgeCheck, Barcode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { z } from 'zod';

const upcSchema = z.object({
  upcCode: z.string().min(10, 'UPC must be at least 10-14 digits.').max(14, 'UPC must be at least 10-14 digits.'),
  askingPrice: z.coerce.number().min(0.01, 'Please enter a price greater than 0.'),
});

export function UpcChecker() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<UpcOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<UpcInput>({
    resolver: zodResolver(upcSchema),
    defaultValues: {
      upcCode: '',
      askingPrice: undefined,
    },
  });

  const onSubmit = async (data: UpcInput) => {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await upcDealChecker(data);
      setResult(output);
      if (!output.comparisonAvailable) {
        toast({
            variant: "default",
            title: "UPC Not Found",
            description: "We couldn't find this UPC in our database. Results may be limited.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Check Failed",
        description: "The AI could not process the UPC code. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setIsLoading(false);
    form.reset();
  };

  const getVerdictInfo = (verdict: UpcOutput['verdict']) => {
    switch (verdict) {
      case 'Excellent Deal':
        return { icon: BadgeCheck, color: 'text-green-500', text: 'Excellent Deal' };
      case 'Potential Deal':
        return { icon: TrendingUp, color: 'text-blue-500', text: 'Potential Deal' };
      default:
        return { icon: AlertCircle, color: 'text-destructive', text: 'Warning' };
    }
  };

  if (isLoading) {
      return (
        <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing deal against live market data...</p>
        </div>
      )
  }

  if (result) {
    const verdictInfo = getVerdictInfo(result.verdict);
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">{result.itemName}</CardTitle>
            <CardDescription>UPC: {form.getValues('upcCode')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant={result.verdict === 'Warning' ? 'destructive' : 'default'} className="text-left">
              <verdictInfo.icon className={verdictInfo.color} />
              <AlertTitle>{verdictInfo.text}</AlertTitle>
              <AlertDescription>
                Potential Profit: <span className="font-bold">${result.potentialProfit.toFixed(2)}</span>
              </AlertDescription>
            </Alert>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {result.pricingData.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.vendor}</TableCell>
                            <TableCell>{item.isNew ? 'New' : 'Used/Resale'}</TableCell>
                            <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                     <TableRow className="font-bold bg-secondary">
                        <TableCell colSpan={2}>Suggested Resale Listing Price</TableCell>
                        <TableCell className="text-right">${result.suggestedListingPrice.toFixed(2)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button onClick={handleReset} variant="outline" className="w-full">
                Check Another UPC
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="upcCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UPC or Barcode (10-14 digits)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="e.g. 0123456789012" className="pl-8" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="askingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asking Price (USD)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="number" step="0.01" placeholder="e.g. 149.99" className="pl-8" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Analyze Deal
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
