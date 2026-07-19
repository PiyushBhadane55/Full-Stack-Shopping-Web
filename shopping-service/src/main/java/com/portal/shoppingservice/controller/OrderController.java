package com.portal.shoppingservice.controller;

import com.portal.shoppingservice.dto.OrderResponse;
import com.portal.shoppingservice.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<?> checkout(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            OrderResponse response = orderService.checkout(userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrderHistory(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(orderService.getOrderHistory(userId));
    }
}
