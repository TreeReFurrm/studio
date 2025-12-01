
'use server';

/**
 * @fileOverview This file defines a Genkit flow for verifying the value of an item using AI.
 *
 * The flow takes an image of an item, its condition, the source context, and an optional asking price.
 * It returns its estimated "min" and "max" resale value, and if an asking price is provided,
 * it also calculates the potential profit opportunity. It now also includes an authenticity check.
 *
 * @exported verifyItemValue - An async function that initiates the item value verification flow.
 * @exported VerifyItemValueInput - The input type for the verifyItemValue function.
 * @exported VerifyItemValueOutput - The output type for the verifyItemValue function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { scoutFakes } from './scout-fakes';

const VerifyItemValueInputSchema = z.object({
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of the item to be valued, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  itemName: z.string().optional().describe("The name/description of the item if no photo is provided."),
    condition: z.enum([
        "New (Sealed)",
        "Excellent (Like New)",
        "Good (Used, Working)",
        "Fair (Scratches/Minor Issue)",
    ]).describe("The item's physical condition."),
    source: z.enum([
        "Personal Garage/Storage",
        "Yard Sale/Flea Market (Buying)",
        "Retail Store (Walmart/Target)",
        "Online Marketplace (eBay/Poshmark)",
    ]).describe("The context of the valuation (e.g., where the user is)."),
    askingPrice: z.number().optional().describe("The price the user is seeing for the item.")
});
export type VerifyItemValueInput = z.infer<typeof VerifyItemValueInputSchema>;

const ProfitAnalysisSchema = z.object({
    estimatedNetResale: z.number().describe("The estimated resale value after a 15% marketplace fee."),
    potentialGrossProfit: z.number().describe("The potential gross profit if sold at max resale value."),
    potentialRoiPercent: z.number().describe("The potential return on investment percentage."),
    verdict: z.string().describe("A short verdict on whether it's a good deal.")
});

const AuthenticitySchema = z.object({
    verdict: z.enum(["AUTHENTIC", "POSSIBLE_FAKE", "NOT_APPLICABLE", "LOW_RISK"]),
    confidenceScore: z.number(),
    reasons: z.array(z.string()),
});

const VerifyItemValueOutputSchema = z.object({
  itemName: z.string().describe("The name of the item identified in the photo."),
  minResaleValue: z
    .number()
    .describe(
      'The calculated minimum resale value for a quick sale.'
    ),
  maxResaleValue: z
    .number()
    .describe(
      'The calculated maximum resale value for a fair market price.'
    ),
  justification: z
    .string()
    .describe(
      'A brief justification for the estimated market value, or a disclaimer if not resellable.'
    ),
  profitAnalysis: ProfitAnalysisSchema.optional().describe("An analysis of the profit opportunity if an asking price is provided."),
  authenticity: AuthenticitySchema.describe("The result of the authenticity check."),
});
export type VerifyItemValueOutput = z.infer<typeof VerifyItemValueOutputSchema>;

export async function verifyItemValue(
  input: VerifyItemValueInput
): Promise<VerifyItemValueOutput> {
  return verifyItemValueFlow(input);
}

const verifyItemValuePrompt = ai.definePrompt({
  name: 'verifyItemValuePrompt',
  input: {schema: z.object({
    photoDataUri: z.string().optional(),
    itemName: z.string().optional(),
    condition: z.string(),
    source: z.string(),
    askingPrice: z.number().optional(),
  })},
  output: {schema: z.object({
    itemName: z.string(),
    minResaleValue: z.number(),
    maxResaleValue: z.number(),
    justification: z.string(),
    profitAnalysis: ProfitAnalysisSchema.optional(),
  })},
  prompt: `You are an expert pricing analyst and auctioneer, skilled at determining the true market value of items and identifying profit opportunities. Your job is to think like a human reseller, flagging non-resellable items and giving realistic price ranges.

First, identify the item. If a photo is provided, use it. If not, use the provided item name.

Then, use the following data and multipliers to calculate a realistic resale value range, as if you were pricing it for a real auction.

CORE_MARKET_DATA = {
    "Gaming Laptop (Mid-Tier)": { avg_resale: 650.00, is_high_risk: false },
    "KitchenAid Stand Mixer (Used)": { avg_resale: 150.00, is_high_risk: false },
    "Vintage Vinyl Record (Specific Title)": { avg_resale: 15.00, is_high_risk: false },
    "Unopened Lego Set (Current)": { avg_resale: 80.00, is_high_risk: false },
    "Proenza Schouler PS1 Tiny Bag": { avg_resale: 450.00, is_high_risk: false },
    "iPhone 14 Plus (Used)": { avg_resale: 341.00, is_high_risk: false },
    "iPhone 13 pro max": { avg_resale: 300.00, is_high_risk: false },
    "Hermes Birkin Bag": { avg_resale: 9000.00, is_high_risk: false },
    "Rolex Submariner Watch": { avg_resale: 12000.00, is_high_risk: false },
    "Used Bike Helmet": { avg_resale: 0, is_high_risk: true, retail: 100.00 },
    "Opened Vitamin Supplements": { avg_resale: 0, is_high_risk: true, retail: 45.00 }
}

CONDITION_MULTIPLIERS = {
    "New (Sealed)": 1.25,
    "Excellent (Like New)": 1.05,
    "Good (Used, Working)": 0.90,
    "Fair (Scratches/Minor Issue)": 0.70,
}

SOURCE_MULTIPLIERS = {
    "Personal Garage/Storage": 0.95,
    "Yard Sale/Flea Market (Buying)": 0.65,
    "Retail Store (Walmart/Target)": 1.20,
    "Online Marketplace (eBay/Poshmark)": 1.00,
}

**REAL HUMAN LOGIC CHECK:**
If the identified item has 'is_high_risk: true' and the condition is not 'New (Sealed)':
1.  Set both 'minResaleValue' and 'maxResaleValue' to the item's 'retail' price.
2.  Create a 'justification' that starts with "***NO RESALE VALUE.***" and explains that hygiene/safety rules prevent resale, and clearly state that the price shown is the estimated original RETAIL price.
3.  If profit analysis is requested, set the verdict to "DO NOT BUY".

**STANDARD VALUE CALCULATION STEPS:**
1. Find the 'avg_resale' price for the identified item from CORE_MARKET_DATA. If not found, use a reasonable estimate.
2. Get the 'condition_multiplier' for the user's input: {{{condition}}}.
3. Get the 'source_multiplier' for the user's input: {{{source}}}.
4. Calculate 'base_rsp' = avg_resale * condition_multiplier.
5. Calculate 'min_resale_value' = base_rsp * 0.85.
6. Calculate 'max_resale_value' = base_rsp * 1.15 * source_multiplier.
7. Ensure min_resale_value is not greater than max_resale_value. If it is, set min_resale_value = max_resale_value * 0.9.
8. Create a 'justification' string explaining how the base price was adjusted by the multipliers.

{{#if askingPrice}}
**PROFIT ANALYSIS STEPS (only for standard items):**
1. If the item is high-risk, set verdict to "DO NOT BUY" and all financial values to 0.
2. Otherwise, use the 'max_resale_value' calculated above.
3. Assume a standard 15% marketplace fee. Calculate 'net_resale_value' = max_resale_value * (1 - 0.15).
4. Calculate 'potential_gross_profit' = net_resale_value - {{{askingPrice}}}.
5. If potential_gross_profit > 0, calculate 'roi_percentage' = (potential_gross_profit / {{{askingPrice}}}) * 100. Otherwise, ROI is 0.
6. Determine the 'verdict':
   - If roi_percentage > 50, "BUY NOW! Major Profit Opportunity."
   - If roi_percentage > 0, "Good Deal, worth the flip."
   - If potential_gross_profit >= -10, "Break-even risk. Only buy if condition is perfect."
   - Otherwise, "NO DEAL. Asking price is too high."
7. Populate the 'profitAnalysis' object in the output.
{{/if}}


Analyze the following user inputs. Use the photo if available, otherwise use the item name.
{{#if photoDataUri}}
Photo: {{media url=photoDataUri}}
{{/if}}
{{#if itemName}}
Item Name: {{{itemName}}}
{{/if}}
Condition: {{{condition}}}
Source: {{{source}}}
{{#if askingPrice}}
Asking Price: {{{askingPrice}}}
{{/if}}

Respond with the identified item name, min/max resale values, a justification, and the profit analysis if an asking price was provided.
  `,
});

const verifyItemValueFlow = ai.defineFlow(
  {
    name: 'verifyItemValueFlow',
    inputSchema: VerifyItemValueInputSchema,
    outputSchema: VerifyItemValueOutputSchema,
  },
  async input => {
    // Run value verification and fake scouting in parallel
    const [valueResult, authenticityResult] = await Promise.all([
      verifyItemValuePrompt(input),
      scoutFakes({
        itemName: input.itemName || "Item from photo", // The LLM will identify the true name
        checkLocation: input.source.includes("Market") ? "Auction Photo" : "In-Hand Scan"
      })
    ]);
    
    if (!valueResult.output) {
      throw new Error("Value verification failed to produce an output.");
    }

    // The fake scouter needs the *actual* item name identified by the value promp.
    // So we run it again with the correct name.
    const finalAuthenticityResult = await scoutFakes({
        itemName: valueResult.output.itemName,
        checkLocation: input.source.includes("Market") ? "Auction Photo" : "In-Hand Scan"
    });

    return {
        ...valueResult.output,
        authenticity: finalAuthenticityResult,
    };
  }
);
