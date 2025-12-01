'use client';
import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUpload: (dataUri: string | null) => void;
  disabled?: boolean;
}

export function ImageUploader({ onImageUpload, disabled = false }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPreview(dataUri);
        onImageUpload(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        disabled={disabled}
      />
      {!preview ? (
        <Card
          onClick={triggerFileInput}
          className={cn(
            "border-2 border-dashed hover:border-primary hover:bg-accent transition-colors",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          )}
        >
          <CardContent className="flex flex-col items-center justify-center p-10 text-center gap-4">
            <Camera className="h-12 w-12 text-muted-foreground" />
            <p className="font-medium text-muted-foreground">
              Click to upload a photo
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, or GIF
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative w-full aspect-square max-w-sm mx-auto">
          <Image
            src={preview}
            alt="Item preview"
            fill
            className="object-cover rounded-lg"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full h-8 w-8"
            onClick={handleRemoveImage}
            disabled={disabled}
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
