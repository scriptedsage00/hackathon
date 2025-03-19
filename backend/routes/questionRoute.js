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
        if (!req.file) return res.status(400).json({ error: "No file uploaded." });

        console.log("Uploaded file:", req.file);

        const resumeText = await extractResumeContent(req.file.buffer);
        const jobDescription = req.body.jobDescription;
        const currentRole = req.body.currentRole;

        const prompt = `
        You are an AI career assistant specializing in technical interview preparation. 
        Your task is to analyze the given resume content, job description, and current role of the user. 
        Based on this information, generate **relevant technical interview questions**. 
        
        ### **Instructions:**
        - **For Freshers:**  
          - Focus on **DSA, CS fundamentals, and technical concepts** relevant to their projects and coursework.  
          - Ask **conceptual & coding questions** based on the resume's mentioned skills.  
        
        - **For Experienced Candidates:**  
          - Prioritize **real-world problem-solving, system design, and performance optimization**.  
          - Ask **role-specific technical questions** aligned with the job description.  
        
        - **Ensure questions are tailored to the resume & job description.**  
        - **Avoid generic responses—make them insightful and customized.**  
        
        ### **Candidate Details:**
        **Resume:** ${resumeText}  
        **Job Description:** ${jobDescription}  
        **Current Role:** ${currentRole}  
        
        ### **Expected JSON Output Format:**
        {
          "technical_questions": ["Question 1", "Question 2", "Question 3", "Question 4"]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawResponse = response.text();

        console.log("AI Raw Response:", rawResponse);

        const cleanedResponse = rawResponse.replace(/```json|```/g, "").trim();

        try {
            const parsedResponse = JSON.parse(cleanedResponse);
            res.json({ success: true, analysis: parsedResponse });
        } catch (err) {
            console.error("Error parsing AI response:", err, "Raw Response:", cleanedResponse);
            res.status(500).json({ error: "Invalid AI response format" });
        }
    } catch (error) {
        console.error("Error analyzing resume:", error);
        return res.status(500).json({ error: "Failed to process resume." });
    }
});

module.exports = router;
