import "dotenv/config";

/**
 * Calls the OpenAI Chat Completions API with the full conversation history
 * so the model has context of the ongoing conversation.
 *
 * @param {Array<{role: string, content: string}>} messages - Full conversation history
 * @returns {Promise<string>} The assistant's reply text
 * @throws {Error} If the API call fails or returns an error
 */
const getOpenAIAPIResponse = async (messages) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: messages
        })
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", options);
    const data = await response.json();

    if (!response.ok) {
        const errorMsg = data?.error?.message || `OpenAI API error (${response.status})`;
        console.error("OpenAI API error:", errorMsg);
        throw new Error(errorMsg);
    }

    if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error("Invalid response format from OpenAI API");
    }

    return data.choices[0].message.content;
};

export default getOpenAIAPIResponse;