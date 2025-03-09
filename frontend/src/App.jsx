import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Register from "./Register/Register";
import Login from "./Login/Login";// Ensure correct path
import Home from "./Home/Home";
import Navigation from "./Navigation/Navigation";
import ResumeAnalysis from "./ResumeAnalysis/ResumeAnalysis";
import InterviewQuestions from "./InterviewQuestions/InterviewQuestions";
import Selection from "./Selection/Selection";
import OtpVerify from "./Register/OtpVerify";
import ResumeAnalysisResult from "./ResumeAnalysis/ResAnalDisplay";
import DisplayQuestions from "./InterviewQuestions/DisplayQuestions";
function App() {
    return (
        <Router>
            <AuthProvider>
                <Navigation />
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/selection" element={<Selection />} />
                    <Route path="/resume-analysis" element={<ResumeAnalysis />} />
                    <Route path="/interview-questions" element={<InterviewQuestions />} />
                    <Route path="/verify-otp" element={<OtpVerify />} />
                    <Route path="/resume-analysis-results" element={<ResumeAnalysisResult />} />
                    <Route path="/display-questions" element={<DisplayQuestions />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
