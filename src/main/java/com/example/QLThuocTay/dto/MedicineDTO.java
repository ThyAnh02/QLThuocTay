package com.example.QLThuocTay.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.QLThuocTay.Entities.Medicine;

public class MedicineDTO {
    private Long id;
    private String name;
    private String categoryName;
    private String dosage;
    private BigDecimal price; // Sửa từ Double sang BigDecimal
    private Integer stockQuantity;
    private LocalDate expiryDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String imageUrl;
    private String description;
    private String ingredient;
    private Long supplierId; // Sửa từ Integer sang Long cho đồng bộ entity
    private String supplierName;

    public MedicineDTO(Long id, String name, String categoryName, String dosage, BigDecimal price,
                       Integer stockQuantity, LocalDate expiryDate, LocalDateTime createdAt,
                       LocalDateTime updatedAt, String imageUrl, String description, String ingredient,
                       Long supplierId, String supplierName) {
        this.id = id;
        this.name = name;
        this.categoryName = categoryName;
        this.dosage = dosage;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.expiryDate = expiryDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.imageUrl = imageUrl;
        this.description = description;
        this.ingredient = ingredient;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
    }

    public MedicineDTO(Medicine medicine) {
        this.id = medicine.getMedicineId();
        this.name = medicine.getMedicineName();
        this.categoryName = medicine.getCategory() != null ? medicine.getCategory().getCategoryName() : null;
        this.dosage = medicine.getDosage();
        this.price = medicine.getPrice(); // BigDecimal
        this.stockQuantity = medicine.getStockQuantity();
        this.expiryDate = medicine.getExpiryDate();
        this.createdAt = medicine.getCreatedAt();
        this.updatedAt = medicine.getUpdatedAt();
        this.imageUrl = medicine.getImageUrl();
        this.description = medicine.getDescription();
        this.ingredient = medicine.getIngredient();
        this.supplierId = medicine.getSupplier() != null ? medicine.getSupplier().getSupplierId() : null; // Long
        this.supplierName = medicine.getSupplier() != null ? medicine.getSupplier().getSupplierName() : null;
    }

    // Getters và setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIngredient() { return ingredient; }
    public void setIngredient(String ingredient) { this.ingredient = ingredient; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
}