package com.kp.budget.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {
    public static void addHttpOnlyCookie(HttpServletResponse res, String name, String value, int maxAgeSeconds) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSeconds);

        // SameSite=Lax는 로컬호스트(크로스-포트) 통신을 허용합니다.
        cookie.setAttribute("SameSite", "Lax");

        res.addCookie(cookie);
    }
    public static void clearCookie(HttpServletResponse res, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setPath("/");
        cookie.setMaxAge(0);

        cookie.setAttribute("SameSite", "Lax");

        res.addCookie(cookie);
    }
}