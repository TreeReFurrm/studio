'use server';

/**
 * @fileOverview This file defines the AI price suggestion flow for the ValuScan app.
 *
 * It takes an item description and photos as input and returns an AI-generated price suggestion.
 *
 * @exports {
 *   getPriceSuggestion,
 *   AiPriceSuggestionInput,
 *   AiPriceSuggestionOutput,
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPriceSuggestionInputSchema = z.object({
  description: z.string().describe('The description of the item.'),
  photoDataUri: z
    .string()
    .describe(
      "A photo of the item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AiPriceSuggestionInput = z.infer<typeof AiPriceSuggestionInputSchema>;

const AiPriceSuggestionOutputSchema = z.object({
  suggestedPriceRange: z
    .string()
    .describe(
      'The AI-generated price range suggestion for the item, based on comparable sales. Should include justification.'
    ),
});
export type AiPriceSuggestionOutput = z.infer<typeof AiPriceSuggestionOutputSchema>;

export async function getPriceSuggestion(
  input: AiPriceSuggestionInput
): Promise<AiPriceSuggestionOutput> {
  return aiPriceSuggestionFlow(input);
}

const aiPriceSuggestionPrompt = ai.definePrompt({
  name: 'aiPriceSuggestionPrompt',
  input: {schema: AiPriceSuggestionInputSchema},
  output: {schema: AiPriceSuggestionOutputSchema},
  prompt: `You are an expert pricing assistant for secondhand goods. Based on the provided description and photo, suggest a price range for the item. Provide a brief justification for your suggested price range based on comparable sales.

Description: {{{description}}}
Photo: {{media url=photoDataUri}}`,
});

const aiPriceSuggestionFlow = ai.defineFlow(
  {
    name: 'aiPriceSuggestionFlow',
    inputSchema: AiPriceSuggestionInputSchema,
    outputSchema: AiPriceSuggestionOutputSchema,
  },
  async input => {
    const {output} = await aiPriceSuggestionPrompt(input);
    return output!;
  }
);
