import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError("Please enter your email.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:8080/api"}/auth/forgot-password?email=${encodeURIComponent(email)}`,
                {
                    method: "POST",
                }
            );


            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to send OTP");
            }

            alert(data.message);

            navigate("/verify-otp", {
                state: { email },
            });

        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-container">

            <div className="forgot-card">

                <h1 className="forgot-title">
                    Forgot Password
                </h1>

                <p className="forgot-subtitle">
                    Enter your registered email to receive an OTP.
                </p>

                <form onSubmit={handleSubmit} className="forgot-form">

                    <div className="form-group">
                        <label className="forgot-label">
                            Email Address
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="forgot-input"
                        />
                    </div>

                    {error && (
                        <p className="forgot-error">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="forgot-button"
                    >
                        {loading ? "Sending OTP..." : "Send OTP"}
                    </button>

                </form>

            </div>

        </div>
    );
};

export default ForgotPassword;