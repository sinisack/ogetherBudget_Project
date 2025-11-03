package com.kp.budget.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
@Entity
@Table(name = "budget",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id","budget_year","budget_month"}))
public class Budget {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User owner;

    @Column(name = "budget_year")
    private int year;

    @Column(name = "budget_month")
    private int month;

    @Column(precision = 14, scale = 2)
    private BigDecimal amount;
}
