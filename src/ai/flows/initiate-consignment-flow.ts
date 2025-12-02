
'use server';

/**
 * @fileOverview Defines a Genkit flow for the entire consignment process.
 * This flow orchestrates finding an ambassador and assigning them to a listing.
 *
 * - initiateConsignment - A function that handles the consignment process.
 * - ConsignmentInput - The input type for the initiateConsignment function.
 * - ConsignmentOutput - The return type for the initiateConsignment function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AMBASSADOR_NETWORK = [
    {
        id: "AMB001",
        name: "Alex Johnson",
        location_zip: "90210",
        services: ["pickup", "organize"],
        rating: 4.8,
        is_active: true,
    },
    {
        id: "AMB002",
        name: "Maria Rodriguez",
        location_zip: "10001",
        services: ["pickup", "cleanout"],
        rating: 4.9,
        is_active: true,
    },
];

async function find_local_ambassadors(zip_code: string, required_service: string) {
    console.log(`Searching for ambassadors in ZIP: ${zip_code} for service: ${required_service}`);
    const local_ambassadors = AMBASSADOR_NETWORK.filter(ambassador => 
        ambassador.location_zip === zip_code &&
        ambassador.services.includes(required_service) &&
        ambassador.is_active
    );
    return local_ambassadors;
}

// --- Zod Schemas for Input and Output ---

const ConsignmentInputSchema = z.object({
  listingId: z.string().describe("The unique ID of the newly created listing."),
  itemName: z.string().describe("The name of the item."),
  userZipCode: z.string().describe("The ZIP code for item pickup."),
  fulfillmentNeeded: z.boolean().describe("Whether fulfillment (pickup) is required."),
});
export type ConsignmentInput = z.infer<typeof ConsignmentInputSchema>;

const ConsignmentOutputSchema = z.object({
  listingId: z.string(),
  listingStatus: z.string(),
  assignedAmbassadorId: z.string().optional(),
  assignedAmbassadorName: z.string().optional(),
  pickupFee: z.number().optional(),
  notes: z.string().optional(),
});
export type ConsignmentOutput = z.infer<typeof ConsignmentOutputSchema>;

export async function initiateConsignment(input: ConsignmentInput): Promise<ConsignmentOutput> {
    return consignmentFlow(input);
}

/**
 * Finds and assigns a local ambassador to a listing requiring pickup.
 * This function is the core of the fulfillment integration logic.
 */
async function assign_fulfillment_ambassador(listing: Partial<ConsignmentOutput>, user_zip_code: string): Promise<Partial<ConsignmentOutput>> {
    if (listing.listingStatus === "AWAITING_FULFILLMENT") {
        console.log(`Attempting fulfillment in ZIP code ${user_zip_code}...`);
        const matches = await find_local_ambassadors(user_zip_code, "pickup");

        if (matches.length > 0) {
            // For simplicity, assign the first available ambassador
            const assigned_ambassador = matches[0];
            
            listing = {
                ...listing,
                listingStatus: "PICKUP_SCHEDULED",
                assignedAmbassadorId: assigned_ambassador.id,
                assignedAmbassadorName: assigned_ambassador.name,
                pickupFee: 15.00, // Flat fee example
            };
            console.log(`✅ Success: Ambassador **${assigned_ambassador.name}** assigned for pickup.`);
        } else {
            listing = {
                ...listing,
                listingStatus: "PICKUP_UNAVAILABLE",
                notes: "No active pickup ambassadors in this ZIP code.",
            };
            console.log(`❌ Warning: No pickup ambassador found in ZIP ${user_zip_code}.`);
        }
    }
    return listing;
}


const consignmentFlow = ai.defineFlow(
  {
    name: 'initiateConsignmentFlow',
    inputSchema: ConsignmentInputSchema,
    outputSchema: ConsignmentOutputSchema,
  },
  async (listing) => {
    let updatedListing: Partial<ConsignmentOutput> = {
        listingId: listing.listingId,
        listingStatus: listing.fulfillmentNeeded ? "AWAITING_FULFILLMENT" : "COMPLETED_BY_USER",
    };

    if (listing.fulfillmentNeeded) {
        updatedListing = await assign_fulfillment_ambassador(updatedListing, listing.userZipCode);
    }
    
    // Use an LLM to format the final output just in case, and ensure schema adherence
    const response = await ai.generate({
        prompt: `Format this data into the required output schema: ${JSON.stringify(updatedListing)}`,
        model: 'googleai/gemini-2.5-flash',
        output: { schema: ConsignmentOutputSchema },
    });

    return response.output!;
  }
);
