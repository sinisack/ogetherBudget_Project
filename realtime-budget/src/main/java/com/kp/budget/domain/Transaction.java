package com.kp.budget.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
public class Transaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private LocalDateTime occurredAt = LocalDateTime.now();


    private String category; // 예: Food, Rent, Transport
    private String memo; // 메모


    @Column(precision = 14, scale = 2)
    private BigDecimal amount; // 양수 금액


    @Enumerated(EnumType.STRING)
    @Column(name = "tx_type")
    private Type type = Type.EXPENSE; // EXPENSE | INCOME


    public enum Type { EXPENSE, INCOME }


    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getOccurredAt() { return occurredAt; }
    public void setOccurredAt(LocalDateTime occurredAt) { this.occurredAt = occurredAt; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getMemo() { return memo; }
    public void setMemo(String memo) { this.memo = memo; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }
}