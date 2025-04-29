
import Materials from '../models/Material.js';
import Question from '../models/Question.js';
import { generateQuestions } from "../services/langchainService.js";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fs from "fs";
import path from 'path';
import multer from 'multer';
import mammoth from "mammoth";
import { getTextExtractor } from 'office-text-extractor'
import multerConfig from '../config/multerConfig.js';

const upload = multer(multerConfig).single('file');
const extractor = getTextExtractor();

export const uploadDocument = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Arquivo muito grande." });
      }
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const filePath = path.resolve(req.file.path);
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    try {
      const extractedText = await extractTextFromFile(filePath, fileExt);
      console.log('extractedText', extractedText);

      if (!extractedText || typeof extractedText !== "string" || !extractedText.trim()) {
        return res.status(400).json({ error: "O arquivo não contém texto válido." });
      }

      const documents = [
        {
          pageContent: extractedText,
          metadata: {
            source: req.file.originalname,
            type: fileExt
          },
        },
      ];

      // const user_id = req.user?.id;
      const user_id = '3cdc152f-b12d-4c67-a552-817e32d56fc7';
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
  
      try {
     //   const convertedQuestions = response.questions.map(convertQuestionData);

        const material = await Materials.create({
          user_id,
          type: "document",
          title: response.title
        });
      
       const questionsData = response.questions.map((question) => {
               const data = {
                 material_id: material.id,
                 question: question.question,
                 type: question.type,
                 correct_opt: question.correct_opt || null,
                 options: question.options || null,
                 explanation: question.explanation
               };
             
               if (question.is_correct_v_f !== undefined) {
                 data.is_correct_v_f = question.is_correct_v_f;
               }
             
               return data;
             });
             
        await Question.bulkCreate({id_material: material.id});
        console.log('Perguntas salvas com sucesso!', material);
      } catch (error) {
        console.error("Erro ao salvar as perguntas no banco de dados:", error);
        throw error;
      }
  
      res.status(200).json(response);
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      res.status(500).json({ error: "Erro ao processar o arquivo.", details: error.message });
    } finally {
     // fs.unlink(filePath, () => {});
    }

  });
}

async function extractTextFromFile(filePath, fileExt) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  console.log('fileExt', fileExt)
  switch (fileExt) {
    case ".pdf":
      return await extractTextFromPDF(filePath);
    case ".docx":
      return await extractTextFromWord(filePath);
    case ".pptx":
      return await extractTextFromPowerPoint(filePath);
    case ".mp4":
    case ".avi":
    case ".mkv":
      return await extractTextFromVideo(filePath);
    default:
      throw new Error("Formato não suportado.");
  }
}

async function extractTextFromWord(filePath) {
  const data = await mammoth.extractRawText({ path: filePath });
  return data.value;
}

async function extractTextFromPDF(filePath) {
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();
  return docs.map((doc) => doc.pageContent).join(" ");
}

async function extractTextFromPowerPoint(filePath) {
  const text = await extractor.extractText({ input: filePath, type: 'file' })
  return text;
}

async function extractTextFromVideo(filePath) {
  // Implementação para extração de legendas de vídeos, se disponíveis
}

const convertQuestionData = (question) => {
  if (question.type === "MULTIPLA_ESCOLHA" && Array.isArray(question.options)) {
    question.options = JSON.stringify(question.options);
  }

  return question;
}