package lk.sliit.smartcampus.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SignupRequest {

    @NotBlank(message = "Name is required")
    private String fullName;

    @NotBlank(message = "Campus ID is required")
    @jakarta.validation.constraints.Pattern(regexp = "^IT\\d{8}$", message = "Campus ID must start with IT followed by exactly 8 digits")
    private String campusId;

    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @jakarta.validation.constraints.Size(min = 8, message = "Password must be at least 8 characters")
    @jakarta.validation.constraints.Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$", message = "Password must contain letters, numbers, and symbols")
    private String password;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getCampusId() { return campusId; }
    public void setCampusId(String campusId) { this.campusId = campusId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
