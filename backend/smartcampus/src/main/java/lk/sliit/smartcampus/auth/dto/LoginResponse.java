package lk.sliit.smartcampus.auth.dto;

import lk.sliit.smartcampus.user.dto.UserResponseDto;

public class LoginResponse {
    private String token;
    private UserResponseDto user;

    public LoginResponse(String token, UserResponseDto user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserResponseDto getUser() {
        return user;
    }

    public void setUser(UserResponseDto user) {
        this.user = user;
    }
}
