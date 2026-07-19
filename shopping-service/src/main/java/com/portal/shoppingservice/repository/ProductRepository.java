package com.portal.shoppingservice.repository;

import com.portal.shoppingservice.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
