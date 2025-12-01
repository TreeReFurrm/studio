'use server';

/**
 * @fileOverview This file defines a Genkit flow for verifying the value of an item using AI.
 *
 * The flow takes an image of an item as input and returns its estimated "True Market Value".
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
      'A photo of the item to be valued, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type VerifyItemValueInput = z.infer<typeof VerifyItemValueInputSchema>;

const VerifyItemValueOutputSchema = z.object({
  trueMarketValue: z
    .string()
    .describe(
      'The estimated true market value of the item, based on similar completed sales.'
    ),
  justification: z
    .string()
    .describe(
      'A brief justification for the estimated market value, including the sources of data used.'
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
  prompt: `You are an expert appraiser, skilled at determining the true market value of items based on their image.

  A user at a flea market has taken a photo of an item they are considering purchasing. You will analyze the image and provide your expert opinion on the item\'s \"True Market Value,\" and a justification for your valuation.

  Analyze the following photo:
  {{media url=photoDataUri}}

  Respond with the true market value and a justification. Be concise.
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
