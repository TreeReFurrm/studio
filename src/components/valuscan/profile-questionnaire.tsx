
'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Progress } from '../ui/progress';

const PROFILE_QUESTIONS = [
    {
        key: "mainGoal",
        question: "What's your main goal with ValuScan?",
        options: [
            "I want to make money",
            "Save money on things I need",
            "Shop sustainably and find unique pieces",
            "All of the above",
        ]
    },
    {
        key: "thriftingStyle",
        question: "Do you have a specific thrifting style?",
        options: [
            "Unique, story-rich items",
            "Deals & Discounts",
            "Quick Flips",
            "No specific style",
        ]
    },
    {
        key: "skillLevel",
        question: "Have you ever walked past a high-value item thinking it was junk?",
        options: [
            "Yes, probably all the time (Low Skill)",
            "Maybe once or twice (Medium Skill)",
            "I'm pretty good at spotting value (High Skill)",
        ]
    },
    {
        key: "coreStruggle",
        question: "What's your biggest struggle when looking for value?",
        options: [
            "I don't know what to look for",
            "Unsure what's actually valuable",
            "It's a hassle figuring out what things are really worth",
        ]
    }
];

const profileSchema = z.object({
  mainGoal: z.string({ required_error: 'Please select an option.' }),
  thriftingStyle: z.string({ required_error: 'Please select an option.' }),
  skillLevel: z.string({ required_error: 'Please select an option.' }),
  coreStruggle: z.string({ required_error: 'Please select an option.' }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileQuestionnaire() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to save your profile.',
      });
      return;
    }

    setIsSubmitting(true);
    
    let priceStrategy = 'Balanced_Resale';
    let notes = 'AI will provide a balanced estimate of item value.';

    if (data.mainGoal.includes("make money") && data.thriftingStyle === "Quick Flips") {
        priceStrategy = "Speed_to_Sale";
        notes = "AI will favor lower Min Prices for faster transactions.";
    } else if (data.mainGoal.includes("sustainably")) {
        priceStrategy = "Ethical_Value";
        notes = "AI will emphasize unique/vintage identification.";
    }

    const profileData = {
        ...data,
        priceStrategy,
        notes,
    };

    try {
      const userRef = doc(firestore, 'users', user.uid);
      setDocumentNonBlocking(userRef, profileData, { merge: true });

      toast({
        title: "Profile Saved!",
        description: "Your AI has been calibrated to your preferences.",
      });
      router.push('/account');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'There was an error saving your profile.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    const fieldName = PROFILE_QUESTIONS[currentStep].key as keyof ProfileFormData;
    const isValid = await form.trigger(fieldName);
    if (isValid) {
      if (currentStep < PROFILE_QUESTIONS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        form.handleSubmit(onSubmit)();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const progress = ((currentStep + 1) / PROFILE_QUESTIONS.length) * 100;

  return (
    <Card>
      <CardContent className="p-6">
        <FormProvider {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <Progress value={progress} className="w-full" />
            
            <FormField
              control={form.control}
              name={PROFILE_QUESTIONS[currentStep].key as keyof ProfileFormData}
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-lg font-semibold">{PROFILE_QUESTIONS[currentStep].question}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      {PROFILE_QUESTIONS[currentStep].options.map((option) => {
                         const cleanOption = option.replace(/\[\d\]\s/, '');
                         return (
                            <FormItem key={cleanOption} className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent has-[[data-state=checked]]:bg-secondary">
                                <FormControl>
                                <RadioGroupItem value={cleanOption} />
                                </FormControl>
                                <FormLabel className="font-normal w-full cursor-pointer">
                                {cleanOption}
                                </FormLabel>
                            </FormItem>
                         )
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center pt-4">
                <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 0 || isSubmitting}>
                    Back
                </Button>
                <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                       currentStep === PROFILE_QUESTIONS.length - 1 ? 'Finish & Save' : 'Next'
                    )}
                </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
