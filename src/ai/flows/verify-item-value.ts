
'use server';

/**
 * @fileOverview This file defines a Genkit flow for verifying the value of an item using AI.
 *
 * The flow takes an image of an item, its condition, and the source context as input,
 * and returns its estimated "min" and "max" resale value.
 *
 * @exported verifyItemValue - An async function that initiates the item value verification flow.
 * @exported VerifyItemValueInput - The input type for the verifyItemValue function.
 * @exported VerifyItemValueOutput - The output type for the verifyItemValue function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyItemValueInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the item to be valued, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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
    ]).describe("The context of the valuation (e.g., where the user is).")
});
export type VerifyItemValueInput = z.infer<typeof VerifyItemValueInputSchema>;

const VerifyItemValueOutputSchema = z.object({
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
      'A brief justification for the estimated market value, including the multipliers used.'
    ),
});
export type VerifyItemValueOutput = z.infer<typeof VerifyItemValueOutputSchema>;

export async function verifyItemValue(
  input: VerifyItemValueInput
): Promise<VerifyItemValueOutput> {
  return verifyItemValueFlow(input);
}

const verifyItemValuePrompt = ai.definePrompt({
  name: 'verifyItemValuePrompt',
  input: {schema: VerifyItemValueInputSchema},
  output: {schema: VerifyItemValueOutputSchema},
  prompt: `You are an expert appraiser, skilled at determining the true market value of items based on their image, condition, and source.

First, identify the item in the photo.

Then, use the following data and multipliers to calculate a realistic resale value range.

CORE_MARKET_DATA = {
    "Gaming Laptop (Mid-Tier)": { avg_resale: 650.00 },
    "KitchenAid Stand Mixer (Used)": { avg_resale: 150.00 },
    "Vintage Vinyl Record (Specific Title)": { avg_resale: 15.00 },
    "Unopened Lego Set (Current)": { avg_resale: 80.00 },
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

Calculation Steps:
1. Find the 'avg_resale' price for the identified item from CORE_MARKET_DATA. If not found, use a reasonable estimate.
2. Get the 'condition_multiplier' for the user's input: {{{condition}}}.
3. Get the 'source_multiplier' for the user's input: {{{source}}}.
4. Calculate 'base_rsp' = avg_resale * condition_multiplier.
5. Calculate 'min_resale_value' = base_rsp * 0.85.
6. Calculate 'max_resale_value' = base_rsp * 1.15 * source_multiplier.
7. Ensure min_resale_value is not greater than max_resale_value. If it is, set min_resale_value = max_resale_value * 0.9.
8. Create a 'justification' string explaining how the base price was adjusted by the multipliers.

Analyze the following photo and user inputs:
Photo: {{media url=photoDataUri}}
Condition: {{{condition}}}
Source: {{{source}}}

Respond with the min/max resale values and a justification.
  `,
});

const verifyItemValueFlow = ai.defineFlow(
  {
    name: 'verifyItemValueFlow',
    inputSchema: VerifyItemValueInputSchema,
    outputSchema: VerifyItemValueOutputSchema,
  },
  async input => {
    const {output} = await verifyItemValuePrompt(input);
    return output!;
  }
);
