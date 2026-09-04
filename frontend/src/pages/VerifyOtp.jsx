import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/VerifyOtp.css";

export default function VerifyOtp() {

    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email;

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const verifyOtp = async (e) => {

        e.preventDefault();

        setLoading(true);
        setError("");

        try {

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:8080/api"}/auth/verify-otp?email=${encodeURIComponent(email)}&otp=${otp}`,
                {
                    method: "POST"
                }
            );

            const message = await response.text();

            if (!response.ok) {
                throw new Error(message);
            }

            alert(message);

            navigate("/reset-password", {
                state: {
                    email,
                    otp
                }
            });

        } catch (err) {
            setError(err.message);
        }

        setLoading(false);

    };

    return (

        <div className="verify-container">

            <div className="verify-card">

                <h2 className="verify-title">
                    Verify OTP
                </h2>

                <p className="verify-subtitle">
                    OTP sent to
                    <br />
                    <span className="verify-email">{email}</span>
                </p>

                <form
                    onSubmit={verifyOtp}
                    className="verify-form"
                >

                    <input
                        type="text"
                        maxLength="6"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="verify-input"
                    />

                    {
                        error &&
                        <p className="verify-error">
                            {error}
                        </p>
                    }

                    <button
                        className="verify-button"
                        disabled={loading}
                    >
                        {
                            loading
                                ? "Verifying..."
                                : "Verify OTP"
                        }
                    </button>

                </form>

            </div>

        </div>

    );

}