package com.kp.budget.web;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class WsEventPublisher {
    private final SimpMessagingTemplate template;
    public WsEventPublisher(SimpMessagingTemplate template) { this.template = template; }

    // 전체 방송이 필요하면 그대로 유지
    public void broadcastTransactionsChanged() {
        template.convertAndSend("/topic/transactions", "UPDATED");
    }

    // 특정 사용자에게만 알림
    public void notifyUser(Long userId, String message) {
        template.convertAndSendToUser(String.valueOf(userId), "/queue/alerts", message);
    }

    public void broadcastBudgetAlert(String message) {
        template.convertAndSend("/topic/alerts", message);
    }
}
