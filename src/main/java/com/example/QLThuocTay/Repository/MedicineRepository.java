package com.example.QLThuocTay.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.QLThuocTay.Entities.Medicine;
import com.example.QLThuocTay.dto.MedicineDTO;

public interface MedicineRepository extends JpaRepository<Medicine, Long> { // <-- Sửa Integer thành Long

    @Query("SELECT new com.example.QLThuocTay.dto.MedicineDTO(" +
       "m.medicineId, m.medicineName, m.category.categoryName, m.dosage, m.price, " +
       "m.stockQuantity, m.expiryDate, m.createdAt, m.updatedAt, m.imageUrl, " +
       "m.description, m.ingredient, m.supplier.supplierId, m.supplier.supplierName) " +
       "FROM Medicine m")
    List<MedicineDTO> findAllMedicineDTO();

}