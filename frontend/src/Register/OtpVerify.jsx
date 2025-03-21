// OtpVerify.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

export default function OtpVerify() {
    const location = useLocation();
    const navigate = useNavigate();
    const userData = location.state || {};  // 🔥 Get full user data

    const [otp, setOtp] = useState("");

    function handleVerify(e) {
        e.preventDefault();
        console.log("Verifying OTP for:", userData.email);

        axios.post("http://resumelens-backend-env.eba-jepn5cmh.ap-south-1.elasticbeanstalk.com/api/auth/signup/verify-otp", { email: userData.email, user_otp: otp })
            .then((res) => {
                alert("OTP verified successfully!");
                console.log("✅ OTP Verified. Proceeding to Signup...");

                // 🔥 Call Signup API after OTP verification
                axios.post("http://resumelens-backend-env.eba-jepn5cmh.ap-south-1.elasticbeanstalk.com/api/auth/signup", userData)
                    .then((res) => {
                        alert("Signup successful!");
                        console.log("✅ User Registered:", res.data);
                        navigate("/selection");
                    })
                    .catch((err) => {
                        console.error("❌ Signup Error:", err);
                        alert("Signup failed. Please try again.");
                    });

            })
            .catch((err) => {
                alert("Invalid OTP or expired OTP.");
            });
    }

    return (
        <div className="otp-container">
            <form className="otp-form">
                <div className="mb-3">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" value={userData.email} disabled />
                </div>
                <div className="mb-3">
                    <label htmlFor="otp">OTP</label>
                    <input type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
                </div>
                <button onClick={handleVerify} className="otp-button">Verify OTP & Register</button>
            </form>
        </div>
    );
}
