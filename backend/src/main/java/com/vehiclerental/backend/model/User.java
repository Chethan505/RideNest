package com.vehiclerental.backend.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    // Role can be "USER" or "ADMIN"
    private String role;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String profilePicture;

    private String dateOfBirth;
    private String phoneNumber;
    private String address;


    // user Drving Licence

    @Column(length = 30)
private String drivingLicenseNumber;

private String drivingLicenseImage;

private String idProofImage;

@Column(length = 20)
private String verificationStatus = "PENDING";

private String rejectionReason;

    // ─── UserDetails implementation ─────────────────────────────────────

    @JsonIgnore
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @JsonIgnore
    @Override
    public String getUsername() {
        return email;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isEnabled() {
        return true;
    }

    // ─── Getters & Setters ──────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    @JsonIgnore
    @Override
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getDrivingLicenseNumber() {
    return drivingLicenseNumber;
}

public void setDrivingLicenseNumber(String drivingLicenseNumber) {
    this.drivingLicenseNumber = drivingLicenseNumber;
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
}
