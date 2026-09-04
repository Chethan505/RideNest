import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LicenseVerification.css"


const LicenseVerification = () => {

    const navigate = useNavigate();

    const [licenseNumber, setLicenseNumber] = useState("");

    const [licenseImage, setLicenseImage] = useState(null);

    const [idProofImage, setIdProofImage] = useState(null);

    const [user, setUser] = useState(null);

    const [message, setMessage] = useState("");

    const uploadLicense = async () => {

        const token = localStorage.getItem("token");

        if (!licenseNumber || !licenseImage) {
            setMessage("Please fill all required fields.");
            return;
        }

        const form = new FormData();

        form.append("licenseNumber", licenseNumber);
        form.append("licenseImage", licenseImage);

        if (idProofImage) {
            form.append("idProofImage", idProofImage);
        }

        const res = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:8080/api"}/auth/profile/license`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: form
            }
        );

        if (res.ok) {

            const updatedUser = {
                ...user,
                drivingLicenseNumber: licenseNumber,
                verificationStatus: "PENDING",
                rejectionReason: null
            };

            setUser(updatedUser);

            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );

            setMessage("Documents uploaded successfully.");

        } else {

            const text = await res.text();

            setMessage(text);

        }
    };
    useEffect(() => {

    const loadUser = async () => {

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {

            const res = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:8080/api"}/auth/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) {
                navigate("/login");
                return;
            }

            const latestUser = await res.json();

            setUser(latestUser);
            setLicenseNumber(latestUser.drivingLicenseNumber || "");

            localStorage.setItem(
                "user",
                JSON.stringify(latestUser)
            );

        } catch (err) {
            console.error(err);
        }

    };

    loadUser();

}, [navigate]);
    if (!user) return null;
    return (
        <div className="verification-page">

            <button
                className="btn btn-outline back-btn"
                onClick={() => navigate("/profile")}
            >
                ← Back
            </button>

            <div className="verification-card">

                {/* APPROVED */}

                {user.verificationStatus === "APPROVED" && (

                    <>

                        <div style={{ textAlign: "center" }}>

                            <div style={{ fontSize: "70px" }}>✅</div>

                            <h2>Verification Complete</h2>

                            <p className="verification-subtitle">
                                Your driving license has been verified successfully.
                            </p>

                            <div
                                style={{
                                    background: "#ecfdf5",
                                    padding: "18px",
                                    borderRadius: "12px",
                                    margin: "25px 0"
                                }}
                            >

                                <strong>License Number</strong>

                                <p>{user.drivingLicenseNumber}</p>

                            </div>

                            <button
                                className="btn btn-primary upload-btn"
                                onClick={() => setUser({
                                    ...user,
                                    verificationStatus: "EDIT"
                                })}
                            >

                                Edit Documents

                            </button>

                        </div>

                    </>

                )}

                {/* PENDING */}

                {user.verificationStatus === "PENDING" && (

                    <div style={{ textAlign: "center" }}>

                        <div style={{ fontSize: "70px" }}>🟡</div>

                        <h2>Verification Pending</h2>

                        <p className="verification-subtitle">

                            Your documents are currently being reviewed.

                            Please wait until an administrator approves them.

                        </p>

                    </div>

                )}

                {/* REJECTED */}

                {user.verificationStatus === "REJECTED" && (

                    <div>

                        <div style={{ textAlign: "center" }}>

                            <div style={{ fontSize: "70px" }}>❌</div>

                            <h2>Verification Rejected</h2>

                        </div>

                        <div className="reason-box">

                            <strong>Reason</strong>

                            <p>{user.rejectionReason}</p>

                        </div>

                        <button
                            className="btn btn-primary upload-btn"
                            onClick={() => setUser({
                                ...user,
                                verificationStatus: "EDIT"
                            })}
                        >

                            Upload Again

                        </button>

                    </div>

                )}

                {(!user.verificationStatus ||
                    user.verificationStatus === "EDIT") && (

                        <>

                            {message && (
                                <div className="success-message">
                                    {message}
                                </div>
                            )}

                            <div className="form-group">

                                <label>License Number</label>

                                <input
                                    type="text"
                                    className="input"
                                    placeholder="KA19XXXXXXXX"
                                    value={licenseNumber}
                                    onChange={(e) => setLicenseNumber(e.target.value)}
                                />

                            </div>

                            <div className="form-group">

                                <label>Driving License</label>

                                <label className="upload-box">

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setLicenseImage(e.target.files[0])}
                                    />

                                    <div className="upload-icon">📄</div>

                                    <div className="upload-title">
                                        Upload Driving License
                                    </div>

                                    <div className="upload-subtitle">
                                        Click to browse
                                    </div>

                                    {licenseImage && (
                                        <div className="file-name">
                                            ✅ {licenseImage.name}
                                        </div>
                                    )}

                                </label>

                            </div>

                            <div className="form-group">

                                <label>ID Proof (Optional)</label>

                                <label className="upload-box">

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setIdProofImage(e.target.files[0])}
                                    />

                                    <div className="upload-icon">🪪</div>

                                    <div className="upload-title">
                                        Upload Government ID
                                    </div>

                                    <div className="upload-subtitle">
                                        Aadhaar, PAN, Passport etc.
                                    </div>

                                    {idProofImage && (
                                        <div className="file-name">
                                            ✅ {idProofImage.name}
                                        </div>
                                    )}

                                </label>

                            </div>

                            <button
                                className="btn btn-primary upload-btn"
                                onClick={uploadLicense}
                            >

                                Upload Documents

                            </button>

                        </>

                    )}

            </div>

        </div>
    );


};

export default LicenseVerification;