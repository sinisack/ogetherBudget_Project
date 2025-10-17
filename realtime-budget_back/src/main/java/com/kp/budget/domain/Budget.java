package com.kp.budget.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(
        name = "budget",
        uniqueConstraints = @UniqueConstraint(columnNames = {"budget_year", "budget_month"})
)
public class Budget {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ★ 예약어 회피
    @Column(name = "budget_year")
    private int year;   // 예: 2025

    @Column(name = "budget_month")
    private int month;  // 1~12

    @Column(precision = 14, scale = 2)
    private BigDecimal amount;

    // getters/setters...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}