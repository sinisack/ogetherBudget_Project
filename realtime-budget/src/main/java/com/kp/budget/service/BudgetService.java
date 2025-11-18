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

    //예산 upsert (생성/수정)
    public Budget upsert(int year, int month, BigDecimal amount) {
        // AuthUtil로 현재 유저 ID 얻음
        Long uid = auth.currentUserId();
        // 해당 유저+연/월 예산 있는지 검색
        return repo.findByOwnerIdAndYearAndMonth(uid, year, month)
                .map(b -> {
                    // @Transactional 이라 더티체킹으로 자동 UPDATE 됨
                    b.setAmount(amount); // 있으면 금액만 바꿈
                    return b;
                })
                // 없으면 해당 유저+연/월 예산 set
                .orElseGet(() -> {
                    Budget b = new Budget();
                    User ownerRef = em.getReference(User.class, uid); // 전체 유저 조회 없이 레퍼런스만(JPA 프록시)
                    /**
                     * getReference()는 DB SELECT를 날리지 않음.
                     * ➡ 대신 "프록시(User stub)"만 생성해서 참조함.
                     * ➡ INSERT 시 필요한 user_id 값만 있으면 되므로 SELECT가 필요 없음.
                     *
                     *
                     * “예산/거래 생성할 때 User를 다시 조회하지 않고도 owner 설정이 가능하다.”
                     */
                    b.setOwner(ownerRef);
                    b.setYear(year);
                    b.setMonth(month);
                    b.setAmount(amount);
                    return repo.save(b);
                });
    }


    // 현재 예산 조회
    public BigDecimal current(YearMonth ym) {
        Long uid = auth.currentUserId();
        return repo.findByOwnerIdAndYearAndMonth(uid, ym.getYear(), ym.getMonthValue())
                .map(Budget::getAmount)
                .orElse(BigDecimal.ZERO);
    }
}
