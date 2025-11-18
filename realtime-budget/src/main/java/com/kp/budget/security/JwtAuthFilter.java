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
    /**
     * 매 HTTP 요청마다 실행되면서 쿠키에서 토큰을 꺼내고
     * JwtProvider로 유효성 검증을 한 뒤 검증에 성공하면 
     * Spring Security의 SecurityContext에 “로그인 된 사용자 정보”를 넣어주는 JwtAuthFilter클래스
     */
    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    // JwtProvider에서 가져온 검증 담당
    private final JwtProvider jwt;
    // 이메일(또는 username) 으로 사용자 정보를 가져오는 스프링 시큐리티 인터페이스 구현체
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
        // http.getCookies() 로 요청에 딸려온 모든 쿠키를 가져옴
        if (http.getCookies()!=null) {
            token = Arrays.stream(http.getCookies())
                    .filter(c -> c.getName().equals(jwt.getCookieName()))
                    .map(Cookie::getValue).findFirst().orElse(null);
        }

        /**
         * 토큰이 있으면 검증 시도
         */

        // 쿠키에서 JWT 이름(JWT cookieName)과 동일한 쿠키를 찾고 토큰이 있다면 jwt.parse()로 검증
        if (StringUtils.hasText(token)) {
            try {
                // 검증
                Claims c = jwt.parse(token).getBody();

                // 파싱 성공 → UserDetailsService 호출
                var user = uds.loadUserByUsername(c.getSubject());
                var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

                // SecurityContextHolder에 인증 저장
                // 이후 BudgetService에서 AuthUtil로 현재 유저 ID 얻음
                SecurityContextHolder.getContext().setAuthentication(auth);
                /**
                 * c.getSubject()
                 * → 토큰 생성 시 넣었던 subject (이메일/username)
                 *
                 * uds.loadUserByUsername(...)
                 * → DB에서 유저를 찾아서 UserDetails 로 감싼 객체를 반환
                 *
                 * new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities())
                 * → Spring Security에서 “인증완료된 Authentication 객체” 역할
                 *
                 * SecurityContextHolder.getContext().setAuthentication(auth);
                 * → 이 요청 동안 “현재 인증된 사용자” 정보가 전체 스프링 앱에서 공유됨.
                 * → 나중에 AuthUtil.currentUserId() 같은 헬퍼가 이 정보를 꺼내 씀.
                 *
                 * AuthUtil에서 SecurityContextHolder.getContext().getAuthentication().getName() 으로 이메일 뽑는 구조
                 */
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