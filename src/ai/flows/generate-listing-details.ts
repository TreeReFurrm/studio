'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating listing details (title, description, tags) based on an item's photo.
 *
 * - generateListingDetails -  A function that uses AI to generate listing details for an item.
 * - GenerateListingDetailsInput - The input type for the generateListingDetails function.
 * - GenerateListingDetailsOutput - The return type for the generateListingDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateListingDetailsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  additionalDetails: z.string().optional().describe('Any additional details about the item.'),
});
export type GenerateListingDetailsInput = z.infer<typeof GenerateListingDetailsInputSchema>;

const GenerateListingDetailsOutputSchema = z.object({
  title: z.string().describe('The generated title for the listing.'),
  description: z.string().describe('The generated description for the listing.'),
  tags: z.array(z.string()).describe('The generated tags for the listing.'),
});
export type GenerateListingDetailsOutput = z.infer<typeof GenerateListingDetailsOutputSchema>;

export async function generateListingDetails(
  input: GenerateListingDetailsInput
): Promise<GenerateListingDetailsOutput> {
  return generateListingDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateListingDetailsPrompt',
  input: {schema: GenerateListingDetailsInputSchema},
  output: {schema: GenerateListingDetailsOutputSchema},
  prompt: `You are an AI assistant helping users create listings for items they want to sell online.

  Based on the photo and any additional details provided, generate a title, description, and relevant tags for the listing.

  Photo: {{media url=photoDataUri}}
  Additional Details: {{additionalDetails}}

  Title:
  Description:
  Tags:`,
});

const generateListingDetailsFlow = ai.defineFlow(
  {
    name: 'generateListingDetailsFlow',
    inputSchema: GenerateListingDetailsInputSchema,
    outputSchema: GenerateListingDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
