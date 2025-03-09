import React from "react";
import { useLocation } from "react-router-dom";
import "./DisplayQuestions.css"; 

export default function DisplayQuestions() {
    const location = useLocation();
    const questions = location.state?.questions || [];

    return (
        <div className="display-container">
            <h2 className="display-title">Generated Interview Questions</h2>
            <div className="questions-box">
                {questions.length > 0 ? (
                    <ul className="question-list">
                        {questions.map((question, index) => (
                            <li key={index} className="question-item">
                                <span className="question-number">{index + 1}.</span>
                                {question}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-questions">No questions available.</p>
                )}
            </div>
        </div>
    );
}
