package com.vehiclerental.backend.dto;

public class UserVerificationResponse {

    private String verificationStatus;
    private String rejectionReason;
    private String drivingLicenseImage;
    private String idProofImage;

    public UserVerificationResponse() {
    }

    public UserVerificationResponse(
            String verificationStatus,
            String rejectionReason,
            String drivingLicenseImage,
            String idProofImage) {

        this.verificationStatus = verificationStatus;
        this.rejectionReason = rejectionReason;
        this.drivingLicenseImage = drivingLicenseImage;
        this.idProofImage = idProofImage;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getDrivingLicenseImage() {
        return drivingLicenseImage;
    }

    public void setDrivingLicenseImage(String drivingLicenseImage) {
        this.drivingLicenseImage = drivingLicenseImage;
    }

    public String getIdProofImage() {
        return idProofImage;
    }

    public void setIdProofImage(String idProofImage) {
        this.idProofImage = idProofImage;
    }
}