package lk.sliit.smartcampus.user.dto;

import lk.sliit.smartcampus.common.enums.RoleType;
import lk.sliit.smartcampus.common.enums.StatusType;

public class UserUpdateRequestDto {
    private String firstName;
    private String lastName;
    private RoleType role;
    private StatusType status;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public RoleType getRole() { return role; }
    public void setRole(RoleType role) { this.role = role; }

    public StatusType getStatus() { return status; }
    public void setStatus(StatusType status) { this.status = status; }
}