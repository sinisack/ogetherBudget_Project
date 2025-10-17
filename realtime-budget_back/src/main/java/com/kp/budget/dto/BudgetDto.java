package com.kp.budget.dto;

import java.math.BigDecimal;


public record BudgetDto(
        Integer year,
        Integer month,
        BigDecimal amount
) {}