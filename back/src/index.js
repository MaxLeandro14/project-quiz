import express from 'express';
import http from 'http';
import { fileURLToPath } from "url";
import path, { dirname } from 'path';
import * as dotenv from 'dotenv';

// Carrega variáveis do .env antes de usá-las
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Define rota principal
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Endpoint de status
app.get('/api/health', async (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
  });
});

// Rota para perguntas
app.get('/ask', async (req, res) => {
  try {
    const llmA = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });
    const chainA = loadQAStuffChain(llmA);
    const directory = process.env.DIR; // Diretório salvo no .env

    const loadedVectorStore = await FaissStore.load(
      directory,
      new OpenAIEmbeddings()
    );

    const question = "What is this article about?"; // Pergunta
    const result = await loadedVectorStore.similaritySearch(question, 1);
    
    const resA = await chainA.call({
      input_documents: result,
      question,
    });

    res.json({ result: resA });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Obtém diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cria HTTP server
http.createServer(app).listen(port, () => {
  console.info(`Server listening on port ${port}`);
});
