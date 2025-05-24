package com.example.QLThuocTay.Entities;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class OrderDetailKey implements Serializable {
    private Long orderId;
    private Long medicineId;

    public OrderDetailKey() {}

    public OrderDetailKey(Long orderId, Long medicineId) {
        this.orderId = orderId;
        this.medicineId = medicineId;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getMedicineId() { return medicineId; }
    public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrderDetailKey)) return false;
        OrderDetailKey that = (OrderDetailKey) o;
        return Objects.equals(orderId, that.orderId) &&
               Objects.equals(medicineId, that.medicineId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderId, medicineId);
    }
}