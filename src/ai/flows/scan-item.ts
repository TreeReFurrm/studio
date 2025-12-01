
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ScanItemInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ScanItemInput = z.infer<typeof ScanItemInputSchema>;


const ScanItemOutputSchema = z.object({
  // CORE APPRAISAL DATA
  itemName: z.string().describe('The name of the item identified in the photo.'),
  categoryTag: z.enum(['LUXURY_GOODS', 'POWER_TOOL', 'VINTAGE_COLLECTIBLE', 'SAFETY_HYGIENE', 'CONSUMABLE', 'GENERAL']).describe('The primary market category for internal routing and pricing logic.'),

  // PRICE DATA (With essential Price Type flag)
  priceType: z.enum(['RESALE', 'RETAIL']).describe('The type of price provided: RESALE (for flippable items) or RETAIL (for items with no resale value).'),
  minPrice: z.number().describe('The minimum realistic price (resale or retail, based on priceType).'),
  maxPrice: z.number().describe('The maximum realistic price (resale or retail, based on priceType).'),
  appraisalNote: z
    .string()
    .describe('A brief, honest note about the price, reinforcing the priceType and condition. (The justification).'),
  
  // FAKE SCOUTER INTEGRATION
  authenticityVerdict: z.enum(['AUTHENTIC', 'POSSIBLE_FAKE', 'LOW_RISK']).describe('The AI’s initial verdict on authenticity. Must be run for all high-value items.'),
  
  // BUSINESS LOGIC FLAG
  isConsignmentViable: z.boolean().describe('True if the item is AUTHENTIC and the priceType is RESALE. This flag gates the consignment flow.'),
});
export type ScanItemOutput = z.infer<typeof ScanItemOutputSchema>;

async function callScanItemPrompt(input: ScanItemInput): Promise<ScanItemOutput> {
  const {output} = await scanItemPrompt(input);
  if (!output) {
    throw new Error('Failed to get a structured response from the AI.');
  }
  return output;
}

const scanItemPrompt = ai.definePrompt({
  name: 'scanItemPrompt',
  input: { schema: ScanItemInputSchema },
  output: { schema: ScanItemOutputSchema },
  prompt: `You are an expert appraiser focused on realistic resale value, item categorization, and authentication. A user will provide you with a photo of an item.

**Primary Task:**
1.  **Identify** the item and assign a **categoryTag**.
2.  Determine a realistic price range based on **completed sales data**.
3.  Assess the item's **authenticity** (if applicable) and set the **authenticityVerdict**.

**CRITICAL PRICING RULE (The "Real Human Logic"):**
-   If the item is suitable for resale (i.e., not a hygiene, safety, or opened consumable risk), set **priceType** to **RESALE**.
-   If the item has **no resale value** (due to safety, hygiene, or being an opened consumable), set **priceType** to **RETAIL**. The prices you provide must then be the estimated **original retail value**.

**CRITICAL BUSINESS RULE:**
-   Set **isConsignmentViable** to **true** ONLY if **priceType** is **RESALE** AND **authenticityVerdict** is **AUTHENTIC** or **LOW_RISK**. Otherwise, set it to **false** (reject the consignment).

Example (Resale & Authentic):
- itemName: "Proenza Schouler PS1 Tiny Bag"
- categoryTag: "LUXURY_GOODS"
- priceType: "RESALE"
- minPrice: 380.00
- maxPrice: 450.00
- appraisalNote: "Based on recently completed sales, this is a realistic, non-fluffed range for this bag in good condition."
- authenticityVerdict: "AUTHENTIC"
- isConsignmentViable: true

Example (Retail Fallback & Rejected):
- itemName: "Used Bicycle Helmet (Scratched)"
- categoryTag: "SAFETY_HYGIENE"
- priceType: "RETAIL"
- minPrice: 99.00
- maxPrice: 110.00
- appraisalNote: "Due to safety concerns and usage, this item has no resale value. The price shown is the estimated original retail value."
- authenticityVerdict: "LOW_RISK"
- isConsignmentViable: false

Photo: {{media url=photoDataUri}}

Respond strictly with the requested JSON output structure.`,
});


export async function scanItem(input: ScanItemInput): Promise<ScanItemOutput> {
    return await callScanItemPrompt(input);
}

ai.defineFlow(
  {
    name: 'scanItemFlow',
    inputSchema: ScanItemInputSchema,
    outputSchema: ScanItemOutputSchema,
  },
  scanItem
);
