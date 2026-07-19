package com.portal.shoppingservice.controller;

import com.portal.shoppingservice.dto.CartRequest;
import com.portal.shoppingservice.dto.CartResponse;
import com.portal.shoppingservice.service.CartService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartResponse>> getCart(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody CartRequest cartRequest, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        try {
            cartService.addToCart(userId, cartRequest.getProductId(), cartRequest.getQuantity());
            return ResponseEntity.ok("Item added/updated successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long productId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        cartService.removeFromCart(userId, productId);
        return ResponseEntity.ok("Item removed from cart");
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        cartService.clearCart(userId);
        return ResponseEntity.ok("Cart cleared");
    }
}
