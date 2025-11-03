package com.kp.budget.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

public class CookieUtil {
    public static void addHttpOnlyCookie(HttpServletResponse res, String name, String value, int maxAgeSeconds) {
        Cookie c = new Cookie(name, value);
        c.setHttpOnly(true);
        c.setPath("/");
        c.setSecure(false); // HTTPS 사용 시 true로
        c.setMaxAge(maxAgeSeconds);
        // SameSite=Strict (서버 설정 또는 응답 헤더로 추가)
        res.addHeader("Set-Cookie",
                String.format("%s=%s; Max-Age=%d; Path=/; HttpOnly; SameSite=Strict", name, value, maxAgeSeconds));
    }
    public static void clearCookie(HttpServletResponse res, String name) {
        res.addHeader("Set-Cookie", name + "=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict");
    }
}