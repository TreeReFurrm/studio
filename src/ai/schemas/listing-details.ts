
'use server';

/**
 * @fileOverview Defines a reusable Zod schema for listing details.
 *
 * - ListingDetailsSchema - The schema for an item's listing details.
 * - ListingDetails - The TypeScript type derived from the schema.
 */

import { z } from 'zod';

export const ListingDetailsSchema = z.object({
  title: z.string().describe('The title of the item listing.'),
  description: z.string().describe('The detailed description of the item.'),
  price: z.number().describe('The price of the item.'),
});
export type ListingDetails = z.infer<typeof ListingDetailsSchema>;
