import Materials from '../models/Material.js';
import QuestionComments from '../models/QuestionComments.js';
import { generateQuestions } from "../services/langchainService.js";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fs from "fs/promises";
import path from 'path';
import multer from 'multer';
import mammoth from "mammoth";
import { fromPath } from "pdf2pic";
import multerConfig from '../config/multerConfig.js';
import { OpenAI } from 'openai';

const upload = multer(multerConfig).single('file');

// Configuração do OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const uploadExam = async (req, res) => {
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

  //  const pdfBuffer = await fs.readFile(filePath);
   // const pdfBase64 = pdfBuffer.toString('base64');
   // console.log('pdfBase64', pdfBase64)

   const options = {
    density: 100,
    saveFilename: 'untitled',
    format: 'png',
    width: 600,
    height: 600,
  };

    try {
      const convert = fromPath(filePath, options);
      const pageToConvertAsImage = 1;
      const result = await convert(pageToConvertAsImage, {
        responseType: 'image',
      });
      return result;
    } catch (error) {
      console.error('Conversion error:', error);
    }

    try {
     // const extractedText = await pdfToBase64(filePath, fileExt);
     // console.log('extractedText', extractedText);
      return;
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      res.status(500).json({ error: "Erro ao processar o arquivo.", details: error.message });
    } finally {
    //  fs.unlink(filePath, () => {}); // Remove o arquivo temporário após o processamento
    }

  });
}
