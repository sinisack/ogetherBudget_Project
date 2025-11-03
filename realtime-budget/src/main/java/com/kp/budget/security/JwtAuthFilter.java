package com.kp.budget.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.util.StringUtils;
import java.io.IOException;
import java.util.Arrays;

public class JwtAuthFilter extends GenericFilter {
    private final JwtProvider jwt;
    private final UserDetailsService uds;

    public JwtAuthFilter(JwtProvider jwt, UserDetailsService uds) {
        this.jwt = jwt; this.uds = uds;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest http = (HttpServletRequest) req;
        String token = null;
        if (http.getCookies()!=null) {
            token = Arrays.stream(http.getCookies())
                    .filter(c -> c.getName().equals(jwt.getCookieName()))
                    .map(Cookie::getValue).findFirst().orElse(null);
        }
        if (StringUtils.hasText(token)) {
            try {
                Claims c = jwt.parse(token).getBody();
                var user = uds.loadUserByUsername(c.getSubject());
                var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (Exception ignored) { /* 토큰 무효 시 비인증으로 진행 */ }
        }
        chain.doFilter(req, res);
    }
}