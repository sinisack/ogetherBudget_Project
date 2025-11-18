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
// "JWT를 만들고(발급) / 검증(파싱)”하는 도구 클래스
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


    // 토큰 생성
    public String createToken(String subject, Map<String, Object> claims) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusMillis(accessMillis)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
        /**
         * .setClaims(claims)
         * → 전달받은 Map을 클레임으로 셋팅
         *
         * .setSubject(subject)
         * → 이 토큰이 누구 것인지 (이메일 등) 표시
         *
         * .setIssuedAt(...)
         * → 발급 시각
         *
         * .setExpiration(...)
         * → 만료 시각 = 현재 + accessMillis
         *
         * .signWith(key, HS256)
         * → 앞에서 만든 key를 사용해서 HS256 알고리즘으로 서명
         *
         * .compact()
         * → 최종적으로 String 형태의 JWT로 직렬화
         *
         * 즉, 로그인 성공 시 이 메서드를 호출해서 토큰 한 줄짜리 문자열을 만들어서 쿠키에 넣어주는 구조
         */
    }

    // 토큰 검증/파싱
    public Jws<Claims> parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
        /**
         * parseClaimsJws(token) 을 호출하면 내부에서 두 가지를 동시에 함
         *
         * 1. 서명 검증 → 이 토큰이 우리 서버가 가진 key로 서명된 것인지 확인
         * (secret이 다른 위조 토큰이면 여기서 예외)
         *
         * 2. 만료 시간 검증 → exp가 지났으면 ExpiredJwtException 발생
         */
    }
}