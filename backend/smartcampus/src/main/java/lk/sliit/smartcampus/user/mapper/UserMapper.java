package lk.sliit.smartcampus.user.mapper;

import lk.sliit.smartcampus.user.dto.UserCreateRequestDto;
import lk.sliit.smartcampus.user.dto.UserResponseDto;
import lk.sliit.smartcampus.user.entity.User;

public class UserMapper {

    private UserMapper() {}

    public static User toEntity(UserCreateRequestDto dto) {
        User user = new User();
        user.setOauthProvider(dto.getOauthProvider());
        user.setOauthId(dto.getOauthId());
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        return user;
    }

    public static UserResponseDto toDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setOauthProvider(user.getOauthProvider());
        dto.setOauthId(user.getOauthId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setCreatedAt(user.getCreatedAt());

        // ⚠️ TEMP: role removed until user_roles mapping is implemented
        dto.setRole(null);

        return dto;
    }
}