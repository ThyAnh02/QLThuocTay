package com.example.QLThuocTay.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.QLThuocTay.Entities.OrderStatus;

public interface OrderStatusRepository extends JpaRepository<OrderStatus, Integer> {
    Optional<OrderStatus> findByStatusName(String statusName);
    Optional<OrderStatus> findByStatusNameIgnoreCase(String statusName);
}