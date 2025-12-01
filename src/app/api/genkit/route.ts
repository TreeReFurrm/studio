
import { nextHandler } from '@genkit-ai/next';
import '@/ai/flows/scan-item';
import '@/ai/flows/initiate-consignment-flow';
import '@/ai/flows/request-secondary-service';
import '@/ai/flows/scout-fakes';
import '@/ai/flows/select-ambassador';
import '@/ai/flows/verify-item-value';
import '@/ai/flows/upc-deal-checker';

export const POST = nextHandler();
