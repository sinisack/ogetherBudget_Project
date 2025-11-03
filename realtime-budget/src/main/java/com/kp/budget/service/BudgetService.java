package com.kp.budget.service;

import com.kp.budget.domain.Budget;
import com.kp.budget.domain.User;
import com.kp.budget.repo.BudgetRepository;
import com.kp.budget.security.AuthUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;

@Service
@Transactional
public class BudgetService {
    private final BudgetRepository repo;
    private final AuthUtil auth;

    @PersistenceContext
    private EntityManager em;

    public BudgetService(BudgetRepository repo, AuthUtil auth) {
        this.repo = repo;
        this.auth = auth;
    }

    public Budget upsert(int year, int month, BigDecimal amount) {
        Long uid = auth.currentUserId();
        return repo.findByOwnerIdAndYearAndMonth(uid, year, month)
                .map(b -> { b.setAmount(amount); return b; })
                .orElseGet(() -> {
                    Budget b = new Budget();
                    User ownerRef = em.getReference(User.class, uid); // ★ JPA 프록시
                    b.setOwner(ownerRef);
                    b.setYear(year);
                    b.setMonth(month);
                    b.setAmount(amount);
                    return repo.save(b);
                });
    }

    public BigDecimal current(YearMonth ym) {
        Long uid = auth.currentUserId();
        return repo.findByOwnerIdAndYearAndMonth(uid, ym.getYear(), ym.getMonthValue())
                .map(Budget::getAmount)
                .orElse(BigDecimal.ZERO);
    }
}
