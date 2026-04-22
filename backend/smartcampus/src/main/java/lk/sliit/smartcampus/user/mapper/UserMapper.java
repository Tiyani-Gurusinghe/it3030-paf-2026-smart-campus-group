package lk.sliit.smartcampus.user.mapper;

import lk.sliit.smartcampus.user.dto.UserCreateRequestDto;
import lk.sliit.smartcampus.user.dto.UserResponseDto;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.common.enums.RoleType;

public class UserMapper {

    private UserMapper() {}

    public static User toEntity(UserCreateRequestDto dto) {
        User user = new User();
        user.setOauthProvider(dto.getOauthProvider());
        user.setOauthId(dto.getOauthId());
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setCampusId(dto.getCampusId());
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

        if (user.getUserRoles() != null && !user.getUserRoles().isEmpty()) {
            dto.setRole(user.getUserRoles().iterator().next().getRole().getName());
        } else {
            dto.setRole(RoleType.USER);
        }

        return dto;
    }
}