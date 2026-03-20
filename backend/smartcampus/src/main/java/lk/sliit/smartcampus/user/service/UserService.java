package lk.sliit.smartcampus.user.service;

import java.util.List;
import lk.sliit.smartcampus.user.dto.UserCreateRequestDto;
import lk.sliit.smartcampus.user.dto.UserResponseDto;

public interface UserService {
    UserResponseDto createUser(UserCreateRequestDto request);
    List<UserResponseDto> getAllUsers();
}