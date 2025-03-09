import React, { useState } from "react";
import "./ResumeAnalysisResult.css";

export default function ResumeAnalysisResult({ data }) {
    if (!data || !data.analysis) return null;

    const { strengths, weaknesses, suggestions, match_percentage } = data.analysis;
    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <div className="resume-results">
            <h2 className="analysis-title">Resume Analysis Report</h2>

            {/* Match Percentage */}
            <div className="match-percentage">
                <strong>Match Percentage:</strong> {match_percentage}%
            </div>

            {/* Strengths Section */}
            <div className="analysis-section strengths">
                <h3 onClick={() => toggleSection("strengths")}>Strengths</h3>
                {openSection === "strengths" && (
                    <ul>
                        {strengths.map((point, index) => (
                            <li key={index}>• {point}</li> 
                        ))}
                    </ul>
                )}
            </div>

            {/* Weaknesses Section */}
            <div className="analysis-section weaknesses">
                <h3 onClick={() => toggleSection("weaknesses")}>Weaknesses</h3>
                {openSection === "weaknesses" && (
                    <ul>
                        {weaknesses.map((point, index) => (
                            <li key={index}>• {point}</li> 
                        ))}
                    </ul>
                )}
            </div>

            {/* Suggestions Section */}
            <div className="analysis-section suggestions">
                <h3 onClick={() => toggleSection("suggestions")}>Suggestions</h3>
                {openSection === "suggestions" && (
                    <ul>
                        {suggestions.map((point, index) => (
                            <li key={index}>• {point}</li> 
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
