package com.example.QLThuocTay.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.QLThuocTay.Entities.Order;
import com.example.QLThuocTay.Entities.User;


@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @Override
    Optional<Order> findById(Long orderId);
        List<Order> findByUser(User user);

}