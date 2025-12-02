
'use server';

/**
 * @fileOverview Defines a Genkit flow for selecting an Ambassador based on item details and user action.
 *
 * - selectAmbassador - A function that uses AI to recommend Ambassadors.
 * - AmbassadorFlowInput - The input type for the selectAmbassador function.
 * - AmbassadorListOutput - The return type from the flow, containing a list of ambassadors.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';


// Schema for a single ambassador
const AmbassadorSchema = z.object({
  id: z.string().describe('Unique identifier for the Ambassador.'),
  name: z.string().describe('Full name of the Ambassador.'),
  area: z.string().describe('Geographical service area.'),
  specialty: z.string().describe('Area of expertise (e.g., Mid-Century Furniture, Electronics).'),
  rating: z.number().describe('Ambassador rating on a scale of 1-5.'),
  expectedPickupTime: z.string().describe('Estimated time for item pickup.'),
});
export type Ambassador = z.infer<typeof AmbassadorSchema>;

// Schema for the output, which is a list of ambassadors
const AmbassadorListSchema = z.object({
  ambassadors: z.array(AmbassadorSchema).describe('A list of selected Ambassadors.'),
});
export type AmbassadorListOutput = z.infer<typeof AmbassadorListSchema>;

const ListingDetailsSchema = z.object({
  title: z.string().describe('The title of the item listing.'),
  description: z.string().describe('The detailed description of the item.'),
  price: z.number().describe('The price of the item.'),
});

// The input combines listing details with the user's chosen action and location.
const AmbassadorFlowInputSchema = ListingDetailsSchema.extend({
  action: z
    .enum(['SELL', 'DONATE'])
    .describe('The user’s chosen action: SELL (Consignment) or DONATE.'),
  zipCode: z.string().describe("The user's ZIP code for location-based search."),
  service: z.enum(['pickup', 'cleanout', 'organize', 'downsize']).describe('The specific service required.'),
});
export type AmbassadorFlowInput = z.infer<typeof AmbassadorFlowInputSchema>;


const VALID_SERVICES: Record<string, string> = {
    "pickup": "Item Pickup/Shipping Drop-off",
    "cleanout": "Full Home/Storage Unit Clean-out Services",
    "organize": "Organizational Services (e.g., Garage Facelift)",
    "downsize": "Downsizing Consultation/Assistance",
};

const AMBASSADOR_NETWORK = [
    {
        id: "AMB001",
        name: "Alex Johnson",
        location_zip: "90210",
        location_city: "Beverly Hills",
        services: ["pickup", "organize"],
        rating: 4.8,
        is_active: true,
        specialty: "Electronics & Media"
    },
    {
        id: "AMB002",
        name: "Maria Rodriguez",
        location_zip: "10001",
        location_city: "New York",
        services: ["pickup", "cleanout", "downsize"],
        rating: 4.9,
        is_active: true,
        specialty: "Furniture & Decor"
    },
    {
        id: "AMB003",
        name: "Thomas Lee",
        location_zip: "90210",
        location_city: "Beverly Hills",
        services: ["pickup"],
        rating: 4.5,
        is_active: false,
        specialty: "General Goods"
    },
];


/**
 * In a real app, this would query a database/CRM.
 * This function finds active ambassadors in a given ZIP code who offer a required service.
 */
async function findLocalAmbassadors(zipCode: string, requiredService: string): Promise<any[]> {
    console.log(`--- 📍 Searching for '${VALID_SERVICES[requiredService]}' Ambassadors in ZIP ${zipCode} ---`);

    const localAmbassadors = AMBASSADOR_NETWORK.filter(ambassador => {
        const isLocal = ambassador.location_zip === zipCode;
        const offersService = ambassador.services.includes(requiredService);
        const isActive = ambassador.is_active;
        return isLocal && offersService && isActive;
    });

    return localAmbassadors;
}


export async function selectAmbassador(
  input: AmbassadorFlowInput
): Promise<AmbassadorListOutput> {
  return selectAmbassadorFlow(input);
}


const selectAmbassadorPrompt = ai.definePrompt({
    name: 'selectAmbassadorPrompt',
    input: { schema: AmbassadorFlowInputSchema.extend({ rawAmbassadors: z.string() }) },
    output: { schema: AmbassadorListSchema },
    model: 'googleai/gemini-2.5-flash',
    prompt: `
      The user has decided to proceed with a {{action}} action for the following item:
      Title: {{title}}
      Description: {{description}}
      Price: {{price}}

      Here is a list of raw Ambassador candidates and their profiles:
      {{{rawAmbassadors}}}

      Select up to 3 of the best Ambassadors from the raw list based on their specialty and service area. 
      For the expectedPickupTime, refine the rough estimate based on the chosen action: 
      - If 'SELL', prioritize the higher rated and relevant specialty.
      - If 'DONATE', prioritize the fastest pickup time.

      Strictly return the final, filtered, and refined list in the requested JSON schema.
    `,
});


const selectAmbassadorFlow = ai.defineFlow(
  {
    name: 'selectAmbassadorFlow',
    inputSchema: AmbassadorFlowInputSchema,
    outputSchema: AmbassadorListSchema,
  },
  async (input) => {
    // 1. Get filtered ambassador data based on location and service
    const rawAmbassadors = await findLocalAmbassadors(input.zipCode, input.service);

    if (rawAmbassadors.length === 0) {
        return { ambassadors: [] };
    }

    // 2. Use the LLM to process and format the raw data into the required structured output.
    const {output} = await selectAmbassadorPrompt({
        ...input,
        rawAmbassadors: JSON.stringify(rawAmbassadors.map(a => ({...a, area: a.location_city, expectedPickupTime: '1-2 days'})), null, 2),
    });

    // The response.output is a type-safe object thanks to structured output
    return output!;
  }
);
