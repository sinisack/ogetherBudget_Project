package com.kp.budget.web;

import com.kp.budget.domain.User;
import com.kp.budget.repo.UserRepository;
import com.kp.budget.security.CookieUtil;
import com.kp.budget.security.JwtProvider;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtProvider jwt;

    public AuthController(UserRepository users, PasswordEncoder encoder,
                          AuthenticationManager authManager, JwtProvider jwt) {
        this.users = users;
        this.encoder = encoder;
        this.authManager = authManager;
        this.jwt = jwt;
    }

    // 회원 가입 프론트 요청 -> 이메일, 패스워드를 전달받음
    public record SignupReq(@Email @NotBlank String email, @NotBlank String password) {}
    public record LoginReq(@Email @NotBlank String email, @NotBlank String password) {}

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupReq req) {
        users.findByEmail(req.email()).ifPresent(u -> {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        });

        User u = new User();
        u.setEmail(req.email());
        u.setPassword(encoder.encode(req.password()));
        u.setRoles("USER");
        users.save(u);

        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req, HttpServletResponse res) {
        try {
            //AuthenticationManager를 사용해 인증 요청
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.password()));

            String subject = auth.getName();
            String safeSubject = subject == null ? "null" : subject;
            System.out.println("DEBUG: Auth Subject Name (Email) is: " + safeSubject);

            if (safeSubject.isBlank() || "null".equals(safeSubject)) {
                throw new IllegalStateException("인증은 성공했으나, 사용자 이메일(Subject)을 가져올 수 없습니다. Principal 설정을 확인하세요.");
            }

            String token = jwt.createToken(safeSubject, Map.of("roles", "USER"));

            CookieUtil.addHttpOnlyCookie(res, jwt.getCookieName(), token, 60 * 60); // 1h

            return ResponseEntity.ok(Map.of("ok", true));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "이메일 또는 비밀번호가 올바르지 않습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse res) {
        CookieUtil.clearCookie(res, jwt.getCookieName());
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()
                || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "인증되지 않은 사용자입니다."));
        }

        return ResponseEntity.ok(Map.of(
                "email", auth.getName()
        ));
    }
}