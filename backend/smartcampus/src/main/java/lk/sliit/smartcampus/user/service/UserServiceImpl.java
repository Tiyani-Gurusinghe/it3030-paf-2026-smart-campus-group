package lk.sliit.smartcampus.user.service;

import java.util.List;
import lk.sliit.smartcampus.exception.ConflictException;
import lk.sliit.smartcampus.user.dto.UserCreateRequestDto;
import lk.sliit.smartcampus.user.dto.UserResponseDto;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.user.mapper.UserMapper;
import lk.sliit.smartcampus.user.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserResponseDto createUser(UserCreateRequestDto request) {
        userRepository.findByEmailIgnoreCase(request.getEmail().trim()).ifPresent(user -> {
            throw new ConflictException("Email already exists");
        });

        User savedUser = userRepository.save(UserMapper.toEntity(request));
        return UserMapper.toDto(savedUser);
    }

    @Override
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserMapper::toDto)
                .toList();
    }
}
