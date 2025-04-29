
import Materials from '../models/Material.js';
import QuestionComments from '../models/QuestionComments.js';
import { generateQuestions } from "../services/langchainService.js";
import { getTextExtractor } from 'office-text-extractor';
import { generateQuestionsFromYoutube } from "./questionYouTubeController.js";

const extractor = getTextExtractor();

export const linkDocument = async (req, res) => {

    const { url } = req.body;


    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL inválido. Insira um link válido." });
    }

    try {
      if (isYouTubeLink(url)) {
        return generateQuestionsFromYoutube(req, res);
      }

      const adjustedUrl = ajustarUrlGoogle(url) || url;

      const extractedText = await extractTextFromLink(adjustedUrl);

      console.log('extractedText', extractedText);

      if (!extractedText || typeof extractedText !== "string" || !extractedText.trim()) {
        return res.status(400).json({ error: "Não foi possível acessar o conteúdo do texto." });
      }

      const documents = [
        {
          pageContent: extractedText,
          metadata: {
            source: url,
            type: 'Webpage',
          },
        },
      ];

      const user_id = req.user?.id;
      if (!user_id) {
        throw new Error("Usuário não autenticado.");
      }

      const config = {
        totalQuestion: 7,
        explanatory: 1,
        trueFalse: 2,
        multipleChoice: 4
      }
  
      const response = await generateQuestions(documents, config);
      console.log('response', response)

      try {
        const convertedQuestions = response.questions.map(convertQuestionData);

        const material = await Materials.create({
          user_id,
          type: "youtube",
          title: response.title
        });

        await QuestionComments.bulkCreate(convertedQuestions);
      
        console.log('Perguntas salvas com sucesso!', material);
      } catch (error) {
        console.error("Erro ao salvar as perguntas no banco de dados:", error);
        throw error;
      }
  
      res.status(200).json(response);
    } catch (error) {
      console.error("Erro ao processar link:", error);
      res.status(500).json({ error: "Erro ao processar o link.", details: error.message });
    }
}

async function extractTextFromLink(filePath) {
  try {
    return await extractor.extractText({ input: filePath, type: "url" });
  } catch (error) {
    console.error("Erro ao extrair texto do link:", error);
    return null;
  }
}

function isYouTubeLink(url) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url);
}

function ajustarUrlGoogle(url) {
  const match = url.match(/https:\/\/docs\.google\.com\/(document|presentation)\/d\/([\w-]+)/);
  if (!match) return null;

  const [_, tipo, docId] = match;

  return tipo === "document"
    ? `https://docs.google.com/document/d/${docId}/export?format=txt`
    : `https://docs.google.com/presentation/d/${docId}/export/txt`;
}

const convertQuestionData = (question) => {
  if (question.type === "MULTIPLA_ESCOLHA" && Array.isArray(question.options)) {
    question.options = JSON.stringify(question.options);
  }

  return question;
}