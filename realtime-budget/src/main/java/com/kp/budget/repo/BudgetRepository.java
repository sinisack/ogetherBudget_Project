package com.kp.budget.repo;


import com.kp.budget.domain.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByOwnerIdAndYearAndMonth(Long ownerId, int year, int month);
}
