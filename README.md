# Inventory Management System

<div align="center">
  
  <p align="center">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&duration=2000&pause=200&color=F77B29&center=true&vCenter=true&width=500&lines=Full+Stack+Inventory+System;React+Frontend;Node.js/Express+Backend;PostgresDB+Database;" alt="Typing SVG" />
  </p>
</div>

---

## 📋 About The Project

A comprehensive inventory management system built with modern web technologies to help businesses track and manage their products efficiently. This application provides real-time inventory tracking, supplier management, and detailed reporting capabilities in an intuitive interface.

### ✨ Key Features

- **Product Management** - Add, edit, and delete products with detailed information
- **Category Organization** - Organize products into categories for easy navigation
- **Stock Tracking** - Real-time inventory tracking with low stock alerts
- **Supplier Management** - Keep track of product suppliers and contact information
- **Sales Reporting** - Generate sales reports and analytics
- **User Authentication** - Secure login system with role-based access
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

---

## 🛠️ Tech Stack

### Frontend
<div align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Javascript-3178C6?style=for-the-badge&logo=javascript&logoColor=white" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router"/>
</div>

### Backend
<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/PostgresDB-47A248?style=for-the-badge&logo=postgresdb&logoColor=white" alt="PorstgresDB"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT"/>
</div>

### Development Tools
<div align="center">
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" alt="Git"/>
  <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm"/>
  <img src="https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint"/>
</div>

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgresDB (v4.4 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yonatan1611/inventory-system.git
cd inventory-system
```

2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Environment Setup
```bash
PORT=5000
PostgresDB_URI=postgresql://localhost:27017/inventory-system
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

4. Start the development servers
```bash
# Start the backend server (from server directory)
npm run dev

# Start the frontend development server (from client directory)
npm start
```

### 📁 Project Structure
```bash
inventory-system/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── styles/        # CSS styles
│   ├── package.json
│   └── tsconfig.json
├── server/                # Backend Express application
│   ├── controllers/       # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   ├── package.json
│   └── server.js
└── README.md
```

### 📊 API Endpoints
```bash
Method	Endpoint	Description
GET	/api/products	Get all products
POST	/api/products	Create a new product
GET	/api/products/:id	Get a specific product
PUT	/api/products/:id	Update a product
DELETE	/api/products/:id	Delete a product
GET	/api/categories	Get all categories
GET	/api/suppliers	Get all suppliers
```

### 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request
