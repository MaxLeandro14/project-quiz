import { ChatOpenAI } from "@langchain/openai";
import fs from "fs/promises";
import pdfParse from "pdf-parse";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { AutoTokenizer } from "@xenova/transformers";

// Import environment variables
import * as dotenv from "dotenv";
dotenv.config();

console.log('process.env.OPENAI_API_KEY',process.env.OPENAI_API_KEY)
// Instantiate Model
const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

// Create prompt
// melhorar o prompt
/*
const prompt = ChatPromptTemplate.fromTemplate(`
    Com base no seguinte conteúdo, gere 10 perguntas relevantes.
  
    {context}
  
    - As perguntas devem abordar os principais pontos do texto.
    - Inclua perguntas objetivas.
    - Use linguagem clara e objetiva.
  `);
*/
const template = `
Você é um especialista em criação de perguntas de múltipla escolha. Sua tarefa é gerar **apenas** 10 perguntas baseadas no texto fornecido.  

**Formato obrigatório:**  
- Cada pergunta deve ter 4 alternativas (A, B, C e D).  
- Apenas **uma alternativa** deve estar correta.  
- A resposta correta **deve ser exibida no final**.  

**Exemplo:**  
**Pergunta:** O que é necessário para registrar uma obra na Biblioteca Nacional?  
A. Aprovação de uma editora  
B. Registro pela internet no site da Biblioteca Nacional  
C. Necessidade de um investimento financeiro alto  
D. Registro em cartório  
**Resposta correta: B**  

Gere **exatamente** 10 perguntas com base no seguinte conteúdo:  

{context}
`;

const prompt = ChatPromptTemplate.fromTemplate(template);

// Create Chain
const chain = await createStuffDocumentsChain({
  llm: model,
  prompt,
});
// momento esse

// Use Cheerio to scrape content from webpage and create documents
const pdfPath = "./src/document_loaders/sample.pdf";
let docs;

async function processPDF(pdfPath) {
  try {
    const loader = new PDFLoader(pdfPath);

    const docs = await loader.load();
    
    console.log('docs', docs)
   // const data = await pdfParse(pdfParse); // Aguarda a extração do texto
    return docs; // Retorna o conteúdo extraído
  } catch (error) {
    console.error("Erro ao processar o PDF:", error);
    return null;
  }
}

processPDF(pdfPath).then((data) => {
  if (docs) {
    docs = data;
    console.log("Texto extraído do PDF:", docs);
  } else {
    console.log("Falha ao extrair texto.");
  }
});
//console.log('docs', docs)

// Carregar tokenizer
const tokenizer = await AutoTokenizer.from_pretrained("gpt2");

// Função para contar tokens
function countTokens(text) {
  return tokenizer.encode(text).length;
}

// Text Splitter
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400, // Limite de tokens por chunk
    chunkOverlap: 100, // Sobreposição de tokens para contexto
    lengthFunction: countTokens,
});
const splitDocs = await splitter.splitDocuments(docs);
// console.log(splitDocs);

// Instantiate Embeddings function
const embeddings = new OpenAIEmbeddings(
  {
    model: 'text-embedding-ada-002',
  }
);

// Create Vector Store
const vectorstore = await MemoryVectorStore.fromDocuments(
  splitDocs,
  embeddings
);

// Create a retriever from vector store
const retriever = vectorstore.asRetriever({ k: 2 });

// Create a retrieval chain
const retrievalChain = await createRetrievalChain({
  combineDocsChain: chain,
  retriever,
});

// // Invoke Chain
try {
    const response = await retrievalChain.invoke({
      input: "Gerar 10 perguntas sobre o conteúdo fornecido."
    });
  
    console.log("Perguntas Geradas:\n", response);
  } catch (error) {
    console.error("Erro ao gerar perguntas:", error);
  }