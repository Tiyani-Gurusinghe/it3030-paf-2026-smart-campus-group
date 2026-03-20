package lk.sliit.smartcampus.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lk.sliit.smartcampus.common.enums.RoleType;
import lk.sliit.smartcampus.common.enums.StatusType;

public class UserCreateRequestDto {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email
    @NotBlank
    private String email;

    @NotNull
    private RoleType role;

    @NotNull
    private StatusType status;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public RoleType getRole() { return role; }
    public void setRole(RoleType role) { this.role = role; }

    public StatusType getStatus() { return status; }
    public void setStatus(StatusType status) { this.status = status; }
}