
'use server';

/**
 * @fileOverview Defines the Zod schemas for the Ambassador selection flow.
 *
 * - AmbassadorSchema - The schema for a single ambassador's profile.
 * - AmbassadorListSchema - The schema for a list of ambassadors.
 * - Ambassador - The type derived from AmbassadorSchema.
 * - AmbassadorListOutput - The type derived from AmbassadorListSchema.
 */

import { z } from 'zod';

// Schema for a single ambassador
export const AmbassadorSchema = z.object({
  id: z.string().describe('Unique identifier for the Ambassador.'),
  name: z.string().describe('Full name of the Ambassador.'),
  area: z.string().describe('Geographical service area.'),
  specialty: z.string().describe('Area of expertise (e.g., Mid-Century Furniture, Electronics).'),
  rating: z.number().describe('Ambassador rating on a scale of 1-5.'),
  expectedPickupTime: z.string().describe('Estimated time for item pickup.'),
});
export type Ambassador = z.infer<typeof AmbassadorSchema>;

// Schema for the output, which is a list of ambassadors
export const AmbassadorListSchema = z.object({
  ambassadors: z.array(AmbassadorSchema).describe('A list of selected Ambassadors.'),
});
export type AmbassadorListOutput = z.infer<typeof AmbassadorListSchema>;
