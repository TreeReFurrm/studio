'use client';
import { useState, useRef, ChangeEvent, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Upload, Loader2, RefreshCw, SwitchCamera } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface ImageUploaderProps {
  onImageUpload: (dataUri: string | null) => void;
  disabled?: boolean;
}

export function ImageUploader({ onImageUpload, disabled = false }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const [mode, setMode] = useState<'upload' | 'camera'>('upload');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>(undefined);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startStream = useCallback(async (deviceId?: string) => {
    stopStream();
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : 'environment', // Prefer rear camera by default
        }
      });
      setStream(newStream);
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setHasCameraPermission(false);
      toast({
        variant: "destructive",
        title: "Camera Access Denied",
        description: "Please enable camera permissions in your browser settings."
      });
    }
  }, [stopStream, toast]);

  useEffect(() => {
    if (mode === 'camera' && !isCameraOpen) {
      navigator.mediaDevices.enumerateDevices().then(allDevices => {
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        const initialDeviceId = videoDevices.find(d => d.label.toLowerCase().includes('back'))?.deviceId || videoDevices[0]?.deviceId;
        setActiveDeviceId(initialDeviceId);
        setIsCameraOpen(true);
        startStream(initialDeviceId);
      });
    } else if (mode !== 'camera' && isCameraOpen) {
      stopStream();
      setIsCameraOpen(false);
    }

    return () => {
      // Ensure stream is stopped on component unmount
      if(isCameraOpen) {
        stopStream();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleFileProcessing = useCallback(async (file: File) => {
    if (file.type && !file.type.startsWith('image/')) {
        toast({
            title: 'Invalid File',
            description: 'Please upload an image file.',
            variant: 'destructive',
        });
        return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
            title: 'File Too Large',
            description: 'Please upload an image smaller than 5MB.',
            variant: 'destructive',
        });
        return;
    }

    try {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const dataUri = event.target.result as string;
            setPreview(dataUri);
            onImageUpload(dataUri);
          } else {
            throw new Error('Failed to read file.');
          }
        };
        reader.onerror = (error) => { throw error };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error(error);
        toast({
            title: 'Upload Failed',
            description: 'Could not process the image file.',
            variant: 'destructive',
        });
    }
  }, [onImageUpload, toast]);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileProcessing(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if(mode === 'camera' && !stream) {
      startStream(activeDeviceId);
    }
  };

  const triggerFileInput = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if(!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await handleFileProcessing(file);
      e.dataTransfer.clearData();
    }
  }, [disabled, handleFileProcessing]);

  const dropZoneClasses = cn(
    "flex flex-col items-center justify-center p-10 text-center border-2 border-dashed rounded-lg transition-colors h-full",
    disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
    isDragging ? "border-primary bg-accent" : "border-border hover:border-primary/80 hover:bg-accent/50",
  );

  const handleSnap = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/png');
        setPreview(dataUri);
        onImageUpload(dataUri);
        stopStream();
    }
  };
  
  const handleSwitchCamera = () => {
    if(devices.length < 2) return;
    const currentDeviceIndex = devices.findIndex(device => device.deviceId === activeDeviceId);
    const nextDeviceIndex = (currentDeviceIndex + 1) % devices.length;
    const nextDeviceId = devices[nextDeviceIndex]?.deviceId;
    setActiveDeviceId(nextDeviceId);
    startStream(nextDeviceId);
  };

  if (preview) {
    return (
      <div className="relative w-full aspect-square max-w-sm mx-auto">
        <Image
          src={preview}
          alt="Item preview"
          fill
          className="object-cover rounded-lg shadow-md"
        />
        <Button
          variant="destructive"
          className="absolute top-2 right-2 rounded-full h-auto z-10"
          onClick={handleRemoveImage}
          disabled={disabled}
          aria-label="Retake photo"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retake
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
        <canvas ref={canvasRef} className="hidden" />
        <Tabs defaultValue="upload" value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" disabled={disabled}> <Upload className="mr-2 h-4 w-4"/> Upload File</TabsTrigger>
                <TabsTrigger value="camera" disabled={disabled}><Camera className="mr-2 h-4 w-4"/>Use Camera</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
                <div
                    className={dropZoneClasses}
                    onClick={triggerFileInput}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                        disabled={disabled}
                    />
                    <div className="flex flex-col items-center space-y-3">
                        {disabled ? (
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        ) : (
                            <Upload className="w-8 h-8 text-muted-foreground" />
                        )}

                        <p className="font-semibold text-lg">
                            {disabled ? "Analyzing Item..." : "Drag & Drop or Click"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            to upload an image for AI appraisal.
                        </p>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="camera">
                <div className="space-y-4 p-4">
                    <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                        <video ref={videoRef} className={cn("w-full h-full object-cover", !stream && "hidden")} autoPlay muted playsInline />
                        {!stream && hasCameraPermission !== false && (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin"/>
                            <p>Starting camera...</p>
                          </div>
                        )}
                        {hasCameraPermission === false && (
                           <Alert variant="destructive" className="w-auto">
                              <AlertTitle>Camera Access Required</AlertTitle>
                              <AlertDescription>
                                Please allow camera access in your browser to use this feature.
                              </AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <div className="flex justify-center gap-4">
                        <Button onClick={handleSnap} disabled={!stream || disabled} size="lg">
                            <Camera className="mr-2"/> Snap Photo
                        </Button>
                        {devices.length > 1 && (
                            <Button onClick={handleSwitchCamera} disabled={!stream || disabled} variant="outline" size="icon" aria-label="Switch Camera">
                                <SwitchCamera />
                            </Button>
                        )}
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    </Card>
  );
}
