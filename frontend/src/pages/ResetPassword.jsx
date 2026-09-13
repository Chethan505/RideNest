import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/ResetPassword.css";

export default function ResetPassword() {

    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;
    const otp = location.state?.otp;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const resetPassword = async (e) => {

        e.preventDefault();
        if (!password.trim()) {
            setError("Please enter a new password.");
            return;
        }

        if (!confirmPassword.trim()) {
            setError("Please confirm your password.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }


        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/reset-password?email=${encodeURIComponent(email)}&otp=${otp}&newPassword=${encodeURIComponent(password)}`,
                {
                    method: "POST"
                }
            );

            const message = await response.text();

            if (!response.ok) {
                throw new Error(message);
            }

            alert(message);

            navigate("/login");

        } catch (err) {

            setError(err.message);

        }

        setLoading(false);

    };

    return (

        <div className="reset-container">

            <div className="reset-card">

                <h2 className="reset-title">
                    Reset Password
                </h2>

                <p className="reset-subtitle">
                    Create a new password for your account.
                </p>

                <form
                    onSubmit={resetPassword}
                    className="reset-form"
                >

                    <input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="reset-input"
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="reset-input"
                    />

                    {
                        error &&
                        <p className="reset-error">
                            {error}
                        </p>
                    }

                    <button
                        className="reset-button"
                        disabled={loading}
                    >
                        {
                            loading
                                ? "Updating..."
                                : "Reset Password"
                        }
                    </button>

                </form>

            </div>

        </div>

    );

}