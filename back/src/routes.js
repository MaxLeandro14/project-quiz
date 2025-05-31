
import express from 'express';
import { authenticateJWT } from './middleware/authenticateJWT.js';

import { createUser, googleLogin, loginUser, deleteUser, updateAtivo, updateProfile } from './controllers/userController.js'
import { generateQuestionsFromYoutube } from "./controllers/questionYouTubeController.js";
import { uploadDocument } from "./controllers/questionDocumentController.js";
import { linkDocument } from "./controllers/questionLinkController.js";
import { questions, checkAnswer } from "./controllers/questionsController.js";
import { performance, averagePerformancePorMaterial, compareQuestPerformance, performanceSummary, getTopQuestionsByMaterial, getMaterialSummary, getUserAnswersByMaterial } from "./controllers/questionStatisticsController.js";
import { createRoom, editRoom, getRoomDetails, getUserRooms, getRoomsAll, getRoomByCode, generateNewRoomCode, deleteRoom } from "./controllers/roomController.js";
import { commentQuestion, getCommentsQuestion, getUserComments, deleteCommentQuestion } from './controllers/commentsController.js'
import { saveRoom, getSavedRooms, removeSavedRoom } from "./controllers/savedRoomsController.js";
import { uploadExam } from "./controllers/questionExamController.js";
// import { createSubscription, handleWebhook, cancelSubscription, getSubscriptionStatus } from './controllers/paymentController,js';

const routes = express.Router();

routes.post("/cadastro", createUser);
routes.post("/login", loginUser);
routes.post("/acesso/google", googleLogin);
routes.post("/user/update", updateProfile);
routes.post("/user/activive", updateAtivo);
routes.post("/user/delete", deleteUser);

routes.post("/generate/youtube", authenticateJWT, generateQuestionsFromYoutube);
routes.post("/generate/document", uploadDocument);
routes.post("/generate/link", linkDocument);
routes.post("/generate/exame", uploadExam);

// question
routes.get("/questions/:material_id", questions);
routes.post("/check-answer", checkAnswer);

//estatistica
routes.get("/performance/:questionId", performance);
routes.get("/average-performance-material/:materialId", averagePerformancePorMaterial);
routes.get("/compare/:questionId", compareQuestPerformance);
routes.get("/performance-summary/:materialId", performanceSummary);
routes.get('/stats/material/:materialId/top-questions', getTopQuestionsByMaterial);
routes.get('/stats/material/:materialId/summary', getMaterialSummary);
routes.get('/report/:materialId', getUserAnswersByMaterial);

//room
routes.post('/room/create', authenticateJWT, createRoom);
routes.get('/room/edit/:room_id', authenticateJWT, editRoom);
routes.delete('/room/delete/:id', authenticateJWT, deleteRoom);
routes.get('/room/:room_id/codigo/generate', authenticateJWT, generateNewRoomCode);
routes.get('/room/details/:room_id', getRoomDetails);
routes.get('/room/user/all', getUserRooms);
routes.get('/room/all', getRoomsAll);
routes.get('/room/codigo/:codigo', getRoomByCode);

//comments
routes.post('/comments/:question_id/create', authenticateJWT, commentQuestion);
routes.get('/comments/:question_id/all', authenticateJWT, getCommentsQuestion);
routes.get('/comments/my', authenticateJWT, getUserComments);
routes.delete('/comments/:comment_id', authenticateJWT, deleteCommentQuestion);

//saved room
routes.post('/room/save', authenticateJWT, saveRoom);
routes.get('/room/save/all', authenticateJWT, getSavedRooms);
routes.delete('/room/:saved_room_id/remove', authenticateJWT, removeSavedRoom);

// Pagamentos Api
//router.post('/subscribe', authenticateJWT, createSubscription);
//router.post('/cancel', authenticateJWT, cancelSubscription);
///router.get('/status/:userId', authenticateJWT, getSubscriptionStatus);
// Webhook para atualizar status de pagamentos (recebido do provedor de pagamento)
//router.post('/a88adf8b33327a4f24d4e9bc2b21658/webhook', handleWebhook);

export default routes;
