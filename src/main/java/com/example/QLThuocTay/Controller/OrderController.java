package com.example.QLThuocTay.Controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.QLThuocTay.Entities.Medicine;
import com.example.QLThuocTay.Entities.Order;
import com.example.QLThuocTay.Entities.OrderDetail;
import com.example.QLThuocTay.Entities.OrderDetailKey;
import com.example.QLThuocTay.Entities.OrderStatus;
import com.example.QLThuocTay.Entities.User;
import com.example.QLThuocTay.Repository.MedicineRepository;
import com.example.QLThuocTay.Repository.OrderRepository;
import com.example.QLThuocTay.Repository.OrderStatusRepository;
import com.example.QLThuocTay.Repository.UserRepository;
import com.example.QLThuocTay.dto.OrderDTO;
import com.example.QLThuocTay.dto.OrderDetailDTO;
import com.example.QLThuocTay.dto.OrderItemDTO;
import com.example.QLThuocTay.dto.OrderResponseDTO;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderStatusRepository orderStatusRepository;
    private final MedicineRepository medicineRepository;

    @Autowired
    public OrderController(
            OrderRepository orderRepository,
            UserRepository userRepository,
            OrderStatusRepository orderStatusRepository,
            MedicineRepository medicineRepository
    ) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.orderStatusRepository = orderStatusRepository;
        this.medicineRepository = medicineRepository;
    }

    // Convert Order entity to DTO
    private OrderResponseDTO convertToDTO(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setOrderId(order.getOrderId());
        if (order.getUser() != null) {
            dto.setUserId(order.getUser().getUserId());
            dto.setUserName(order.getUser().getFullName());
        }
        dto.setTotalAmount(order.getTotalAmount());
        dto.setCreateAt(order.getCreateAt());
        if (order.getStatus() != null) {
            dto.setStatusId(order.getStatus().getStatusId());
            dto.setStatusName(order.getStatus().getStatusName());
        }
        dto.setShippingAddress(order.getShippingAddress());

        List<OrderDetailDTO> detailDTOs = new ArrayList<>();
        for (OrderDetail detail : order.getOrderDetails()) {
            OrderDetailDTO detailDTO = new OrderDetailDTO();
            detailDTO.setMedicineId(detail.getMedicine().getMedicineId());
            detailDTO.setMedicineName(detail.getMedicine().getMedicineName());
            detailDTO.setQuantity(detail.getQuantity());
            detailDTO.setPrice(detail.getPrice());
            detailDTOs.add(detailDTO);
        }
        dto.setOrderDetails(detailDTOs);
        return dto;
    }

    @GetMapping("/all")
    public List<OrderResponseDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        List<OrderResponseDTO> dtoList = new ArrayList<>();
        for (Order order : orders) {
            dtoList.add(convertToDTO(order));
        }
        return dtoList;
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable Long orderId) {
        return orderRepository.findById(orderId)
                .map(order -> ResponseEntity.ok(convertToDTO(order)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/add")
    public ResponseEntity<?> createOrder(@RequestBody OrderDTO orderDTO) {
        try {
            // 1. Check user (required)
            User user = null;
            if (orderDTO.getUserId() != null) {
                Optional<User> userOpt = userRepository.findById(orderDTO.getUserId());
                if (userOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body("Invalid user id");
                }
                user = userOpt.get();
            } else {
                return ResponseEntity.badRequest().body("User id is required.");
            }

            // 2. Get status (default 1 if not provided)
            Integer statusId = orderDTO.getStatusId() != null ? orderDTO.getStatusId() : 1;
            OrderStatus status = orderStatusRepository.findById(statusId)
                    .orElseThrow(() -> new RuntimeException("Invalid status id"));

            // 3. Create order (no OrderDetail yet)
            Order order = new Order();
            order.setUser(user);
            order.setStatus(status);
            order.setCreateAt(LocalDateTime.now());
            order.setShippingAddress(orderDTO.getShippingAddress());
            order.setTotalAmount(BigDecimal.ZERO); // to be calculated

            // 4. Save order to get orderId
            Order savedOrder = orderRepository.save(order);

            // 5. Create list of orderDetails with orderId
            List<OrderDetail> orderDetails = new ArrayList<>();
            BigDecimal totalAmount = BigDecimal.ZERO;

            for (OrderItemDTO itemDTO : orderDTO.getItems()) {
                Optional<Medicine> medicineOpt = medicineRepository.findById(itemDTO.getMedicineId());
                if (medicineOpt.isEmpty()) continue;
                Medicine medicine = medicineOpt.get();

                OrderDetail detail = new OrderDetail();
                detail.setOrder(savedOrder);
                detail.setMedicine(medicine);
                detail.setQuantity(itemDTO.getQuantity());
                detail.setPrice(medicine.getPrice());

                BigDecimal subTotal = medicine.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity()));
                totalAmount = totalAmount.add(subTotal);

                detail.setId(new OrderDetailKey(savedOrder.getOrderId(), medicine.getMedicineId()));
                orderDetails.add(detail);
            }

            // 6. Set orderDetails and total, then save order again
            savedOrder.setOrderDetails(orderDetails);
            savedOrder.setTotalAmount(totalAmount);
            Order finalOrder = orderRepository.save(savedOrder);

            return ResponseEntity.ok(convertToDTO(finalOrder));

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi tạo đơn hàng: " + e.getMessage());
        }
    }

    @PutMapping("/update/{orderId}")
    public ResponseEntity<?> updateOrder(@PathVariable Long orderId, @RequestBody OrderDTO orderDTO) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Order order = orderOpt.get();

            User user = null;
            if (orderDTO.getUserId() != null) {
                Optional<User> userOpt = userRepository.findById(orderDTO.getUserId());
                if (userOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body("Invalid user id");
                }
                user = userOpt.get();
            }

            Optional<OrderStatus> statusOpt = orderStatusRepository.findById(orderDTO.getStatusId());
            if (statusOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid status id");
            }
            OrderStatus status = statusOpt.get();

            order.setUser(user);
            order.setStatus(status);
            order.setShippingAddress(orderDTO.getShippingAddress());

            // Clear old details
            order.getOrderDetails().clear();

            BigDecimal totalAmount = BigDecimal.ZERO;
            List<OrderDetail> updatedDetails = new ArrayList<>();

            for (OrderItemDTO itemDTO : orderDTO.getItems()) {
                Optional<Medicine> medicineOpt = medicineRepository.findById(itemDTO.getMedicineId());
                if (medicineOpt.isEmpty()) continue;
                Medicine medicine = medicineOpt.get();

                OrderDetail detail = new OrderDetail();
                detail.setOrder(order);
                detail.setMedicine(medicine);
                detail.setQuantity(itemDTO.getQuantity());
                detail.setPrice(medicine.getPrice());

                BigDecimal subTotal = medicine.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity()));
                totalAmount = totalAmount.add(subTotal);

                detail.setId(new OrderDetailKey(order.getOrderId(), medicine.getMedicineId()));
                updatedDetails.add(detail);
            }

            order.setTotalAmount(totalAmount);
            order.setOrderDetails(updatedDetails);

            Order updatedOrder = orderRepository.save(order);
            return ResponseEntity.ok(convertToDTO(updatedOrder));

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi cập nhật đơn hàng: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        if (orderRepository.existsById(orderId)) {
            orderRepository.deleteById(orderId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByUserEmail(@PathVariable String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(List.of()); // Không trả lỗi, trả mảng rỗng cho FE
        }
        User user = userOpt.get();
        List<Order> orders = orderRepository.findByUser(user);
        List<OrderResponseDTO> dtoList = new ArrayList<>();
        for (Order order : orders) {
            dtoList.add(convertToDTO(order));
        }
        return ResponseEntity.ok(dtoList);
    }

    // Xác nhận đơn hàng (Pending -> Processing)
    @PutMapping("/confirm/{orderId}")
    public ResponseEntity<?> confirmOrder(@PathVariable Long orderId) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Không tìm thấy đơn hàng.");
            }
            Order order = orderOpt.get();
            // Chỉ cho phép xác nhận nếu đơn đang Pending
            if (order.getStatus() == null || !"Pending".equalsIgnoreCase(order.getStatus().getStatusName())) {
                return ResponseEntity.badRequest().body("Chỉ đơn hàng ở trạng thái 'Chờ xác nhận' mới được xác nhận.");
            }
            // Tìm status Processing
            Optional<OrderStatus> processingStatusOpt = orderStatusRepository.findByStatusNameIgnoreCase("Processing");
            if (processingStatusOpt.isEmpty()) {
                return ResponseEntity.status(500).body("Không tìm thấy trạng thái 'Processing'.");
            }
            order.setStatus(processingStatusOpt.get());
            orderRepository.save(order);
            return ResponseEntity.ok(convertToDTO(order));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi xác nhận đơn hàng: " + e.getMessage());
        }
    }

    // Chuyển sang hoàn thành (Processing -> Completed)
    @PutMapping("/complete/{orderId}")
    public ResponseEntity<?> completeOrder(@PathVariable Long orderId) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Không tìm thấy đơn hàng.");
            }
            Order order = orderOpt.get();
            // Chỉ cho phép hoàn thành nếu đơn đang Processing
            if (order.getStatus() == null || !"Processing".equalsIgnoreCase(order.getStatus().getStatusName())) {
                return ResponseEntity.badRequest().body("Chỉ đơn hàng ở trạng thái 'Đang vận chuyển' mới chuyển thành 'Thành công'.");
            }
            // Tìm status Completed
            Optional<OrderStatus> completedStatusOpt = orderStatusRepository.findByStatusNameIgnoreCase("Completed");
            if (completedStatusOpt.isEmpty()) {
                return ResponseEntity.status(500).body("Không tìm thấy trạng thái 'Completed'.");
            }
            order.setStatus(completedStatusOpt.get());
            orderRepository.save(order);
            return ResponseEntity.ok(convertToDTO(order));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi cập nhật trạng thái đơn hàng: " + e.getMessage());
        }
    }

    // Huỷ đơn hàng (Pending, Processing)
    @PutMapping("/cancel/{orderId}")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Không tìm thấy đơn hàng.");
            }
            Order order = orderOpt.get();
            // Chỉ cho phép huỷ nếu đơn đang Pending hoặc Processing
            if (order.getStatus() == null ||
                    (!"Pending".equalsIgnoreCase(order.getStatus().getStatusName())
                            && !"Processing".equalsIgnoreCase(order.getStatus().getStatusName()))) {
                return ResponseEntity.badRequest().body("Chỉ đơn ở trạng thái 'Chờ xác nhận' hoặc 'Đang vận chuyển' mới được huỷ.");
            }
            // Tìm status Cancelled
            Optional<OrderStatus> cancelledStatusOpt = orderStatusRepository.findByStatusNameIgnoreCase("Cancelled");
            if (cancelledStatusOpt.isEmpty()) {
                return ResponseEntity.status(500).body("Không tìm thấy trạng thái 'Cancelled'.");
            }
            order.setStatus(cancelledStatusOpt.get());
            orderRepository.save(order);
            return ResponseEntity.ok(convertToDTO(order));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi huỷ đơn hàng: " + e.getMessage());
        }
    }
}