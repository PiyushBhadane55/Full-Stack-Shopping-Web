CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    image_url VARCHAR(255)
);

CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Insert dummy products
INSERT INTO products (name, description, price, stock, image_url) VALUES
('Titan Gaming Laptop', 'Core i9 13th Gen, 32GB RAM, 1TB SSD, RTX 4080 GPU, 144Hz IPS display.', 1499.99, 15, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=400&auto=format&fit=crop'),
('Pixel Pro 8 Smartphone', 'Tensor G3 chip, 120Hz OLED screen, 50MP triple camera system, 12GB RAM.', 899.50, 25, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=400&auto=format&fit=crop'),
('Zenith ANC Headphones', 'Active noise cancelling headphones with 40-hour battery life and high fidelity audio.', 249.99, 40, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop'),
('Chrono Smartwatch', 'AMOLED dial, heart rate monitoring, built-in GPS, water-resistant up to 50m.', 199.95, 30, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'),
('Hyperion Mechanical Keyboard', 'RGB backlit, hot-swappable linear yellow switches, tactile keycaps.', 129.99, 20, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=400&auto=format&fit=crop'),
('Aero Wireless Mouse', 'Ergonomic design, ultra-lightweight 58g, 26k DPI optical sensor.', 79.99, 50, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=400&auto=format&fit=crop');
