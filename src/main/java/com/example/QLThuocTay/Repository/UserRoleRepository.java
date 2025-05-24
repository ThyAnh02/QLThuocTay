package com.example.QLThuocTay.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.QLThuocTay.Entities.UserRole;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
UserRole findByRoleNameIgnoreCase(String roleName);
}
