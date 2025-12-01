
'use server';

/**
 * @fileOverview Defines a Genkit flow for requesting a secondary service (Cleanout, Organize, etc.)
 * and matching it with a local Ambassador. This is the "Service Pipeline" that can include
 * an inventory estimate.
 *
 * - requestSecondaryService - The main function to call the flow.
 * - SecondaryServiceInput - The input type for the flow.
 * - SecondaryServiceOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

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
        services: ["pickup", "cleanout", "downsize"],
        rating: 4.9,
        is_active: true,
    },
    {
        id: "AMB003",
        name: "Thomas Lee",
        location_zip: "90210",
        services: ["pickup"],
        rating: 4.5,
        is_active: false,
    },
     {
        id: "AMB004",
        name: "Josh Smith",
        location_zip: "90210", 
        services: ["cleanout"],
        is_active: true,
    },
];

const VALID_SERVICES = {
    "cleanout": "Full Home/Storage Unit Clean-out Services",
    "organize": "Organizational Services (e.g., Garage Facelift)",
    "downsize": "Downsizing Consultation/Assistance",
};

/**
 * Finds active ambassadors in a given ZIP code who offer a required service.
 */
function findLocalAmbassadors(zipCode: string, requiredService: keyof typeof VALID_SERVICES) {
    const localAmbassadors = AMBASSADOR_NETWORK.filter(ambassador => 
        ambassador.location_zip === zipCode &&
        ambassador.services.includes(requiredService) &&
        ambassador.is_active
    );
    return localAmbassadors;
}

// --- Zod Schemas for Input and Output ---

const SecondaryServiceInputSchema = z.object({
  userId: z.string().describe("The ID of the user requesting the service."),
  zipCode: z.string().describe("The ZIP code where the service is needed."),
  serviceType: z.enum(['cleanout', 'organize', 'downsize']).describe("The type of service requested."),
  notes: z.string().optional().describe("Additional notes, can include inventory scan results as a string."),
});
export type SecondaryServiceInput = z.infer<typeof SecondaryServiceInputSchema>;

const SecondaryServiceOutputSchema = z.object({
  requestId: z.string(),
  userId: z.string(),
  dateRequested: z.string(),
  serviceType: z.string(),
  zipCode: z.string(),
  notes: z.string().optional(),
  status: z.enum(["MATCHED", "NO_MATCH_FOUND", "PENDING_MATCH"]),
  assignedAmbassadorId: z.string().optional(),
  assignedAmbassadorName: z.string().optional(),
  message: z.string(),
});
export type SecondaryServiceOutput = z.infer<typeof SecondaryServiceOutputSchema>;

// --- Main Flow Function ---

export async function requestSecondaryService(input: SecondaryServiceInput): Promise<SecondaryServiceOutput> {
  return requestSecondaryServiceFlow(input);
}

const requestSecondaryServiceFlow = ai.defineFlow(
  {
    name: 'requestSecondaryServiceFlow',
    inputSchema: SecondaryServiceInputSchema,
    outputSchema: SecondaryServiceOutputSchema,
  },
  async (input) => {
    const requestId = uuidv4().split('-')[0].toUpperCase();
    
    let requestRecord: Partial<SecondaryServiceOutput> = {
        requestId: requestId,
        userId: input.userId,
        dateRequested: new Date().toISOString(),
        serviceType: input.serviceType,
        zipCode: input.zipCode,
        notes: input.notes,
        status: "PENDING_MATCH",
    };

    const matches = findLocalAmbassadors(input.zipCode, input.serviceType);

    if (matches.length > 0) {
        // Assign the highest-rated ambassador
        const assignedAmbassador = matches.reduce((prev, current) => (prev.rating > current.rating) ? prev : current);
        
        requestRecord = {
            ...requestRecord,
            status: "MATCHED",
            assignedAmbassadorId: assignedAmbassador.id,
            assignedAmbassadorName: assignedAmbassador.name,
            message: `Contact Ambassador ${assignedAmbassador.name} to schedule. Fee will be determined after on-site review.`
        };
    } else {
        requestRecord = {
            ...requestRecord,
            status: "NO_MATCH_FOUND",
            message: "No active ambassador available for this service in your area. We will notify you when an Ambassador becomes available in your area."
        };
    }
    
    // Use an LLM to format the final output just in case and ensure schema adherence
    const response = await ai.generate({
        prompt: `Format this data into the required output schema: ${JSON.stringify(requestRecord)}`,
        output: { schema: SecondaryServiceOutputSchema },
    });

    return response.output!;
  }
);
