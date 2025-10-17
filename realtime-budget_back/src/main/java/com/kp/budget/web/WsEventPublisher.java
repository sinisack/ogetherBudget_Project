package com.kp.budget.web;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;


@Component
public class WsEventPublisher {
    private final SimpMessagingTemplate template;
    public WsEventPublisher(SimpMessagingTemplate template) { this.template = template; }


    public void broadcastTransactionsChanged() {
        template.convertAndSend("/topic/transactions", "UPDATED");
    }


    public void broadcastBudgetAlert(String message) {
        template.convertAndSend("/topic/alerts", message);
    }
}