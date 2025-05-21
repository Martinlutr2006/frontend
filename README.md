# Car Wash Management System

A full-stack web application for managing a car wash business, built with React (frontend) and Node.js/Express (backend).

## Features

- Car Management (Add, Edit, Delete cars)
- Service Package Management
- Payment Tracking
- User Authentication
- Responsive Design

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm (comes with Node.js)

## Project Structure

```
car-wash-management/
├── frontend-project/     # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── api.js       # API configuration
│   │   └── ...
│   └── package.json
│
└── backend-project/      # Node.js backend
    ├── src/
    │   ├── routes/      # API routes
    │   ├── models/      # Database models
    │   └── ...
    └── package.json
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd car-wash-management
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend-project
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=car_wash_db
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

4. Set up the database:
   - Open MySQL command line or MySQL Workbench
   - Create a new database:
   ```sql
   CREATE DATABASE car_wash_db;
   ```
   - Import the database schema:
   ```bash
   mysql -u your_username -p car_wash_db < database.sql
   ```

5. Start the backend server:
```bash
npm start
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend-project
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

4. Start the frontend development server:
```bash
npm start
```

The frontend application will run on `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Log in with your credentials
3. Use the navigation menu to access different features:
   - Car Management: Add, edit, and delete cars
   - Service Packages: Manage service packages
   - Payments: Track payments and transactions

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration

### Cars
- GET `/api/cars` - Get all cars
- POST `/api/cars` - Add new car
- PUT `/api/cars/:plateNumber` - Update car
- DELETE `/api/cars/:plateNumber` - Delete car

### Service Packages
- GET `/api/packages` - Get all packages
- POST `/api/packages` - Add new package
- PUT `/api/packages/:id` - Update package
- DELETE `/api/packages/:id` - Delete package

### Payments
- GET `/api/payments` - Get all payments
- POST `/api/payments` - Add new payment
- GET `/api/payments/:id` - Get payment details

## Technologies Used

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- bcrypt

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers. 