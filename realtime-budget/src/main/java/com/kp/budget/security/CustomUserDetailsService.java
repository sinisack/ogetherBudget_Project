package com.kp.budget.security;

import com.kp.budget.repo.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private static final Logger log = LoggerFactory.getLogger(CustomUserDetailsService.class);
    private final UserRepository users;
    public CustomUserDetailsService(UserRepository users) { this.users = users; }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        if (email == null || email.isBlank()) {
            log.error("JWT Subject is null or empty. Cannot authenticate.");
            throw new UsernameNotFoundException("Token subject is missing.");
        }
        var u = users.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found in DB: " + email));
        if (u.getEmail() == null || u.getEmail().isBlank()) {
            log.error("DB User entity found, but 'email' field is null or empty for user ID: {}", u.getId());
            throw new IllegalStateException("Authenticated user entity is missing email field.");
        }
        var auths = Arrays.stream(u.getRoles().split(","))
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.trim()))
                .toList();
        return new org.springframework.security.core.userdetails.User(u.getEmail(), u.getPassword(), auths);
    }
}