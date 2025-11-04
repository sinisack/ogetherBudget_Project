package com.kp.budget.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.GenericFilterBean;
import java.io.IOException;
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class JwtAuthFilter extends GenericFilterBean {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtProvider jwt;
    private final UserDetailsService uds;

    public JwtAuthFilter(JwtProvider jwt, UserDetailsService uds) {
        this.jwt = jwt; this.uds = uds;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest http = (HttpServletRequest) req;
        HttpServletResponse httpRes = (HttpServletResponse) res;
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

            } catch (ExpiredJwtException e) {
                log.warn("🚨 JWT Token Expired: {}", e.getMessage());
                CookieUtil.clearCookie(httpRes, jwt.getCookieName());
            } catch (SignatureException e) {
                log.error("JWT Signature Validation Failed: {}", e.getMessage());
                CookieUtil.clearCookie(httpRes, jwt.getCookieName());
            } catch (Exception e) {
                log.error("General JWT/Auth Error: {}", e.getMessage());
                CookieUtil.clearCookie(httpRes, jwt.getCookieName());
            }
        }
        chain.doFilter(req, res);
    }
}