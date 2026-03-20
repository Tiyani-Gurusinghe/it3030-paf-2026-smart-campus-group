package lk.sliit.smartcampus.user.dto;

import lk.sliit.smartcampus.common.enums.RoleType;
import lk.sliit.smartcampus.common.enums.StatusType;

public class UserResponseDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private RoleType role;
    private StatusType status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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