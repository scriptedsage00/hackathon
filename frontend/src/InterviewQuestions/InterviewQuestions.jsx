import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./InterviewQuestions.css"; 

export default function InterviewQuestions() {
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [currentRole, setCurrentRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    function handleFileChange(event) {
        setFile(event.target.files[0]);
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (!file || !jobDescription || !currentRole) {
            setError("All fields are required.");
            return;
        }

        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("jobDescription", jobDescription);
        formData.append("currentRole", currentRole);

        axios.post("http://resumelens-backend-env.eba-jepn5cmh.ap-south-1.elasticbeanstalk.com/api/questions", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
        })
        .then((res) => {
            setLoading(false);
            navigate("/display-questions", { state: { questions: res.data.analysis.technical_questions } });
        })
        .catch((err) => {
            console.error("Error:", err);
            setError("Failed to analyze resume. Please try again.");
            setLoading(false);
        });
    }

    return (
        <div className="interview-container">
            <h2 className="interview-title">Expected Interview Questions</h2>
            <form className="interview-form" onSubmit={handleSubmit}>
                <div className="interview-form-group">
                    <label>Upload Resume (PDF): </label>
                    <input type="file" accept=".pdf" onChange={handleFileChange} />
                </div>
                <div className="interview-form-group">
                    <label>Job Description:</label>
                    <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                </div>
                <div className="interview-form-group">
                    <label>Current Role:</label>
                    <input type="text" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} />
                </div>
                {error && <p className="interview-error-message">{error}</p>}
                <button type="submit" className="interview-btn" disabled={loading}>
                    {loading ? "Analyzing..." : "Generate Questions"}
                </button>
            </form>
        </div>
    );
}
