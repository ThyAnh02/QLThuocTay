package com.example.QLThuocTay.Controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

import com.example.QLThuocTay.Entities.OrderDetail;
import com.example.QLThuocTay.Entities.OrderDetailKey;
import com.example.QLThuocTay.Repository.OrderDetailRepository;
import com.example.QLThuocTay.dto.OrderDetailDTO;

@RestController
@RequestMapping("/orderdetails")
public class OrderDetailController {

    private final OrderDetailRepository orderDetailRepository;

    @Autowired
    public OrderDetailController(OrderDetailRepository orderDetailRepository) {
        this.orderDetailRepository = orderDetailRepository;
    }

    // Chuyển đổi entity sang DTO
    private OrderDetailDTO toDTO(OrderDetail entity) {
        OrderDetailDTO dto = new OrderDetailDTO();
        if (entity.getOrder() != null)
            dto.setOrderId(entity.getOrder().getOrderId());
        if (entity.getMedicine() != null) {
            dto.setMedicineId(entity.getMedicine().getMedicineId());
            dto.setMedicineName(entity.getMedicine().getMedicineName());
        }
        dto.setQuantity(entity.getQuantity());
        dto.setPrice(entity.getPrice());
        return dto;
    }

    // Get all order details
    @GetMapping("/all")
    public ResponseEntity<List<OrderDetailDTO>> getAllOrderDetails() {
        List<OrderDetailDTO> dtos = orderDetailRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get order detail by composite key (orderId and medicineId)
    @GetMapping("/{orderId}/{medicineId}")
    public ResponseEntity<OrderDetailDTO> getOrderDetail(
            @PathVariable Long orderId,
            @PathVariable Long medicineId) {
        OrderDetailKey key = new OrderDetailKey(orderId, medicineId);
        Optional<OrderDetail> orderDetail = orderDetailRepository.findById(key);
        return orderDetail.map(od -> ResponseEntity.ok(toDTO(od)))
                         .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create new order detail
    @PostMapping
    public ResponseEntity<OrderDetailDTO> createOrderDetail(@RequestBody OrderDetail detail) {
        if (detail == null || detail.getOrder() == null || detail.getOrder().getOrderId() == null
                || detail.getMedicine() == null || detail.getMedicine().getMedicineId() == null) {
            return ResponseEntity.badRequest().build();
        }
        detail.setId(new OrderDetailKey(
                detail.getOrder().getOrderId(),
                detail.getMedicine().getMedicineId()
        ));
        OrderDetail saved = orderDetailRepository.save(detail);
        return ResponseEntity.ok(toDTO(saved));
    }

    // Update order detail
    @PutMapping("/{orderId}/{medicineId}")
    public ResponseEntity<OrderDetailDTO> updateOrderDetail(
            @PathVariable Long orderId,
            @PathVariable Long medicineId,
            @RequestBody OrderDetail detailInput) {
        OrderDetailKey key = new OrderDetailKey(orderId, medicineId);
        Optional<OrderDetail> optionalOrderDetail = orderDetailRepository.findById(key);

        if (optionalOrderDetail.isPresent()) {
            OrderDetail orderDetail = optionalOrderDetail.get();
            orderDetail.setQuantity(detailInput.getQuantity());
            orderDetail.setPrice(detailInput.getPrice());
            OrderDetail updated = orderDetailRepository.save(orderDetail);
            return ResponseEntity.ok(toDTO(updated));
        }
        return ResponseEntity.notFound().build();
    }

    // Delete order detail
    @DeleteMapping("/{orderId}/{medicineId}")
    public ResponseEntity<Void> deleteOrderDetail(
            @PathVariable Long orderId,
            @PathVariable Long medicineId) {
        OrderDetailKey key = new OrderDetailKey(orderId, medicineId);
        if (orderDetailRepository.existsById(key)) {
            orderDetailRepository.deleteById(key);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Get order details by order ID
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderDetailDTO>> getOrderDetailsByOrder(@PathVariable Long orderId) {
        List<OrderDetailDTO> dtos = orderDetailRepository.findByOrderOrderId(orderId)
                .stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get order details by medicine ID
    @GetMapping("/medicine/{medicineId}")
    public ResponseEntity<List<OrderDetailDTO>> getOrderDetailsByMedicine(@PathVariable Long medicineId) {
        List<OrderDetailDTO> dtos = orderDetailRepository.findByMedicineMedicineId(medicineId)
                .stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}