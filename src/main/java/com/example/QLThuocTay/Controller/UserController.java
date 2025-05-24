package com.example.QLThuocTay.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.QLThuocTay.Entities.User;
import com.example.QLThuocTay.Entities.UserRole;
import com.example.QLThuocTay.Repository.UserRepository;
import com.example.QLThuocTay.Repository.UserRoleRepository;
import com.example.QLThuocTay.dto.LoginRequest;
import com.example.QLThuocTay.dto.RegisterRequest;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserController(UserRepository userRepository, UserRoleRepository userRoleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Lấy tất cả người dùng
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // Lấy người dùng theo ID
    @GetMapping("/detail/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Cập nhật thông tin người dùng
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = optionalUser.get();

        // Không cho phép đổi email nếu là unique
        if (!user.getEmail().equals(updatedUser.getEmail()) && userRepository.findByEmail(updatedUser.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email đã tồn tại!");
        }

        user.setFullName(updatedUser.getFullName());
        user.setEmail(updatedUser.getEmail());
        user.setPhoneNumber(updatedUser.getPhoneNumber());

        // Nếu password không được gửi lên hoặc để rỗng thì giữ nguyên
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        // Cập nhật role nếu có gửi lên
        if (updatedUser.getUserRole() != null) {
            UserRole userRole = null;
            if (updatedUser.getUserRole().getRoleId() != null) {
                userRole = userRoleRepository.findById(updatedUser.getUserRole().getRoleId()).orElse(null);
            } else if (updatedUser.getUserRole().getRoleName() != null) {
                userRole = userRoleRepository.findByRoleNameIgnoreCase(updatedUser.getUserRole().getRoleName());
            }
            if (userRole == null) {
                return ResponseEntity.badRequest().body("Vai trò không hợp lệ!");
            }
            user.setUserRole(userRole);
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    // Xoá người dùng
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Đăng ký người dùng (RegisterRequest DTO)
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        // Kiểm tra các trường bắt buộc
        if (registerRequest.getEmail() == null || registerRequest.getEmail().isBlank()
                || registerRequest.getPassword() == null || registerRequest.getPassword().isBlank()
                || registerRequest.getFullName() == null || registerRequest.getFullName().isBlank()
                || registerRequest.getPhoneNumber() == null || registerRequest.getPhoneNumber().isBlank()) {
            return ResponseEntity.badRequest().body("Thiếu thông tin bắt buộc!");
        }

        // Kiểm tra email hoặc số điện thoại đã tồn tại
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email đã tồn tại!");
        }
        if (userRepository.findByPhoneNumber(registerRequest.getPhoneNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("Số điện thoại đã tồn tại!");
        }

        String roleName = registerRequest.getRoleName();
        if (roleName == null || roleName.isBlank()) {
            roleName = "customer"; // mặc định
        }

        UserRole userRole = userRoleRepository.findByRoleNameIgnoreCase(roleName);
        if (userRole == null) {
            return ResponseEntity.badRequest().body("Vai trò không hợp lệ!");
        }

        User user = new User();
        user.setFullName(registerRequest.getFullName());
        user.setEmail(registerRequest.getEmail());
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        user.setUserRole(userRole);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    // Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body("Thiếu thông tin đăng nhập!");
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword() == null || user.getPassword().isBlank()) {
                return ResponseEntity.status(500).body("Tài khoản chưa có mật khẩu!");
            }
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(401).body("Tài khoản hoặc mật khẩu không đúng");
            }
        } else {
            return ResponseEntity.status(401).body("Tài khoản hoặc mật khẩu không đúng");
        }
    }

    // Thêm người dùng (toàn quyền, cho admin)
    @PostMapping("/add")
    public ResponseEntity<?> addUser(@RequestBody User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()
                || user.getPassword() == null || user.getPassword().isBlank()
                || user.getFullName() == null || user.getFullName().isBlank()
                || user.getPhoneNumber() == null || user.getPhoneNumber().isBlank()) {
            return ResponseEntity.badRequest().body("Thiếu thông tin bắt buộc!");
        }

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email đã tồn tại!");
        }
        if (userRepository.findByPhoneNumber(user.getPhoneNumber()).isPresent()) {
            return ResponseEntity.badRequest().body("Số điện thoại đã tồn tại!");
        }

        UserRole userRole = null;
        if (user.getUserRole() != null) {
            if (user.getUserRole().getRoleId() != null) {
                userRole = userRoleRepository.findById(user.getUserRole().getRoleId()).orElse(null);
            } else if (user.getUserRole().getRoleName() != null) {
                userRole = userRoleRepository.findByRoleNameIgnoreCase(user.getUserRole().getRoleName());
            }
        }
        if (userRole == null) {
            userRole = userRoleRepository.findByRoleNameIgnoreCase("customer");
        }
        if (userRole == null) {
            return ResponseEntity.badRequest().body("Vai trò không hợp lệ!");
        }

        user.setUserRole(userRole);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }
}