const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const pdfParse = require("pdf-parse");

async function extractResumeContent(pdfBuffer) {
    const data = await pdfParse(pdfBuffer);
    let extractedText = data.text
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]{2,})([A-Z][a-z])/g, '$1 $2')
        .replace(/(\d)([A-Za-z])/g, '$1 $2')
        .replace(/([A-Za-z])(\d)/g, '$1 $2')
        .replace(/([a-zA-Z])\s*([.,])/g, '$1$2')
        .replace(/([A-Z])([A-Z]{2,})/g, '$1 $2')
        .replace(/\s{2,}/g, ' ')
        .replace(/\n{2,}/g, '\n')
        .trim();
    return extractedText;
}

router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            console.error("❌ No file uploaded");
            return res.status(400).json({ error: "No file uploaded." });
        }
        console.log("✅ Uploaded file:", req.file.originalname);

        const resumeText = await extractResumeContent(req.file.buffer);
        if (!resumeText) {
            return res.status(400).json({ error: "Invalid or unreadable resume file." });
        }

        const { jobDescription, currentRole } = req.body;
        if (!jobDescription || !currentRole) {
            return res.status(400).json({ error: "Job description and current role are required." });
        }

        console.log("📌 Job Description:", jobDescription);
        console.log("📌 Current Role:", currentRole);

        const prompt = `
        You are an AI career assistant specializing in technical interview preparation. 
        Your task is to analyze the given resume content, job description, and current role of the user. 
        Based on this information, generate **relevant technical interview questions**. 
        
        ### Candidate Details:
        **Resume:** ${resumeText}  
        **Job Description:** ${jobDescription}  
        **Current Role:** ${currentRole}  
        
        ### Expected JSON Output:
        { "technical_questions": ["Question 1", "Question 2", "Question 3"] }
        `;

        console.log("🚀 Sending request to Gemini AI...");
        const result = await model.generateContent(prompt);
        const rawResponse = await result.text();
        console.log("📜 AI Response:", rawResponse);

        const cleanedResponse = rawResponse.replace(/```json|```/g, "").trim();
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(cleanedResponse);
        } catch (err) {
            console.error("❌ Error parsing AI response:", cleanedResponse);
            return res.status(500).json({ error: "Invalid AI response format." });
        }

        res.json({ success: true, analysis: parsedResponse });
    } catch (error) {
        console.error("❌ Server Error:", error);
        return res.status(500).json({ error: "Failed to process resume." });
    }
});

module.exports = router;
