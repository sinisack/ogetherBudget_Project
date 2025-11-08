package com.kp.budget.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Component
public class JwtProvider {
    private final Key key;
    private final long accessMillis;
    private final String cookieName;

    public JwtProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-minutes}") long accessMinutes,
            @Value("${jwt.cookie-name}") String cookieName) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessMillis = accessMinutes * 60_000L;
        this.cookieName = cookieName;
    }

    public String getCookieName() {
        return cookieName;
    }

    public String createToken(String subject, Map<String, Object> claims) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusMillis(accessMillis)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }
}