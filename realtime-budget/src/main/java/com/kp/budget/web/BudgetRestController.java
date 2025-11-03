package com.kp.budget.web;

import com.kp.budget.domain.Budget;
import com.kp.budget.dto.BudgetDto;
import com.kp.budget.service.BudgetService;
import org.springframework.web.bind.annotation.*;


import java.time.YearMonth;


@RestController
@RequestMapping("/api/budget")
public class BudgetRestController {
    private final BudgetService budgetService;
    private final WsEventPublisher ws;


    public BudgetRestController(BudgetService budgetService, WsEventPublisher ws) {
        this.budgetService = budgetService; this.ws = ws;
    }


    @PostMapping
    public Budget upsert(@RequestBody BudgetDto dto) {
        Budget saved = budgetService.upsert(dto.year(), dto.month(), dto.amount());
        ws.broadcastTransactionsChanged(); // 예산 바뀌면 그래프/잔액 재계산 유도
        return saved;
    }


    @GetMapping("/current")
    public Budget current() {
        var ym = YearMonth.now();
        return budgetService.upsert(ym.getYear(), ym.getMonthValue(), budgetService.current(ym));
    }
}