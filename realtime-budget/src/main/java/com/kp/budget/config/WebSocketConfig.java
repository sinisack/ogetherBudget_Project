package com.kp.budget.config;

import com.kp.budget.security.JwtProvider;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;


@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue"); // queue는 /user 전용 응답
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user"); // ★ 유저 전용
    }


    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .addInterceptors(new JwtHandshakeInterceptor(jwtProvider))  // ★ 주입 필요 (생성자에 넣도록 구성)
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
    // 생성자 추가
    private final JwtProvider jwtProvider;
    public WebSocketConfig(JwtProvider jwtProvider){ this.jwtProvider = jwtProvider; }
}