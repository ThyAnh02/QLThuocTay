package com.example.QLThuocTay.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.QLThuocTay.Entities.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByPhoneNumber(String phoneNumber);
}
