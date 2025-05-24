package com.example.QLThuocTay.dto;

import java.util.List;

public class OrderDTO {
    // ĐÃ BỎ customerId HOÀN TOÀN, chỉ giữ userId!
    private Long userId;
    private Integer statusId;
    private double totalAmount;
    private String shippingAddress;
    private List<OrderItemDTO> items;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getStatusId() { return statusId; }
    public void setStatusId(Integer statusId) { this.statusId = statusId; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public List<OrderItemDTO> getItems() { return items; }
    public void setItems(List<OrderItemDTO> items) { this.items = items; }
}