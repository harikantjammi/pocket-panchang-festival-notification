import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';

const client = new Anthropic();

const FestivalSelectionSchema = z.object({
  significantFestivals: z.array(z.string()).max(2),
  vrat: z.string().nullable(),
  specialObservance: z.string().nullable(),
});

export async function selectSignificantFestivals(festivals) {
  if (!festivals || festivals.length === 0) {
    return { significantFestivals: [], vrat: null, specialObservance: null };
  }

  const response = await client.messages.parse({
    model: 'claude-opus-5',
    max_tokens: 300,
    output_config: {
      effort: 'low',
      format: zodOutputFormat(FestivalSelectionSchema),
    },
    system:
      'You curate a daily Hindu Panchang push notification. Given a list of ' +
      'festival/observance names for a single day, choose at most 2 of the most ' +
      'culturally significant festivals for significantFestivals, extract any ' +
      'vrat (fast) as vrat, and any other special observance (e.g. amavasya, ' +
      'ekadashi, sankranti) as specialObservance. Only use items from the given ' +
      'list - never invent new ones. Ignore secular/national observances (e.g. ' +
      'Independence Day, Republic Day, Gandhi Jayanti) and festivals of other ' +
      'religions - consider only Hindu festivals and observances. Use null for ' +
      'a field when none applies.',
    messages: [
      {
        role: 'user',
        content: `Festivals today: ${festivals.join(', ')}`,
      },
    ],
  });

  return (
    response.parsed_output ?? {
      significantFestivals: festivals.slice(0, 2),
      vrat: null,
      specialObservance: null,
    }
  );
}
