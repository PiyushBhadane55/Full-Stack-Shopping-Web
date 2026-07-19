package com.portal.shoppingservice.service;

import com.portal.shoppingservice.dto.CartResponse;
import com.portal.shoppingservice.model.CartItem;
import com.portal.shoppingservice.model.Product;
import com.portal.shoppingservice.repository.CartItemRepository;
import com.portal.shoppingservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public List<CartResponse> getCart(Long userId) {
        return cartItemRepository.findByUserId(userId).stream()
                .map(item -> CartResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .productDescription(item.getProduct().getDescription())
                        .price(item.getProduct().getPrice())
                        .quantity(item.getQuantity())
                        .imageUrl(item.getProduct().getImageUrl())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void addToCart(Long userId, Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (product.getStock() < quantity) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock (" + product.getStock() + ")");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndProductId(userId, productId);
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = quantity; // Override with the requested quantity from UI (or item.getQuantity() + quantity, let's do override/set since frontend cart sends exact updated amount, or increment? Usually adding from product card increments, while updating cart changes explicitly. Let's make it increment if adding from details, or override if specified. Let's do: override if it is a set action, or add. Let's just set the quantity to the value passed to keep it deterministic from frontend).
            if (product.getStock() < newQuantity) {
                throw new IllegalArgumentException("Requested quantity exceeds available stock");
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem item = CartItem.builder()
                    .userId(userId)
                    .product(product)
                    .quantity(quantity)
                    .build();
            cartItemRepository.save(item);
        }
    }

    @Transactional
    public void removeFromCart(Long userId, Long productId) {
        cartItemRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }
}
