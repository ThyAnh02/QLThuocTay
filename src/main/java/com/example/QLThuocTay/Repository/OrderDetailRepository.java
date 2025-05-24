package com.example.QLThuocTay.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.QLThuocTay.Entities.OrderDetail;
import com.example.QLThuocTay.Entities.OrderDetailKey;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, OrderDetailKey> {

    List<OrderDetail> findByOrderOrderId(Integer orderId);

    List<OrderDetail> findByMedicineMedicineId(Integer medicineId);

    public List<OrderDetail> findByOrderOrderId(Long orderId);

    public List<OrderDetail> findByMedicineMedicineId(Long medicineId);
}