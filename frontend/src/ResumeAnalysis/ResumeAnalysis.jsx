import React, { useState } from "react";
import axios from "axios";
import ResumeAnalysisResult from "./ResAnalDisplay";
import "./ResumeAnalysis.css"; 

export default function ResumeAnalysis() {
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [currentRole, setCurrentRole] = useState("");
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleFileChange(event) {
        setFile(event.target.files[0]);
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (!file || !jobDescription || !currentRole) {
            setError("⚠️ All fields are required.");
            return;
        }

        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("jobDescription", jobDescription);
        formData.append("currentRole", currentRole);

        axios.post("http://resumelens-backend-env.eba-jepn5cmh.ap-south-1.elasticbeanstalk.com/api/resume", formData, {
            headers: { 
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        })
        .then((res) => {
            setResponse(res.data);
            setLoading(false);
        })
        .catch((err) => {
            console.error("Error:", err);
            setError("❌ Failed to analyze resume. Please try again.");
            setLoading(false);
        });
    }

    return (
        <div className={`resume-container ${response ? "results-visible" : ""}`}>
            {!response ? (
                <>
                    <h2 className="resume-title">Complete Resume Analysis</h2>
                    
                    <form className="resume-form" onSubmit={handleSubmit}>
                        <div className="resume-form-group">
                            <label>Upload Resume (PDF):</label>
                            <input type="file" accept=".pdf" onChange={handleFileChange} />
                        </div>

                        <div className="resume-form-group">
                            <label>Job Description:</label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Enter the job description..."
                            />
                        </div>

                        <div className="resume-form-group">
                            <label>Current Role:</label>
                            <input 
                                type="text" 
                                value={currentRole} 
                                onChange={(e) => setCurrentRole(e.target.value)}
                                placeholder="Your current position..."
                            />
                        </div>

                        {error && <p className="resume-error-message">{error}</p>}

                        <button type="submit" className="resume-btn" disabled={loading}>
                            {loading ? "Analyzing..." : "Analyze Resume"}
                        </button>
                    </form>
                </>
            ) : (
                <ResumeAnalysisResult data={response} />
            )}
        </div>
    );
}
