package com.kp.budget.web;

import com.kp.budget.domain.User;
import com.kp.budget.repo.UserRepository;
import com.kp.budget.security.CookieUtil;
import com.kp.budget.security.JwtProvider;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;
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
        this.users = users; this.encoder = encoder; this.authManager = authManager; this.jwt = jwt;
    }

    public record SignupReq(@Email @NotBlank String email, @NotBlank String password) {}
    public record LoginReq(@Email @NotBlank String email, @NotBlank String password) {}

    @PostMapping("/signup")
    public Map<String,Object> signup(@RequestBody SignupReq req) {
        users.findByEmail(req.email()).ifPresent(u -> { throw new RuntimeException("이미 존재하는 이메일"); });
        User u = new User();
        u.setEmail(req.email());
        u.setPassword(encoder.encode(req.password()));
        users.save(u);
        return Map.of("ok", true);
    }

    @PostMapping("/login")
    public Map<String,Object> login(@RequestBody LoginReq req, HttpServletResponse res) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        // 토큰 생성 & HttpOnly 쿠키로 내려줌
        String token = jwt.createToken(req.email(), Map.of("roles","USER"));
        CookieUtil.addHttpOnlyCookie(res, jwt.getCookieName(), token, 60*60); // 1h
        return Map.of("ok", true);
    }

    @PostMapping("/logout")
    public Map<String,Object> logout(HttpServletResponse res) {
        CookieUtil.clearCookie(res, jwt.getCookieName());
        return Map.of("ok", true);
    }

    @GetMapping("/me")
    public Map<String,Object> me(org.springframework.security.core.Authentication auth) {
        return Map.of("email", auth.getName());
    }
}