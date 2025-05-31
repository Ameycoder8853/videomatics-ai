import { config } from 'dotenv';
config();

import '@/ai/flows/generate-video-script.ts';
// summarize-script-into-keywords.ts is no longer used and can be removed if desired.
// For now, keeping it here doesn't harm, but it's not part of the main flow.
import '@/ai/flows/summarize-script-into-keywords.ts';
