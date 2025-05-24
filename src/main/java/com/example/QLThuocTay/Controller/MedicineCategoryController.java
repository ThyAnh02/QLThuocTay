package com.example.QLThuocTay.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.QLThuocTay.Entities.MedicineCategory;
import com.example.QLThuocTay.Repository.MedicineCategoryRepository;

@RestController
@RequestMapping("/categories")
public class MedicineCategoryController {

    @Autowired
    private MedicineCategoryRepository categoryRepository;

    @GetMapping("/all")
    public List<MedicineCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicineCategory> getCategoryById(@PathVariable Long id) {
        Optional<MedicineCategory> category = categoryRepository.findById(id);
        return category.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/add")
    public MedicineCategory createCategory(@RequestBody MedicineCategory category) {
        return categoryRepository.save(category);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<MedicineCategory> updateCategory(@PathVariable Long id, @RequestBody MedicineCategory updatedCategory) {
        return categoryRepository.findById(id)
                .map(category -> {
                    category.setCategoryName(updatedCategory.getCategoryName());
                    return ResponseEntity.ok(categoryRepository.save(category));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}