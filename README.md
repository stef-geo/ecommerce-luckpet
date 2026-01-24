# 🎉 LuckPet - A Complete E-commerce for Pet Lovers!

A modern, responsive e secure e-commerce platform for those who love taking care of their pets!

<p>
<img src="https://raw.githubusercontent.com/PabloG-7/ecommerce-luckpet/refs/heads/main/luckpet-linkedin.png" alt="LuckPet Banner"/>
</p>

---

## 🐾 About the Project

**LuckPet** is an e-commerce platform developed with a focus on user experience, responsive design, and advanced features. It includes an authentication system, shopping cart, favorites, and an exclusive loyalty program with LuckCoins.

💡 Intuitive navigation, well-defined categories, and a rewards system make LuckPet the perfect choice for pet owners. ## ✨ Features

### 🔐 Authentication System
- Registration with email confirmation via Supabase Auth
- Secure login with password validation
- Personalized avatar (dog, cat, rabbit, bird)
- Intelligent redirection after email confirmation

### 🛍️ Products and Categories
- Organized categories: Pet Health, Pet Fashion, Nutrition, Curiosities, Services
- Interactive cards with animated hover effects
- Intelligent search with real-time suggestions
- Filters by product type and category

### 🛒 Shopping System
- Persistent shopping cart
- Personalized favorites list
- Dynamic real-time counters
- LuckCoins credit system (1 LuckCoin = R$ 1.00 discount)

### 💰 Loyalty Program
- 50 free LuckCoins for new users
- Flexible use of credits on any purchase
- Progressive accumulation based on purchases

### 🎨 Interface and UX
- 100% responsive design (mobile, tablet, desktop)
- Smooth animations and visual feedback
- Interactive modals for cart and favorites
- Intuitive tab navigation

---

## 🌐 Online Deployment

Access now at:

- 🔗 [Vercel](https://projeto-luckpet.vercel.app/)

---

## 🛠️ Technologies Used

| Technology | Description |
|---|---|
| <img src="https://cdn-icons-png.flaticon.com/512/732/732212.png" width="20"> HTML5 | Semantic and accessible structure |
| <img src="https://cdn-icons-png.flaticon.com/512/732/732190.png" width="20"> CSS3 | Modern styling with CSS variables and animations |
| <img src="https://cdn-icons-png.flaticon.com/512/5968/5968292.png" width="20"> JavaScript | Advanced logic and interactivity |
| <img src="https://supabase.com/favicon.ico" width="20"> Supabase | Authentication and real-time database |
| <img src="https://cdn-icons-png.flaticon.com/512/5968/5968672.png" width="20"> Font Awesome | Icons and visual elements | ---

## 🚀 How to Run Locally

```bash
# Clone the repository
git clone https://github.com/PabloG-7/ecommerce-luckpet.git

# Access the project folder
cd ecommerce-luckpet

# Install dependencies (if necessary)
# The project works perfectly without build steps

# Open the main file
open index.html    # macOS
start index.html   # Windows
xdg-open index.html # Linux
```

---

## 📁 File Structure

```
ecommerce-luckpet/
├── index.html               # Main page
├── style.css                # Main styles
├── script.js                # Application logic
├── formulario/
│   ├── login.html           # Login/registration page
│   ├── auth.css             # Authentication styles
│   ├── auth.js              # Authentication logic
│   ├── auth-manager.js      # Session manager
│   └── confirmacao-email.html # Confirmation page
├── img/                     # Images and assets
└── pagamento.html           # Checkout page
```

---

## 📱 User Flow

1. **Initial Access:** User browses the storefront without authentication
2. **Registration:** Creates an account with email, password, and chooses an avatar
3. **Confirmation:** Receives an email and confirms registration
4. **Login:** Manually returns to log in
5. **Benefits:** Receives 50 welcome LuckCoins
6. **Purchase:** Adds products to the cart and uses credits
7. **Loyalty:** Continues shopping to earn more LuckCoins

---

## 🎯 Technical Features

### Authentication System
- Real-time password strength validation
- Custom post-confirmation redirection
- Session synchronization between tabs/devices
- Secure logout with local data cleanup

### State Management
- LocalStorage for cart and favorites
- Persistent session with Supabase Auth
- Real-time synchronization between components

### Performance
- Lazy image loading
- CSS animations - Optimized
- Intelligent resource caching

---

## 🤝 Contribution

Contributions are always welcome! To contribute:

1. Fork the project
2. Create a branch for your feature:
```bash
git checkout -b feature/AmazingFeature
```
3. Commit your changes:
```bash
git commit -m 'Add some AmazingFeature'
```
4. Push to the branch:
```bash
git push origin feature/AmazingFeature
```
5. Open a Pull Request

---