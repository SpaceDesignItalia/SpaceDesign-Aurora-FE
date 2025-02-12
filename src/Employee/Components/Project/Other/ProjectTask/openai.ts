import axios from "axios";

const OPENAI_API_KEY = "process.env.OPENAI_API_KEY;";

interface OpenAIResponse {
  choices: {
    text: string;
  }[];
}

export const generateDescription = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post<OpenAIResponse>(
      "https://api.openai.com/v1/completions",
      {
        model: "text-davinci-003", // Puoi utilizzare modelli più avanzati come "gpt-4"
        prompt,
        max_tokens: 100,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].text.trim();
  } catch (error: any) {
    console.error("Errore durante la chiamata a OpenAI:", error);
    throw new Error(
      error.response?.data?.error?.message || "Errore sconosciuto"
    );
  }
};
