package com.kp.budget.security;

import com.kp.budget.repo.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthUtil {
    private final UserRepository users;
    public AuthUtil(UserRepository users){ this.users = users; }

    public Long currentUserId() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a==null || !a.isAuthenticated()) throw new RuntimeException("unauthorized");
        String email = a.getName();
        return users.findByEmail(email).orElseThrow().getId();
    }
}
