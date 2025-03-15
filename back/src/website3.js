import { ChatOpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { loadSummarizationChain } from "langchain/chains";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
model: "gpt-3.5-turbo",
  temperature: 0.7,
});

async function getWebsiteContent(url) {
  const loader = new CheerioWebBaseLoader(url);
  const docs = await loader.load();
  return docs.map(doc => doc.pageContent).join("\n");
}

async function summarizeText(text) {
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 2000, chunkOverlap: 200 });
  const docs = await textSplitter.createDocuments([text]);
  const chain = loadSummarizationChain(model, { type: "map_reduce" });
  const summary = await chain.call({ input_documents: docs });
  return summary.text;
}

async function generateQuestions(summary) {
  const prompt = `
    Com base no seguinte texto, gere 10 perguntas relevantes e suas respectivas respostas:
    
    """${summary}"""
    
    As perguntas devem ser coerentes, informativas e abrangentes. Formato esperado:
    
    1. Pergunta 1?
       - Resposta 1.
    2. Pergunta 2?
       - Resposta 2.
  `;

  const response = await model.call(prompt);
  return response;
}

const content = await getWebsiteContent('https://sebraeplay.com.br/content/autopublicacao-5-dicas-para-publicar-um-livro-independente');
    const summary = await summarizeText(content);
    const questions = await generateQuestions(summary);

    console.log('questions', questions)

/*
app.post("/generate-questions", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL é obrigatória" });

    const content = await getWebsiteContent(url);
    const summary = await summarizeText(content);
    const questions = await generateQuestions(summary);

    res.json({ questions });
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({ error: "Erro ao processar a requisição" });
  }
});

app.listen(3000, () => console.log("🚀 Servidor rodando na porta 3000"));

*/