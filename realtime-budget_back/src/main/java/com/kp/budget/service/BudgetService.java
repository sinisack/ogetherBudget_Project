package com.kp.budget.service;

import com.kp.budget.domain.Budget;
import com.kp.budget.repo.BudgetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;
import java.time.YearMonth;


@Service
@Transactional
public class BudgetService {
    private final BudgetRepository repo;


    public BudgetService(BudgetRepository repo) { this.repo = repo; }


    public Budget upsert(int year, int month, BigDecimal amount) {
        return repo.findByYearAndMonth(year, month)
                .map(b -> { b.setAmount(amount); return b; })
                .orElseGet(() -> { Budget b = new Budget(); b.setYear(year); b.setMonth(month); b.setAmount(amount); return repo.save(b); });
    }


    public BigDecimal current(YearMonth ym) {
        return repo.findByYearAndMonth(ym.getYear(), ym.getMonthValue())
                .map(Budget::getAmount).orElse(BigDecimal.ZERO);
    }
}