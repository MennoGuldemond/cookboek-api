import { InferenceClient } from '@huggingface/inference'
const client = new InferenceClient(process.env.HF_TOKEN)

export async function extractIngredients(text) {
  const out = await client.chatCompletion({
    model: 'meta-llama/Llama-3.1-8B-Instruct',
    messages: [
      {
        role: 'system',
        content: `Extract a list of cooking ingredients and return
            ONLY the ingredients (comma separated). Don't punt anything else in your response, like "here are your ingredients".
            Your response may not contain anything else other than the ingredient names.
            Ignore any other text. this are the ingredients: ${text}`,
      },
    ],
    max_tokens: 512,
  })
  const result = out.choices[0].message.content
  if (result) {
    return result.split(',')
  }
  return null
}
