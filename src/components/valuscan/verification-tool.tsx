'use client';

import { useState } from 'react';
import { ImageUploader } from './image-uploader';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { verifyItemValue, type VerifyItemValueOutput } from '@/ai/flows/verify-item-value';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function VerificationTool() {
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerifyItemValueOutput | null>(null);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!photoDataUri) {
      toast({
        variant: "destructive",
        title: "No Photo",
        description: "Please upload a photo of the item to verify its value.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const output = await verifyItemValue({ photoDataUri });
      setResult(output);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "The AI could not determine the value. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPhotoDataUri(null);
    setResult(null);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {!result && (
          <div className="flex flex-col items-center gap-6">
            <ImageUploader
              onImageUpload={setPhotoDataUri}
              disabled={isLoading}
            />
            <Button onClick={handleVerify} disabled={isLoading || !photoDataUri} className="w-full max-w-xs">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Verify Value
                </>
              )}
            </Button>
          </div>
        )}

        {result && (
          <div className="flex flex-col items-center gap-6 text-center">
            <Card className="w-full bg-secondary">
              <CardHeader>
                <CardDescription>True Market Value</CardDescription>
                <CardTitle className="text-4xl font-bold text-primary">
                  {result.trueMarketValue}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{result.justification}</p>
              </CardContent>
            </Card>
            <Button onClick={handleReset} variant="outline" className="w-full max-w-xs">
              Verify Another Item
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
