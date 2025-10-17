package com.kp.budget.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;


public record TransactionDto(
        Long id,
        LocalDateTime occurredAt,
        String category,
        String memo,
        BigDecimal amount,
        String type
) {}