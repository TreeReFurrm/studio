'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, UserCheck, UserX, Send } from 'lucide-react';
import { useUser } from '@/firebase';
import { requestSecondaryService, SecondaryServiceOutput } from '@/ai/flows/request-secondary-service';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const serviceRequestSchema = z.object({
  serviceType: z.enum(['cleanout', 'organize', 'downsize'], { required_error: 'Please select a service.'}),
  zipCode: z.string().min(5, 'Please enter a valid 5-digit ZIP code.').max(5),
  notes: z.string().optional(),
});

type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;

export function ServiceRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SecondaryServiceOutput | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
  });

  const onSubmit = async (data: ServiceRequestFormData) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You need to be logged in to request a service.',
      });
      return;
    }
    
    setIsSubmitting(true);
    setResult(null);

    try {
      const output = await requestSecondaryService({
        ...data,
        userId: user.uid,
      });
      setResult(output);
    } catch (error) {
      console.error('Service request failed:', error);
      toast({
        variant: 'destructive',
        title: 'Request Failed',
        description: 'There was an error submitting your request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReset = () => {
    setResult(null);
    form.reset();
  }

  if (result) {
    const isMatched = result.status === 'MATCHED';
    return (
        <Card>
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    {isMatched ? <UserCheck className="size-10 text-primary" /> : <UserX className="size-10 text-destructive" />}
                </div>
                <CardTitle>{isMatched ? "We Found a Match!" : "No Match Found Yet"}</CardTitle>
                <CardDescription>{result.message}</CardDescription>
            </CardHeader>
            <CardContent>
                 <Alert variant={isMatched ? 'default' : 'destructive'}>
                    <AlertTitle>Next Steps</AlertTitle>
                    <AlertDescription>
                        {isMatched ? 
                        `Your request has been sent to ${result.assignedAmbassadorName}. They will contact you shortly to schedule the service.`
                        : `We've added your request to our waitlist. We are actively expanding our Ambassador network and will notify you as soon as someone becomes available in your area.`
                        }
                    </AlertDescription>
                </Alert>
                <Button onClick={handleReset} variant="outline" className="w-full mt-6">
                    Make Another Request
                </Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What service do you need?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cleanout">Home or Storage Clean-out</SelectItem>
                      <SelectItem value="organize">Organizational Services</SelectItem>
                      <SelectItem value="downsize">Downsizing Assistance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project ZIP Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your 5-digit ZIP code" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                        placeholder="e.g., 'Cleaning out a 10x20 storage unit. Contains mostly furniture and boxes of old electronics.' The more details, the better!" 
                        rows={4} 
                        {...field} 
                        disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit Request
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
