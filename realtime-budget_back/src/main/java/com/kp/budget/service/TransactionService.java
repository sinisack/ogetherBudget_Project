package com.kp.budget.service;

import com.kp.budget.domain.Transaction;
import com.kp.budget.dto.TransactionDto;
import com.kp.budget.repo.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;


@Service
@Transactional
public class TransactionService {
    private final TransactionRepository repo;


    public TransactionService(TransactionRepository repo) { this.repo = repo; }


    public List<Transaction> findAll() { return repo.findAll(); }


    public Transaction create(Transaction t) { return repo.save(t); }


    public Transaction update(Long id, TransactionDto dto) {
        Transaction t = repo.findById(id).orElseThrow();
        if (dto.occurredAt()!=null) t.setOccurredAt(dto.occurredAt());
        if (dto.category()!=null) t.setCategory(dto.category());
        if (dto.memo()!=null) t.setMemo(dto.memo());
        if (dto.amount()!=null) t.setAmount(dto.amount());
        if (dto.type()!=null) t.setType(Transaction.Type.valueOf(dto.type()));
        return t;
    }


    public void delete(Long id) { repo.deleteById(id); }


    public BigDecimal monthBalance(YearMonth ym) {
        LocalDate from = ym.atDay(1);
        LocalDate to = ym.atEndOfMonth();
        return repo.balanceBetween(from.atStartOfDay(), to.atTime(23,59,59));
    }
}