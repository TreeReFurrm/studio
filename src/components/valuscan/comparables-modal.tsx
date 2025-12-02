
'use client';

import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { MOCK_COMPARABLES, type Comparable } from '@/lib/mock-comparables';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { format } from 'date-fns';

interface ComparablesModalProps {
  children: ReactNode;
  priceRange: { min: number; max: number };
  confidence: number;
}

export function ComparablesModal({ children, priceRange, confidence }: ComparablesModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>See Comparables</DialogTitle>
          <DialogDescription>
            These recent sales and active listings were used to calculate the suggested price range.
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-lg p-4 flex justify-around text-center text-sm bg-muted/50">
            <div>
                <p className="text-muted-foreground">Suggested Range</p>
                <p className="font-bold text-lg">${priceRange.min.toFixed(2)} - ${priceRange.max.toFixed(2)}</p>
            </div>
             <div>
                <p className="text-muted-foreground">Confidence</p>
                <p className="font-bold text-lg">{confidence.toFixed(0)}%</p>
            </div>
            <div>
                <p className="text-muted-foreground">Sample Size</p>
                <p className="font-bold text-lg">{MOCK_COMPARABLES.length} comparables</p>
            </div>
             <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-bold text-lg">{format(new Date(), 'MM/dd/yyyy')}</p>
            </div>
        </div>
        
        <div className="flex-grow relative">
            <ScrollArea className="absolute inset-0">
                <Table>
                <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                    <TableHead className="w-[60px]">Photo</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Marketplace</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {MOCK_COMPARABLES.map((comp) => (
                    <TableRow key={comp.id}>
                        <TableCell>
                        <Image
                            src={comp.imageUrl}
                            alt={comp.title}
                            width={48}
                            height={48}
                            className="rounded-md object-cover"
                        />
                        </TableCell>
                        <TableCell className="font-medium max-w-[300px] truncate">{comp.title}</TableCell>
                        <TableCell>{comp.marketplace}</TableCell>
                        <TableCell>
                        <Badge variant={comp.condition === 'New' ? 'default' : 'secondary'}>{comp.condition}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                            ${comp.price.toFixed(2)}
                            <Badge variant={comp.type === 'Sold' ? 'outline' : 'destructive'} className="ml-2">{comp.type}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(comp.date), 'MM/dd/yyyy')}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="secondary">Export Comparables (CSV)</Button>
          <Button>Use This Range</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
