
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// --- UPC Tool Output Schema ---
const VendorPricingSchema = z.object({
  vendor: z.string().describe('The name of the vendor or marketplace.'),
  price: z.number().describe('The listed price.'),
  isNew: z.boolean().describe('True if the price is for a new item, false for used/average.'),
});

// --- UPC Input Schema ---
const UpcInputSchema = z.object({
  upcCode: z.string().min(10, 'UPC must be at least 10 digits.').describe('The 10-14 digit UPC code to look up.'),
  askingPrice: z.coerce.number().min(0, 'Asking price must be a positive number.').describe('The price the user would have to pay for the item.'),
});
export type UpcInput = z.infer<typeof UpcInputSchema>;

// --- UPC Final Output Schema ---
const UpcOutputSchema = z.object({
  itemName: z.string().describe('The identified name of the product.'),
  comparisonAvailable: z.boolean().describe('True if the UPC was found in the database.'),
  verdict: z.enum(['Excellent Deal', 'Potential Deal', 'Warning']).describe('The Deal Checker verdict: Excellent Deal (high profit), Potential Deal (low profit), or Warning (no resale).'),
  potentialProfit: z.number().describe('The estimated net profit after fees.'),
  suggestedListingPrice: z.number().describe('The AI suggested price to list the item for fast resale.'),
  pricingData: z.array(VendorPricingSchema).describe('Detailed list of prices found across vendors.'),
});
export type UpcOutput = z.infer<typeof UpcOutputSchema>;

// Simulated database mimicking UPC_VENDOR_DATA from Python
const upcDatabase: Record<string, { name: string, data: z.infer<typeof VendorPricingSchema>[] }> = {
  "850020123456": {
    name: "Gaming Laptop (Mid-Tier)",
    data: [
        {vendor: "Amazon (New)", price: 1299.99, isNew: true},
        {vendor: "Best Buy (Open Box)", price: 1050.00, isNew: false},
        {vendor: "eBay (Completed Sales Avg)", price: 950.00, isNew: false},
    ],
  },
  "000456789012": {
    name: "Generic Power Drill",
    data: [
        {vendor: "Home Depot (New)", price: 89.99, isNew: true},
        {vendor: "eBay (Completed Sales Avg)", price: 45.00, isNew: false},
        {vendor: "Local Marketplace Avg)", price: 35.00, isNew: false},
    ],
  },
};

// The core tool function
const upcLookupTool = ai.defineTool({
    name: 'upcLookup',
    description: 'Looks up the UPC code and returns pricing data from various vendors.',
    inputSchema: z.object({ upc: z.string() }),
    outputSchema: z.any(), // Returning a simple object to the flow
    async invoke({ upc }) {
        const result = upcDatabase[upc];
        if (!result) {
            return { found: false };
        }
        return { 
            found: true, 
            name: result.name, 
            pricingData: result.data 
        };
    },
});

export async function upcDealChecker(input: UpcInput): Promise<UpcOutput> {
  return upcDealCheckerFlow(input);
}

const upcDealCheckerFlow = ai.defineFlow(
  {
    name: 'upcDealCheckerFlow',
    inputSchema: UpcInputSchema,
    outputSchema: UpcOutputSchema,
    tools: [upcLookupTool], // Make the tool available to the flow
  },
  async (input) => {
    const { upcCode, askingPrice } = input;
    
    // 1. Tool Call: Get the raw data
    const toolResult = await upcLookupTool.invoke({ upc: upcCode });

    if (!toolResult.found) {
        return {
            itemName: 'Unknown Product',
            comparisonAvailable: false,
            verdict: 'Warning',
            potentialProfit: 0,
            suggestedListingPrice: 0,
            pricingData: [],
        };
    }

    const { name, pricingData } = toolResult;
    
    // 2. Financial Analysis (Mirroring Python Logic)
    const resalePrices = pricingData
        .filter((p: any) => !p.isNew)
        .map((p: any) => p.price);
        
    let avgResale = 0;
    if (resalePrices.length > 0) {
        avgResale = resalePrices.reduce((sum: number, price: number) => sum + price, 0) / resalePrices.length;
    } else {
        // Fallback or warning logic if only retail prices exist
        const retailPrices = pricingData.map((p: any) => p.price);
        avgResale = retailPrices.reduce((sum: number, price: number) => sum + price, 0) / retailPrices.length;
    }

    const ESTIMATED_FEE_RATE = 0.15; // 15% marketplace fees
    const netResaleValue = avgResale * (1 - ESTIMATED_FEE_RATE);
    const potentialGrossProfit = netResaleValue - askingPrice;
    
    // 3. Set Final Verdict
    let verdict: 'Excellent Deal' | 'Potential Deal' | 'Warning' = 'Potential Deal';
    if (potentialGrossProfit > 50 && avgResale > askingPrice * 1.5) {
        verdict = 'Excellent Deal'; // High Profit and good margin
    } else if (potentialGrossProfit <= 0) {
        verdict = 'Warning'; // Likely a loss
    }
    
    return {
        itemName: name,
        comparisonAvailable: true,
        verdict: verdict,
        potentialProfit: parseFloat(potentialGrossProfit.toFixed(2)),
        suggestedListingPrice: parseFloat(avgResale.toFixed(2)),
        pricingData: pricingData,
    };
  }
);
