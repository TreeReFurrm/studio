
'use server';

/**
 * @fileOverview This file defines a Genkit flow for scouting fake or counterfeit items.
 *
 * It simulates an AI module that analyzes key identifiers of an item to determine its authenticity.
 *
 * @exports {
 *   scoutFakes,
 *   ScoutFakesInput,
 *   ScoutFakesOutput,
 * }
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// --- 1. Define Authentication Failures (Simulated AI Knowledge Base) ---

const AUTHENTICITY_KNOWLEDGE_BASE: Record<string, string[]> = {
    "Hermes Birkin Bag": [
        "Stitching appears machine-made (should be hand-stitched).",
        "Logo font weight is incorrect.",
        "Leather grain is too uniform or 'plastic-y'.",
        "Hardware material lacks proper weight/finish.",
    ],
    "Rolex Submariner Watch": [
        "Movement sweep is jumpy (should be smooth).",
        "Cyclops magnification is less than 2.5x.",
        "Weight of watch is too light.",
        "Serial numbers are etched, not engraved.",
    ],
    "Vintage Tiffany Lamp": [
        "Shade sections are plastic, not hand-cut glass.",
        "Patina on base is too smooth and lacks age.",
        "Wrong pattern or colorway used in the glass.",
    ],
};

// --- 2. Zod Schemas for Input and Output ---

const ScoutFakesInputSchema = z.object({
  itemName: z.string().describe("The item being scanned."),
  checkLocation: z.enum(["Auction Photo", "In-Hand Scan"]).describe("The context of the scan."),
});
export type ScoutFakesInput = z.infer<typeof ScoutFakesInputSchema>;

const ScoutFakesOutputSchema = z.object({
  itemName: z.string(),
  verdict: z.enum(["AUTHENTIC", "POSSIBLE_FAKE", "NOT_APPLICABLE", "LOW_RISK"]),
  confidenceScore: z.number().describe("A score from 0-100 indicating confidence in the verdict."),
  reasons: z.array(z.string()).describe("A list of reasons supporting the verdict."),
});
export type ScoutFakesOutput = z.infer<typeof ScoutFakesOutputSchema>;


// --- 3. The Core Fake Scouter Function ---

export async function scoutFakes(input: ScoutFakesInput): Promise<ScoutFakesOutput> {
    // This flow is simple enough that we can implement the logic directly
    // without needing a separate LLM prompt for the final formatting.
    
    const { itemName, checkLocation } = input;

    if (!AUTHENTICITY_KNOWLEDGE_BASE[itemName]) {
        return {
            itemName: itemName,
            verdict: "LOW_RISK",
            confidenceScore: 100,
            reasons: ["Item not typically targeted by high-end counterfeiters."],
        };
    }

    const baseConfidence = checkLocation === "In-Hand Scan" ? 95 : 80;
    const possibleFailures = AUTHENTICITY_KNOWLEDGE_BASE[itemName];
    
    // Weighted random selection: 70% chance of 0 failures, 20% of 1, 10% of 2
    const weights = [0.7, 0.2, 0.1];
    const outcomes = [0, 1, 2];
    const numFailures = outcomes[weights.map(w => Math.random() < w).lastIndexOf(true)];


    if (numFailures > 0 && possibleFailures.length > 0) {
        // FAKE ITEM SCENARIO
        const failureReasons: string[] = [];
        const shuffledFailures = [...possibleFailures].sort(() => 0.5 - Math.random());
        for (let i = 0; i < Math.min(numFailures, shuffledFailures.length); i++) {
            failureReasons.push(shuffledFailures[i]);
        }
        
        const confidenceReduction = numFailures * (Math.floor(Math.random() * 11) + 15); // Random int between 15 and 25
        const finalConfidence = Math.max(0, baseConfidence - confidenceReduction);
        
        return {
            itemName: itemName,
            verdict: "POSSIBLE_FAKE",
            confidenceScore: finalConfidence,
            reasons: failureReasons,
        };

    } else {
        // AUTHENTIC ITEM SCENARIO
        return {
            itemName: itemName,
            verdict: "AUTHENTIC",
            confidenceScore: baseConfidence + (Math.floor(Math.random() * 5) + 1), // Random int between 1 and 5
            reasons: ["All visible indicators passed initial AI inspection."],
        };
    }
}

// Although we are not using a prompt-based flow, we still define it with genkit
// so it is registered and can be managed by the Genkit tools.
ai.defineFlow(
  {
    name: 'scoutFakesFlow',
    inputSchema: ScoutFakesInputSchema,
    outputSchema: ScoutFakesOutputSchema,
  },
  scoutFakes
);
