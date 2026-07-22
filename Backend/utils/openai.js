import "dotenv/config";

/**
 * Calls the Groq Chat Completions API (OpenAI-compatible) with the full
 * conversation history so the model has context of the ongoing conversation.
 *
 * @param {Array<{role: string, content: string}>} messages - Full conversation history
 * @returns {Promise<string>} The assistant's reply text
 * @throws {Error} If the API call fails or returns an error
 */
const getAIResponse = async (messages) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: messages
        })
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", options);
    const data = await response.json();

    if (!response.ok) {
        const errorMsg = data?.error?.message || `AI API error (${response.status})`;
        console.error("Groq API error:", errorMsg);
        throw new Error(errorMsg);
    }

    if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error("Invalid response format from AI API");
    }

    return data.choices[0].message.content;
};

export default getAIResponse;