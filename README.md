# 🛒 Digiku — Digital Product Marketplace

> **⚠️ Work In Progress (WIP)**
> This project is currently in active development and still far from finished. I'm building and improving it step-by-step in my free time. Expect ongoing changes, updates, and some incomplete features! 🛠️

An interactive full-stack marketplace platform designed to facilitate the secure and seamless buying and selling of digital products. Built with a focus on modern software development practices, efficient database architecture, and a dynamic user interface.

---

## 🚀 Tech Stack

This project uses a **monorepo architecture**, separating the frontend and backend with the following technologies:

### Frontend

| Technology | Purpose |
|---|---|
| React.js (v18) + Vite | Core framework & build tool |
| Tailwind CSS + PostCSS | Styling |
| React Router DOM | Client-side routing |
| Swiper | Carousel / slider UI |
| Three.js + Vanta.js | 3D animated backgrounds |
| jwt-decode | Auth token handling |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express.js (v5) | Server environment & API framework |
| PostgreSQL | Relational database |
| Prisma | ORM & schema management |
| JSON Web Token (JWT) | Authentication |
| bcryptjs | Password encryption |
| Multer | File upload handling |

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- Secure user registration and login with **bcrypt** password encryption
- Session management via **JWT**
- Role-based access control: **Buyer**, **Seller**, **Admin**

### 📦 Product Management *(Seller)*
- Upload digital products with thumbnails, image galleries, and downloadable files
- Full **CRUD** operations for product listings

### 🛒 Transactions *(Buyer)*
- Responsive shopping cart system
- Real-time order history tracking
- Product price snapshots at checkout to maintain transaction data integrity

---

## 🗄️ Database Architecture

Designed with solid relational structure and **Cascade Delete** to prevent orphan records or data leaks.

```
User ──┬── Product (as Seller)
       ├── Order ── OrderItem
       ├── Cart
       └── Payment
```

| Model | Description |
|---|---|
| **User** | Stores credentials and roles |
| **Product** | Stores item details and file paths |
| **Order & OrderItem** | Tracks transaction status and purchased item details |
| **Cart** | Temporarily holds items before checkout |
| **Payment** | Manages payment status and payload |

---

## 🛠️ Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [PostgreSQL](https://www.postgresql.org/) running and ready to use

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Digiku_Digital_Product_Marketplace.git
cd Digiku_Digital_Product_Marketplace
```

### 2. Backend Configuration

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/digiku?schema=public"
JWT_SECRET="your_jwt_secret"
```

Then sync the database schema and start the server:

```bash
npx prisma db push
npm run dev
```

### 3. Frontend Configuration

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

---

## 👨‍💻 About the Developer

Developed by **Syahdan Alfaatih**.

A Teknik Informatika student who attends classes on weekends, spending the rest of the week building things and sharpening skills across the stack.
I'm actively shaping my career as an IT Generalist guy someone who doesn't just specialize in one lane, but understands how the pieces fit together: from backend logic and database design to frontend experience and system architecture. Digiku is one of the projects where I put that mindset into practice.
