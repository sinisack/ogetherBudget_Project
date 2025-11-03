package com.kp.budget.config;

import com.kp.budget.security.JwtProvider;
import io.jsonwebtoken.Claims;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.security.Principal;
import java.util.Arrays;
import java.util.Map;

public class JwtHandshakeInterceptor implements HandshakeInterceptor {
    private final JwtProvider jwt;
    public JwtHandshakeInterceptor(JwtProvider jwt) { this.jwt = jwt; }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        var cookies = request.getHeaders().get("Cookie");
        if (cookies != null) {
            String token = cookies.stream()
                    .flatMap(v -> Arrays.stream(v.split(";")))
                    .map(String::trim)
                    .filter(p -> p.startsWith(jwt.getCookieName()+"="))
                    .map(p -> p.substring(p.indexOf('=')+1))
                    .findFirst().orElse(null);
            if (token != null) {
                try {
                    Claims c = jwt.parse(token).getBody();
                    String email = c.getSubject();
                    attributes.put("principal", (Principal) () -> email);
                } catch (Exception ignored) {}
            }
        }
        return true;
    }

    @Override public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                         WebSocketHandler wsHandler, Exception exception) {}
}