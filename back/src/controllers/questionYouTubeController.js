import Materials from '../models/Material.js';
import Question from '../models/Question.js';
import { generateQuestions } from "../services/langchainService.js";
import { YoutubeTranscript } from "youtube-transcript";

export const generateQuestionsFromYoutube = async (req, res) => {
  try {
    const { url } = req.body;
    console.log("URL recebida:", url);

    if (!url) {
      return res.status(400).json({ error: "URL do YouTube é obrigatória." });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: "URL do YouTube inválida." });
    }

    let transcript;
    try {
      transcript = await YoutubeTranscript.fetchTranscript(videoId);

      const totalTranscriptChars = transcript.map(item => item.text).join(" ").length;
      const estimatedMinutes = totalTranscriptChars / 1000;

      console.log('totalTranscriptChars', totalTranscriptChars)
      console.log('estimatedMinutes', estimatedMinutes)

      const isSubscriber = true;

      if (estimatedMinutes > 40 && !isSubscriber) {
        return res.status(403).json({
          error: "Tamanho de video maior que o permitido. Assinatura necessária para continuar."
        });
      }

    } catch (err) {
      console.error("Erro ao obter transcrição:", err);
      return res.status(500).json({ error: "Falha ao obter a transcrição do vídeo." });
    }

    if (!Array.isArray(transcript) || transcript.length === 0) {
      return res.status(404).json({ error: "Nenhuma transcrição disponível para este vídeo." });
    }

    const documents = [
      {
        pageContent: transcript.map((item) => item.text).join(" "),
        metadata: {
          source: "YouTube",
          language: transcript[0]?.lang || "unknown",
        },
      },
    ];

    if (!documents[0].pageContent.trim()) {
      return res.status(404).json({ error: "A transcrição está vazia ou inválida." });
    }

    const user_id = req.user?.id;
    if (!user_id) {
      throw new Error("Usuário não autenticado.");
    }
    
    const PARAMS = {
      totalQuestion: 7,
      explanatory: 1,
      trueFalse: 2,
      multipleChoice: 4
    }

    const response = await generateQuestions(documents, PARAMS);

    try {
      const material = await Materials.create({
        user_id,
        type: "youtube",
        title: response.title
      });

      console.log('material', material);

      const questionsData = response.questions.map((question) => {
        const data = {
          material_id: material.id,
          url: url,
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
      
      await Question.bulkCreate(questionsData);
    
      console.log('Perguntas salvas com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar as perguntas no banco de dados:", error);
      throw error;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Erro ao gerar perguntas:", error);
    res.status(500).json({ error: "Erro interno ao gerar perguntas." });
  }
};

const extractVideoId = (url) => {
  const match = url.match(
    /(?:youtube\.com\/.*(?:v=|\/embed\/)|youtu\.be\/|youtube\.com\/shorts\/)([^&?/]+)/
  );
  return match ? match[1] : null;
};
