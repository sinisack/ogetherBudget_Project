package com.kp.budget.repo;

import com.kp.budget.domain.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findAllByOwnerId(Long ownerId);
    Optional<Transaction> findByIdAndOwnerId(Long id, Long ownerId);

    @Query("""
      select coalesce(sum(case when t.type='INCOME' then t.amount else -t.amount end), 0)
      from Transaction t
      where t.owner.id = :ownerId and t.occurredAt between :start and :end
    """)
    BigDecimal balanceBetween(@Param("ownerId") Long ownerId,
                              @Param("start") LocalDateTime start,
                              @Param("end") LocalDateTime end);
}