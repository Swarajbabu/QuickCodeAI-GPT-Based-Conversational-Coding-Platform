import "dotenv/config";

/**
 * Calls the dynamic Chat Completions API (Groq or OpenAI) with the full
 * conversation history so the model has context of the ongoing conversation.
 *
 * @param {Array<{role: string, content: string}>} messages - Full conversation history
 * @returns {Promise<string>} The assistant's reply text
 * @throws {Error} If the API call fails or returns an error
 */
const getAIResponse = async (messages) => {
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("AI API Key is missing. Please set GROQ_API_KEY or OPENAI_API_KEY in environment variables.");
    }

    // Determine if we are using Groq or OpenAI
    // Groq keys usually start with 'gsk_'
    const isGroq = !!process.env.GROQ_API_KEY || apiKey.startsWith("gsk_");
    
    const apiUrl = isGroq 
        ? "https://api.groq.com/openai/v1/chat/completions" 
        : "https://api.openai.com/v1/chat/completions";
        
    const defaultModel = isGroq 
        ? "llama-3.3-70b-versatile" 
        : "gpt-4o-mini";
        
    const model = process.env.AI_MODEL || defaultModel;

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: messages
        })
    };

    const apiName = isGroq ? "Groq" : "OpenAI";
    const response = await fetch(apiUrl, options);
    const data = await response.json();

    if (!response.ok) {
        const errorMsg = data?.error?.message || `AI API error (${response.status})`;
        console.error(`${apiName} API error:`, errorMsg);
        throw new Error(errorMsg);
    }

    if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error(`Invalid response format from ${apiName} API`);
    }

    return data.choices[0].message.content;
};

export default getAIResponse;