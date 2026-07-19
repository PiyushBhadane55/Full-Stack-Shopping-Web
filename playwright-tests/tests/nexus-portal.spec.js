const { test, expect } = require('@playwright/test');

// Share variables between tests to run a sequential E2E user lifecycle
let dynamicUsername;
const dynamicPassword = 'playwright123';
const dynamicEmail = `pw_user_${Date.now()}@test.com`;
const dynamicFullName = 'Playwright Test User';

test.describe.configure({ mode: 'serial' });

test.describe('Nexus Portal E2E Integration Suite', () => {

  test('Flow 1: User Registration and Login', async ({ page }) => {
    dynamicUsername = `pw_user_${Date.now()}`;
    
    await page.goto('/');

    // 1. Click Register on Navbar
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    // 2. Fill Register Form
    await page.getByPlaceholder('John Doe').fill(dynamicFullName);
    await page.getByPlaceholder('john@example.com').fill(dynamicEmail);
    await page.getByPlaceholder('johndoe').fill(dynamicUsername);
    await page.getByPlaceholder('••••••••').fill(dynamicPassword);

    // 3. Submit Register
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // 4. Verify Redirect to Login Screen
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible({ timeout: 5000 });

    // 5. Fill Login Form
    await page.getByPlaceholder('Enter username').fill(dynamicUsername);
    await page.getByPlaceholder('Enter password').fill(dynamicPassword);

    // 6. Submit Login
    await page.getByRole('button', { name: 'Sign In' }).click();

    // 7. Verify Dashboard loaded with correct username and USER role badge
    await expect(page.getByText(dynamicUsername)).toBeVisible();
    await expect(page.locator('.badge-user')).toContainText('USER');
  });

  test('Flow 2: Catalog Browsing, Cart Updates, and Checkout', async ({ page }) => {
    // 1. Login with dynamic user
    await page.goto('/');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await page.getByPlaceholder('Enter username').fill(dynamicUsername);
    await page.getByPlaceholder('Enter password').fill(dynamicPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // 2. Add Titan Gaming Laptop to Cart
    const productCard = page.locator('.glass-card', { hasText: 'Titan Gaming Laptop' });
    await expect(productCard).toBeVisible();
    await productCard.getByRole('button', { name: 'Add to Cart' }).click();

    // 3. Verify Cart Count updates to 1
    const cartButton = page.getByRole('button', { name: /^Cart/ });
    await expect(cartButton).toContainText('1');

    // 4. Navigate to Cart Page
    await cartButton.click();
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();

    // 5. Increase Quantity by clicking Plus button
    await page.locator('button:has(svg[class*="lucide-plus"])').click();
    
    // Verify quantity and subtotal
    await expect(page.locator('span', { hasText: '2' }).first()).toBeVisible();
    await expect(page.locator('span', { hasText: '$2999.98' }).first()).toBeVisible();

    // 6. Checkout
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Order placed successfully');
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'Checkout Now' }).click();

    // 7. Verify redirect to Order History and PENDING status
    await expect(page.getByRole('heading', { name: 'Order History' })).toBeVisible();
    await expect(page.locator('.badge-success').first()).toContainText('PENDING');
  });

  test('Flow 3: Admin Catalog Additions and RBAC Promotion', async ({ page }) => {
    // 1. Log in as System Admin
    await page.goto('/');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await page.getByPlaceholder('Enter username').fill('admin');
    await page.getByPlaceholder('Enter password').fill('admin123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify Admin buttons are visible
    await expect(page.getByRole('button', { name: 'Admin Panel' })).toBeVisible();
    const userDirBtn = page.getByRole('button', { name: 'User Directory' });
    await expect(userDirBtn).toBeVisible();

    // 2. Add a new product via Admin Panel
    await page.getByRole('button', { name: 'Admin Panel' }).click();
    await page.getByPlaceholder('Product title').fill('Playwright Test Console');
    await page.getByPlaceholder('Enter detailed description...').fill('Automated test gaming hardware device.');
    await page.getByPlaceholder('0.00').fill('399.99');
    await page.getByPlaceholder('0', { exact: true }).fill('10');
    await page.getByRole('button', { name: 'Add Product' }).click();

    // Verify product addition success alert
    await expect(page.locator('text=Product added successfully!')).toBeVisible();

    // 3. Promote our dynamic test user in User Directory (RBAC)
    await userDirBtn.click();
    await expect(page.getByRole('heading', { name: 'User Directory' })).toBeVisible();

    // Search for dynamic user
    await page.getByPlaceholder('Search name, username, or email...').fill(dynamicUsername);
    const userRow = page.locator('tr', { hasText: `@${dynamicUsername}` });
    await expect(userRow).toBeVisible();

    // Change role from USER to ADMIN
    await userRow.locator('select').selectOption('ADMIN');

    // 4. Log out Admin
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeHidden();

    // 5. Log back in as the dynamic user
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await page.getByPlaceholder('Enter username').fill(dynamicUsername);
    await page.getByPlaceholder('Enter password').fill(dynamicPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // 6. Verify dynamic user is now promoted to ADMIN (has Admin Panel and User Directory access)
    await expect(page.locator('.badge-admin')).toContainText('ADMIN');
    await expect(page.getByRole('button', { name: 'Admin Panel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'User Directory' })).toBeVisible();
  });
});
