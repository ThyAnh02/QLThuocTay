package com.example.QLThuocTay.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.QLThuocTay.Entities.MedicineCategory;

@Repository
public interface MedicineCategoryRepository extends JpaRepository<MedicineCategory, Long> {
    boolean existsByCategoryName(String categoryName);

}
