package com.example.QLThuocTay.dto;

public class OrderItemDTO {
    private Long medicineId;
    private Integer quantity;

    public Long getMedicineId() { return medicineId; }
    public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}