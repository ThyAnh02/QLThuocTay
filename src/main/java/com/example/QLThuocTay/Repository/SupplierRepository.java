package com.example.QLThuocTay.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.QLThuocTay.Entities.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    boolean existsByPhoneNumber(String phoneNumber);

}
