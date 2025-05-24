package com.example.QLThuocTay.Entities;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "orderdetail")
public class OrderDetail {

    @EmbeddedId
    private OrderDetailKey id;

    @ManyToOne
@MapsId("orderId")
@JoinColumn(name = "order_id", foreignKey = @ForeignKey(name = "orderdetail_order_id_fkey"))
@JsonBackReference
private Order order;

    @ManyToOne
    @MapsId("medicineId")
    @JoinColumn(name = "medicine_id", foreignKey = @ForeignKey(name = "orderdetail_medicine_id_fkey"))
    private Medicine medicine;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    public OrderDetail() {}

    // Getters and setters
    public OrderDetailKey getId() {
        return id;
    }

    public void setId(OrderDetailKey id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public Medicine getMedicine() {
        return medicine;
    }

    public void setMedicine(Medicine medicine) {
        this.medicine = medicine;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}