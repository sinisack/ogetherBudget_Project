package com.kp.budget.service;

import com.kp.budget.domain.Transaction;
import com.kp.budget.domain.User;
import com.kp.budget.dto.TransactionDto;
import com.kp.budget.repo.TransactionRepository;
import com.kp.budget.security.AuthUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

@Service
@Transactional
public class TransactionService {

    private final TransactionRepository repo;
    private final AuthUtil auth;

    @PersistenceContext
    private EntityManager em;

    public TransactionService(TransactionRepository repo, AuthUtil auth) {
        this.repo = repo;
        this.auth = auth;
    }

    public List<Transaction> findAll() {
        Long uid = auth.currentUserId();
        return repo.findAllByOwnerId(uid);
    }

    public Transaction create(Transaction t) {
        Long uid = auth.currentUserId();
        User ownerRef = em.getReference(User.class, uid); // ★ 권장: 전체 유저 조회 없이 레퍼런스만
        t.setOwner(ownerRef);
        return repo.save(t);
    }

    /**
     * 내역 수정 (부분 수정 지원)
     * - dto 에서 null이 아닌 필드만 반영
     * - type 은 enum 이라고 가정하고 String -> Transaction.Type 변환
     */
    public Transaction update(Long id, TransactionDto dto) {
        Long uid = auth.currentUserId();
        Transaction t = repo.findByIdAndOwnerId(id, uid).orElseThrow();

        if (dto.occurredAt() != null) t.setOccurredAt(dto.occurredAt());
        if (dto.category()   != null) t.setCategory(dto.category());
        if (dto.memo()       != null) t.setMemo(dto.memo());
        if (dto.amount()     != null) t.setAmount(dto.amount());
        if (dto.type()       != null) t.setType(Transaction.Type.valueOf(dto.type()));

        // @Transactional + 변경감지로 자동 반영
        return t;
    }

    public void delete(Long id) {
        Long uid = auth.currentUserId();
        Transaction t = repo.findByIdAndOwnerId(id, uid).orElseThrow();
        repo.delete(t);
    }

    public BigDecimal monthBalance(YearMonth ym) {
        Long uid = auth.currentUserId();
        var from = ym.atDay(1).atStartOfDay();
        var to   = ym.atEndOfMonth().atTime(23, 59, 59);
        return repo.balanceBetween(uid, from, to);
    }
}
