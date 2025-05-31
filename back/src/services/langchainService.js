import { ChatOpenAI } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { AutoTokenizer } from "@xenova/transformers";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

/*
const template = (config) => {
  return `
Você é um especialista em criação de perguntas e título. Sua tarefa é gerar um **título** e  ${config.totalQuestion} **perguntas** com base no conteúdo fornecido, a quantidade de perguntas são divididas de acordo com os tipos abaixo:

### **Tipos**:
- **MULTIPLA_ESCOLHA:** Gere ${config.multipleChoice || 4} perguntas.
- **VERDADEIRO_FALSO:** Gere ${config.trueFalse || 2} perguntas.
- **EXPLICATIVA:** Gere ${config.explanatory || 1} perguntas.

**Formato obrigatório de cada tipo de pergunta:**
- **MULTIPLA_ESCOLHA:** Deve conter 4 opções e apenas uma correta. Cada opção deve ter uma explicação do porquê está correta ou errada.
- **VERDADEIRO_FALSO:** Duas opções ("Verdadeiro" e "Falso"), apenas uma correta, e deve conter uma explicação para justificar a resposta correta e por que a errada está errada.
- **EXPLICATIVA:** Apenas uma pergunta e uma resposta aberta.

### **Instruções Importantes**:
1. **Siga exatamente a quantidade de perguntas exigidas**.
2. **Gere um título relevante e obrigatório para o conjunto de perguntas.**

Organize as perguntas e o titulo no seguinte formato JSON:

\`\`\`json
"title": "Título gerado com base no conteúdo",
"questions":
[
  {{
    "question": "Pergunta aqui",
    "type": "MULTIPLA_ESCOLHA",
    "correct_opt": "A",
    "options": [
      {{ "text": "Opção A", "option": "A" }},
      {{ "text": "Opção B", "option": "B" }},
      {{ "text": "Opção C", "option": "C" }},
      {{ "text": "Opção D", "option": "D" }}
    ],
    "explanation": [
      {{ "option": "A", "explanation": "Explicação do porquê essa opção opção é correta." }},
      {{ "option": "B", "explanation": "Explicação do porquê essa opção está errada." }},
      {{ "option": "C", "explanation": "Explicação do porquê essa opção está errada." }},
      {{ "option": "D", "explanation": "Explicação do porquê essa opção está errada." }}
    ]
  }},
  {{
    "question": "Pergunta aqui",
    "type": "EXPLICATIVA",
    "explanation": [
      {{ "explanation": "Resposta aberta esperada." }}
    ]
  }},
  {{
    "question": "Pergunta aqui",
    "type": "VERDADEIRO_FALSO",
    "is_correct_v_f": false,
    "explanation": [
      {{ "explanation": "Explicação do porquê essa opção está errada." }}
    ]
  }}
]
\`\`\`

Gere **exatamente ${config.totalQuestion} perguntas** baseado no seguinte conteúdo:

{context}
`
};
*/
const template = (config) => {
  return `
Você é um especialista em elaboração de **títulos** e **questões avaliativas**. Sua tarefa é gerar um **título relevante** e um conjunto de perguntas baseadas no conteúdo fornecido, obedecendo às quantidades e formatos indicados a seguir:

### **Tipos**:
- **MULTIPLA_ESCOLHA:** Gere ${config.multipleChoice || 5} perguntas.
- **VERDADEIRO_FALSO:** Gere ${config.trueFalse || 2} perguntas.

**Formato obrigatório de cada tipo de pergunta:**
- **MULTIPLA_ESCOLHA:** Deve conter 4 opções e apenas uma correta. Cada opção deve ter uma explicação do porquê está correta ou errada.
- **VERDADEIRO_FALSO:** Duas opções ("Verdadeiro" e "Falso"), apenas uma correta, e deve conter uma explicação para justificar a resposta correta e por que a errada está errada.

### **Instruções Importantes**:
1. **Siga exatamente a quantidade de perguntas exigidas**.
2. **Gere um título relevante e obrigatório para o conjunto de perguntas.**

Organize as perguntas e o titulo no seguinte formato JSON:

\`\`\`json
"title": "Título gerado com base no conteúdo",
"questions":
[
  {{
    "question": "Pergunta aqui",
    "type": "MULTIPLA_ESCOLHA",
    "correct_opt": "A",
    "options": [
      {{ "text": "Opção A", "option": "A" }},
      {{ "text": "Opção B", "option": "B" }},
      {{ "text": "Opção C", "option": "C" }},
      {{ "text": "Opção D", "option": "D" }}
    ],
    "explanation": [
      {{ "option": "A", "explanation": "Explicação do porquê essa opção opção é correta." }},
      {{ "option": "B", "explanation": "Explicação do porquê essa opção está errada." }},
      {{ "option": "C", "explanation": "Explicação do porquê essa opção está errada." }},
      {{ "option": "D", "explanation": "Explicação do porquê essa opção está errada." }}
    ]
  }},
  {{
    "question": "Pergunta aqui",
    "type": "VERDADEIRO_FALSO",
    "is_correct_v_f": false,
    "explanation": [
      {{ "explanation": "Explicação do porquê essa opção está errada." }}
    ]
  }}
]
\`\`\`

Gere **exatamente ${config.totalQuestion} perguntas** baseado no seguinte conteúdo:

{context}
`
};
export const generateQuestions = async (documents, config) => {
  console.log('config', config)
  const templateQuestion = template(config);
  const prompt = ChatPromptTemplate.fromTemplate(templateQuestion);

  // Carregar tokenizer
  const tokenizer = await AutoTokenizer.from_pretrained("gpt2");

  function countTokens(text) {
    return tokenizer.encode(text).length;
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 100,
    lengthFunction: countTokens,
  });

  const splitDocs = await splitter.splitDocuments(documents);

  // Criar embeddings
  const embeddings = new OpenAIEmbeddings({ model: "text-embedding-ada-002" });

  // Criar Vector Store
  const vectorstore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );

  // Criar Retrieval Chain
  const retrievalChain = await createRetrievalChain({
    combineDocsChain: await createStuffDocumentsChain({ llm: model, prompt }),
    retriever: vectorstore.asRetriever({ k: 3 }),
  });

  // Gerar perguntas
  const response = await retrievalChain.invoke({
    input: `Gerar ${config.totalQuestion} perguntas sobre o conteúdo fornecido.`,
  });

if (typeof response.answer === "string") {
  try {
    const jsonMatch = response.answer.match(/```json\n([\s\S]*?)\n```/);
    response.answer = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(response.answer);
  } catch (error) {
    console.error("Erro ao processar o campo answer:", error);
  }
}

  return response.answer;
};
