package com.example.QLThuocTay.Controller;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.QLThuocTay.Entities.Medicine;
import com.example.QLThuocTay.Entities.MedicineCategory;
import com.example.QLThuocTay.Entities.Supplier;
import com.example.QLThuocTay.Repository.MedicineCategoryRepository;
import com.example.QLThuocTay.Repository.MedicineRepository;
import com.example.QLThuocTay.Repository.SupplierRepository;
import com.example.QLThuocTay.dto.MedicineDTO;

@RestController
@RequestMapping("/medicines")
public class MedicineController {

    @Autowired
    private MedicineRepository repository;

    @Autowired
    private MedicineCategoryRepository categoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(MedicineController.class);

    @GetMapping("/all")
    public ResponseEntity<?> getAllMedicines() {
        try {
            List<MedicineDTO> list = repository.findAllMedicineDTO();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách thuốc", e);
            return ResponseEntity.status(500).body("Lỗi server: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMedicineById(@PathVariable Long id) {
        try {
            Optional<Medicine> medicineOpt = repository.findById(id);
            if (medicineOpt.isPresent()) {
                MedicineDTO dto = new MedicineDTO(medicineOpt.get());
                return ResponseEntity.ok(dto);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thuốc theo id", e);
            return ResponseEntity.status(500).body("Lỗi server: " + e.getMessage());
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> createMedicine(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam("dosage") String dosage,
            @RequestParam("quantity") Integer quantity,
            @RequestParam("expiryDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate,
            @RequestParam("ingredient") String ingredient,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("supplierId") Long supplierId,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        try {
            String imageUrl = null;
            if (image != null && !image.isEmpty()) {
                String uploadDir = "C:/QLThuocTay/web/images/medicines/";
                File dir = new File(uploadDir);
                if (!dir.exists()) {
                    boolean created = dir.mkdirs();
                    if (!created) {
                        return ResponseEntity.status(500).body("Không thể tạo thư mục lưu ảnh.");
                    }
                }
                String originalFilename = image.getOriginalFilename();
                if (originalFilename == null || originalFilename.isEmpty()) {
                    return ResponseEntity.status(400).body("Tên file ảnh không hợp lệ.");
                }
                String fileName = System.currentTimeMillis() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
                java.nio.file.Path path = java.nio.file.Paths.get(uploadDir + fileName);
                try {
                    image.transferTo(path);
                } catch (IOException e) {
                    logger.error("Lỗi khi lưu file ảnh", e);
                    return ResponseEntity.status(500).body("Lỗi khi lưu file ảnh: " + e.getMessage());
                }
                imageUrl = fileName;
            }

            Optional<MedicineCategory> categoryOpt = categoryRepository.findById(categoryId);
            if (categoryOpt.isEmpty()) {
                logger.error("Không tìm thấy loại thuốc với id: " + categoryId);
                return ResponseEntity.status(400).body("Không tìm thấy loại thuốc với id: " + categoryId);
            }
            MedicineCategory category = categoryOpt.get();

            Optional<Supplier> supplierOpt = supplierRepository.findById(supplierId);
            if (supplierOpt.isEmpty()) {
                return ResponseEntity.status(400).body("Không tìm thấy nhà cung cấp với id: " + supplierId);
            }
            Supplier supplier = supplierOpt.get();

            Medicine medicine = new Medicine();
            medicine.setMedicineName(name);
            medicine.setDescription(description);
            medicine.setPrice(price);
            medicine.setDosage(dosage);
            medicine.setStockQuantity(quantity);
            medicine.setExpiryDate(expiryDate);
            medicine.setIngredient(ingredient);
            medicine.setCategory(category);
            medicine.setSupplier(supplier);
            medicine.setImageUrl(imageUrl);

            Medicine savedMedicine = repository.save(medicine);
            return ResponseEntity.ok(savedMedicine);
        } catch (IllegalStateException e) {
            logger.error("Lỗi khi thêm thuốc", e);
            return ResponseEntity.status(500).body("Lỗi khi thêm thuốc: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi không xác định khi thêm thuốc", e);
            return ResponseEntity.status(500).body("Lỗi không xác định: " + e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Medicine> updateMedicine(@PathVariable Long id, @RequestBody Medicine medicineDetails) {
        if (medicineDetails == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<Medicine> medicineOpt = repository.findById(id);
        if (medicineOpt.isPresent()) {
            Medicine medicine = medicineOpt.get();
            medicine.setMedicineName(medicineDetails.getMedicineName());
            medicine.setCategory(medicineDetails.getCategory());
            medicine.setSupplier(medicineDetails.getSupplier());
            medicine.setDosage(medicineDetails.getDosage());
            medicine.setPrice(medicineDetails.getPrice());
            medicine.setStockQuantity(medicineDetails.getStockQuantity());
            medicine.setExpiryDate(medicineDetails.getExpiryDate());
            medicine.setImageUrl(medicineDetails.getImageUrl());
            medicine.setUpdatedAt(medicineDetails.getUpdatedAt());
            medicine.setDescription(medicineDetails.getDescription());
            medicine.setIngredient(medicineDetails.getIngredient());

            Medicine updatedMedicine = repository.save(medicine);
            return ResponseEntity.ok(updatedMedicine);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/update-with-image/{id}")
    public ResponseEntity<?> updateMedicineWithImage(
        @PathVariable Long id,
        @RequestParam("name") String name,
        @RequestParam("description") String description,
        @RequestParam("price") BigDecimal price,
        @RequestParam("dosage") String dosage,
        @RequestParam("quantity") Integer quantity,
        @RequestParam("expiryDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate,
        @RequestParam("ingredient") String ingredient,
        @RequestParam("categoryId") Long categoryId,
        @RequestParam("supplierId") Long supplierId,
        @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        try {
            Optional<Medicine> medicineOpt = repository.findById(id);
            if (medicineOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Không tìm thấy thuốc với id: " + id);
            }
            Medicine medicine = medicineOpt.get();

            String imageUrl = medicine.getImageUrl();
            if (image != null && !image.isEmpty()) {
                String uploadDir = "C:/QLThuocTay/web/images/medicines/";
                File dir = new File(uploadDir);
                if (!dir.exists()) {
                    boolean created = dir.mkdirs();
                    if (!created) {
                        return ResponseEntity.status(500).body("Không thể tạo thư mục lưu ảnh.");
                    }
                }
                String originalFilename = image.getOriginalFilename();
                if (originalFilename == null || originalFilename.isEmpty()) {
                    return ResponseEntity.status(400).body("Tên file ảnh không hợp lệ.");
                }
                String fileName = System.currentTimeMillis() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
                java.nio.file.Path path = java.nio.file.Paths.get(uploadDir + fileName);
                try {
                    image.transferTo(path);
                } catch (IOException e) {
                    logger.error("Lỗi khi lưu file ảnh", e);
                    return ResponseEntity.status(500).body("Lỗi khi lưu file ảnh: " + e.getMessage());
                }
                imageUrl = fileName;
            }

            Optional<MedicineCategory> categoryOpt = categoryRepository.findById(categoryId);
            if (categoryOpt.isEmpty()) {
                logger.error("Không tìm thấy loại thuốc với id: " + categoryId);
                return ResponseEntity.status(400).body("Không tìm thấy loại thuốc với id: " + categoryId);
            }
            MedicineCategory category = categoryOpt.get();

            Optional<Supplier> supplierOpt = supplierRepository.findById(supplierId);
            if (supplierOpt.isEmpty()) {
                return ResponseEntity.status(400).body("Không tìm thấy nhà cung cấp với id: " + supplierId);
            }
            Supplier supplier = supplierOpt.get();

            medicine.setMedicineName(name);
            medicine.setDescription(description);
            medicine.setPrice(price);
            medicine.setDosage(dosage);
            medicine.setStockQuantity(quantity);
            medicine.setExpiryDate(expiryDate);
            medicine.setIngredient(ingredient);
            medicine.setCategory(category);
            medicine.setSupplier(supplier);
            medicine.setImageUrl(imageUrl);

            Medicine updatedMedicine = repository.save(medicine);
            return ResponseEntity.ok(updatedMedicine);
        } catch (IllegalStateException e) {
            logger.error("Lỗi khi cập nhật thuốc", e);
            return ResponseEntity.status(500).body("Lỗi khi cập nhật thuốc: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi không xác định khi cập nhật thuốc", e);
            return ResponseEntity.status(500).body("Lỗi không xác định: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        Optional<Medicine> medicineOpt = repository.findById(id);
        if (medicineOpt.isPresent()) {
            Medicine medicine = medicineOpt.get();
            if (medicine.getImageUrl() != null) {
                try {
                    String fileName = medicine.getImageUrl();
                    java.nio.file.Path imagePath = java.nio.file.Paths.get("C:/QLThuocTay/web/images/medicines/", fileName);
                    java.nio.file.Files.deleteIfExists(imagePath);
                } catch (IOException e) {
                    logger.error("Lỗi khi xóa file ảnh", e);
                }
            }
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}