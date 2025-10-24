package com.kp.budget.repo;

import com.kp.budget.domain.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;


public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query("select coalesce(sum(case when t.type='INCOME' then t.amount else -t.amount end),0)\n from Transaction t\n where t.occurredAt between :start and :end")
    BigDecimal balanceBetween(@Param("start") LocalDateTime start,
                              @Param("end") LocalDateTime end);
}