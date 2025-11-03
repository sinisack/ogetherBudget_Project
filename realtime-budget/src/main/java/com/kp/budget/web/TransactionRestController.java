package com.kp.budget.web;

import com.kp.budget.domain.Transaction;
import com.kp.budget.dto.TransactionDto;
import com.kp.budget.service.BudgetService;
import com.kp.budget.service.TransactionService;
import org.springframework.web.bind.annotation.*;


import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;


@RestController
@RequestMapping("/api/transactions")
public class TransactionRestController {
    private final TransactionService txService;
    private final BudgetService budgetService;
    private final WsEventPublisher ws;


    public TransactionRestController(TransactionService txService, BudgetService budgetService, WsEventPublisher ws) {
        this.txService = txService; this.budgetService = budgetService; this.ws = ws;
    }


    @GetMapping
    public List<Transaction> all() { return txService.findAll(); }


    @PostMapping
    public Transaction create(@RequestBody Transaction t) {
        Transaction saved = txService.create(t);
        checkAndAlert();
        ws.broadcastTransactionsChanged();
        return saved;
    }


    @PutMapping("/{id}")
    public Transaction update(@PathVariable Long id, @RequestBody TransactionDto dto) {
        Transaction updated = txService.update(id, dto);
        checkAndAlert();
        ws.broadcastTransactionsChanged();
        return updated;
    }


    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        txService.delete(id);
        checkAndAlert();
        ws.broadcastTransactionsChanged();
    }


    private void checkAndAlert() {
        YearMonth ym = YearMonth.now();
        BigDecimal budget = budgetService.current(ym);
        if (budget.signum() <= 0) return;
        BigDecimal spent = txService.monthBalance(ym); // income -, expense + 의 순으로 계산했으므로 주의
        if (spent.signum() < 0) spent = spent.negate(); // 음수면 보정
        BigDecimal threshold = budget.multiply(new BigDecimal("0.80"));
        if (spent.compareTo(threshold) >= 0) {
            ws.broadcastBudgetAlert("⚠️ 예산의 80%를 초과했습니다: " + spent + " / " + budget);
        }
    }
}