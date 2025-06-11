# 🏥 RxClose – Pharmaceutical E-Commerce System

<div align="center">

**A unified platform for selling medicines and medical supplies online**

![RxClose Logo](RxClose-frontend/RxClose-main/public/assets/images/RxClose-Logo.PNG)

[![.NET Core](https://img.shields.io/badge/.NET%20Core-8.0-512BD4?style=for-the-badge\&logo=dotnet)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=for-the-badge\&logo=angular)](https://angular.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge\&logo=mysql)](https://www.mysql.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge\&logo=bootstrap)](https://getbootstrap.com/)

</div>

---

## 👏 Overview

**RxClose** is a comprehensive e-commerce platform for medicines and medical supplies, connecting customers with licensed pharmacies through an integrated system. It provides a seamless and secure shopping experience with advanced inventory and order management.

### 🌟 Project Goals

* Provide a trusted platform to purchase medicines and medical supplies
* Connect customers with licensed pharmacies
* Enable efficient inventory management for pharmacies
* Implement advanced ordering and delivery systems
* Provide an admin interface for system monitoring

---

## 🚀 Key Features

### 👤 For Customers:

* Secure registration & login with email verification
* Advanced search for medicines and medical products
* Smart shopping cart with auto-save feature
* Price comparison across different pharmacies
* Real-time order tracking
* Comprehensive order history
* Product and pharmacy ratings & reviews
* AI-powered live chat customer support

### 🏧 For Pharmacies:

* Full-featured dashboard for pharmacy operations
* Inventory management with low-stock alerts
* Easy product addition & editing
* Order processing and management
* Sales reports & analytics
* Discount and promotion management
* View and respond to reviews

### 🔧 For Admins:

* Advanced dashboard with system-wide analytics
* User and permission management
* Pharmacy license management
* System monitoring and health checks
* Global product management (RxClose level)
* Advanced reporting & charts
* Content and settings management

---

## 🛠️ Technologies Used

### Backend:

* **Framework**: ASP.NET Core 8.0
* **Database**: MySQL 8.0 with Entity Framework Core
* **Authentication**: JWT (JSON Web Tokens)
* **Password Hashing**: BCrypt
* **Validation**: FluentValidation
* **API Documentation**: Swagger/OpenAPI
* **Object Mapping**: Mapster
* **AI Chatbot**: Google Gemini API

### Frontend:

* **Framework**: Angular 18
* **UI**: Bootstrap 5.3
* **Icons**: Font Awesome
* **Typography**: Google Fonts (Inter)
* **Layout**: CSS3 with Flexbox & Grid
* **Animation**: CSS transitions
* **Responsive Design**: optimized for all devices

### Development Tools:

* **IDE**: Visual Studio 2022 / VS Code
* **Version Control**: Git & GitHub
* **Package Management**: NuGet (Backend), npm (Frontend)
* **API Testing**: Postman

---

## 📁 Project Structure

```
RxClose-Project/
├── RxCloseAPI/                     
│   ├── Controllers/               
│   ├── Data/                     
│   ├── DTOs/                     
│   ├── Entities/                 
│   ├── Services/                 
│   ├── Middleware/               
│   ├── Security/                 
│   ├── Persistence/              
│   ├── Migrations/               
│   └── Properties/               
├── RxClose-frontend/          
│   └── RxClose-main/             
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/    
│       │   │   ├── services/      
│       │   │   ├── guards/        
│       │   │   └── shared/       
│       │   ├── assets/           
│       │   └── environments/     
│       └── public/               
├── Documentation/               
│   ├── API-Docs/               
│   ├── Setup-Guides/           
│   └── User-Manuals/           
└── Database/                    
    ├── Migrations/              
    ├── Seeders/                 
    └── Backups/                 
```

---

## 💻 Prerequisites

### Backend:

* .NET 8.0 SDK or newer
* MySQL Server 8.0 or newer
* Visual Studio 2022 or VS Code with C# extension

### Frontend:

* Node.js 18+ with npm
* Angular CLI 18+
* Modern browser with ES2022 support

### System Requirements:

* OS: Windows 10+, macOS 10.15+, or Linux
* RAM: Minimum 8 GB
* Disk Space: At least 5 GB free
* Internet connection for external APIs

---

## ⚙️ Installation & Setup

### 1️⃣ Setup Database:

```sql
CREATE DATABASE RxCloseDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'rxclose_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON RxCloseDB.* TO 'rxclose_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2️⃣ Setup Backend:

```bash
cd RxCloseAPI/RxCloseAPI
dotnet restore
cp local.env.example local.env

echo "ConnectionStrings__DefaultConnection=Server=localhost;Database=RxCloseDB;User=rxclose_user;Password=secure_password;" >> local.env

dotnet ef database update
dotnet run
```

### 3️⃣ Setup Frontend:

```bash
cd RxClose-frontend/RxClose-main
npm install
ng serve --port 4200
```

### 4️⃣ (Optional) Setup AI:

```bash
echo "AI__GeminiApiKey=your_gemini_api_key_here" >> RxCloseAPI/RxCloseAPI/local.env
```

---

## 🚀 Running the Project

### Quick Start:

1. **Run Backend** ([https://localhost:7240](https://localhost:7240)):

```bash
cd RxCloseAPI/RxCloseAPI
dotnet run
```

2. **Run Frontend** ([http://localhost:4200](http://localhost:4200)):

```bash
cd RxClose-frontend/RxClose-main
ng serve
```

### System Access:

* Frontend app: `http://localhost:4200`
* API docs: `https://localhost:7240/swagger`
* MySQL: `localhost:3306`

---

## 🔐 Sample Users

```json
// Super Admin
{ "email": "admin@rxclose.com", "password": "Admin@123" }

// Pharmacy Admin
{ "email": "pharmacy@example.com", "password": "Pharmacy@123" }

// Customer
{ "email": "customer@example.com", "password": "Customer@123" }
```

---

## 🔗 API Endpoints

### Authentication:

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/forgot-password
```

### Product APIs:

```
GET    /api/product
GET    /api/product/{id}
POST   /api/product
PUT    /api/product/{id}
DELETE /api/product/{id}
GET    /api/product/rxclose
GET    /api/product/pharmacy-products
```

### Pharmacy APIs:

```
GET    /api/pharmacy
GET    /api/pharmacy/{id}
POST   /api/pharmacy
PUT    /api/pharmacy/{id}
GET    /api/pharmacy/{id}/products
```

### Cart APIs:

```
GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/update
DELETE /api/cart/remove/{id}
POST   /api/cart/clear
```

### Order APIs:

```
GET    /api/orders
GET    /api/orders/{id}
POST   /api/orders
PUT    /api/orders/{id}/status
```

---

## 👥 Roles & Permissions

### 🛡️ Super Admin:

* Full system control
* Manage users & pharmacies
* Manage RxClose products
* View reports & system stats
* Manage settings and content

### 🏥 Pharmacy Admin:

* Manage pharmacy inventory and pricing
* Handle and update orders
* View sales reports
* Respond to customer inquiries

### 🛒 Customer/User:

* Browse and purchase products
* Manage shopping cart
* Track orders
* Rate products & pharmacies
* Edit own profile

---

## 🔒 Security & Protection

* JWT authentication with expiration
* BCrypt password hashing
* Comprehensive input validation
* SQL injection prevention via EF Core
* XSS protection on the frontend
* CORS configured
* HTTPS enforced in production
* API rate limiting

### Data Security:

* Password encryption
* Sensitive data protection
* Audit logging
* Regular backups
* Separation of development and production environments

---

## 📸 Screenshots

* Homepage with featured products & advanced search
* Admin dashboard with analytics and alerts
* Shopping cart display and checkout process

---

## 🛠️ Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/AmazingFeature`
3. Commit: `git commit -m 'Add some AmazingFeature'`
4. Push: `git push origin feature/AmazingFeature`
5. Open a Pull Request

### Guidelines:

* Use Clean Code principles
* Write unit tests
* Document APIs
* Follow SOLID
* Use meaningful names

---

## 🔧 Troubleshooting

### Backend:

```bash
# DB connection error: Verify MySQL is running & connection string
# Migration issues:
dotnet ef database drop --force
dotnet ef database update
# Package problems:
dotnet clean
dotnet restore
```

### Frontend:

```bash
# Package issues:
rm -rf node_modules package-lock.json
npm install
# Build errors:
ng build --configuration production
# Serving issues:
ng serve --host 0.0.0.0 --port 4200
```

### Database:

```sql
ALTER USER 'rxclose_user'@'localhost' IDENTIFIED BY 'new_password';
SHOW PROCESSLIST;
SELECT table_schema AS "Database", ROUND(SUM(data_length + index_length)/1024/1024, 1) AS "DB Size in MB"
FROM information_schema.tables
WHERE table_schema = 'RxCloseDB';
```

---

## 📞 Support & Contact

* **GitHub Issues**: [Open an issue](https://github.com/mohamedhalassal/RxClose-Project/issues)
* **Documentation**: Refer to project docs
* **Community**: Open discussions

---

## 📊 Roadmap

### Next Features:

* Mobile app (React Native)
* Advanced payment systems (Stripe, PayPal)
* AI-powered product recommendations
* GPS delivery tracking
* Push notifications
* Loyalty & rewards system

### Technical Enhancements:

* Microservices
* Redis caching
* Docker
* Kubernetes deployment
* CI/CD pipelines
* Performance monitoring

---

## 📊 Stats

* **LOC**: 50,000+
* **API Endpoints**: 45+
* **Database Tables**: 15+
* **Frontend Components**: 30+
* **Test Coverage**: 80%+

---

## 🙏 Acknowledgements

Thanks to:

* Core development team
* The community
* QA testers
* Designers

---

## 📄 License

Licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<div align="center">
**Built with ❤️ by the RxClose team**  

[Visit our website](https://rxclose.com) | [Contact us](mailto:contact@rxclose.com) | [Report an issue](https://github.com/mohamedhalassal/RxClose-Project/issues)

</div>
