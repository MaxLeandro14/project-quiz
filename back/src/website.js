import { ChatOpenAI } from "@langchain/openai";

import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";


// import { Document } from "@langchain/core/documents";

// Import environment variables
import * as dotenv from "dotenv";
dotenv.config();

// Instantiate Model
const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

// Create prompt
// melhorar o prompt
const prompt = ChatPromptTemplate.fromTemplate(`
    Com base no seguinte conteúdo, gere 10 perguntas relevantes.
  
    {context}
  
    - As perguntas devem abordar os principais pontos do texto.
    - Inclua perguntas objetivas.
    - Use linguagem clara e objetiva.
  `);

// Create Chain
const chain = await createStuffDocumentsChain({
  llm: model,
  prompt,
});


// Use Cheerio to scrape content from webpage and create documents
const loader = new CheerioWebBaseLoader(
  "https://sebraeplay.com.br/content/autopublicacao-5-dicas-para-publicar-um-livro-independente"
);
const docs = await loader.load();
const $ = cheerio.load(docs[0].pageContent);
const bodyContent = $("body").text().trim();
console.log('docs', bodyContent)


// Text Splitter
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 300,
  chunkOverlap: 100,
});
const splitDocs = await splitter.splitDocuments(bodyContent);
// console.log(splitDocs);

// Instantiate Embeddings function
const embeddings = new OpenAIEmbeddings();

// Create Vector Store
const vectorstore = await MemoryVectorStore.fromDocuments(
  splitDocs,
  embeddings
);

// Create a retriever from vector store
const retriever = vectorstore.asRetriever({ k: 4 });

console.log('retriever', retriever)
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