import { config } from 'dotenv';
config();

import '@/ai/flows/generate-listing-details.ts';
import '@/ai/flows/ai-price-suggestions.ts';
import '@/ai/flows/verify-item-value.ts';