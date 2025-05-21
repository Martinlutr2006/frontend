# Car Wash Management System

A full-stack web application for managing a car wash business, built with React (frontend) and Node.js/Express (backend).

## Features

- User Authentication (Login/Register)
- Car Management
  - Add new cars with plate number, type, size, and driver details
  - Edit existing car information
  - Delete cars (with cascading deletion of related records)
- Service Package Management
  - Create and manage different wash service packages
  - Assign packages to cars
- Payment Tracking
  - Record payments for services
  - Track payment status
- Reporting
  - View service and payment reports
- Responsive Design with Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm (comes with Node.js)

## Project Structure

```
car-wash-management/
├── frontend-project/          # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── CarManager.js
│   │   │   ├── PackageManager.js
│   │   │   ├── PaymentManager.js
│   │   │   ├── ServicePackageManager.js
│   │   │   ├── Report.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Navbar.js
│   │   ├── api.js           # API configuration
│   │   └── App.js
│   ├── tailwind.config.js
│   └── package.json
│
└── backend-project/          # Node.js backend
    ├── server.js            # Main server file with all routes
    ├── database.sql         # Database schema
    ├── reset-database.js    # Database reset utility
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
DB_NAME=cwsms
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

4. Set up the database:
   - Open MySQL command line or MySQL Workbench
   - Create a new database:
   ```sql
   CREATE DATABASE cwsms;
   ```
   - Import the database schema:
   ```bash
   mysql -u your_username -p cwsms < database.sql
   ```
   - (Optional) To reset the database:
   ```bash
   node reset-database.js
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
2. Register a new account or login with existing credentials
3. Use the navigation menu to access different features:
   - Cars: Manage car information
   - Packages: Create and manage service packages
   - Payments: Record and track payments
   - Reports: View service and payment reports

## API Endpoints

### Authentication
- POST `/auth/register` - Register new user
- POST `/auth/login` - User login

### Cars
- GET `/cars` - Get all cars
- POST `/cars` - Add new car
- PUT `/cars/:plateNumber` - Update car
- DELETE `/cars/:plateNumber` - Delete car

### Service Packages
- GET `/packages` - Get all packages
- POST `/packages` - Add new package
- PUT `/packages/:id` - Update package
- DELETE `/packages/:id` - Delete package

### Payments
- GET `/payments` - Get all payments
- POST `/payments` - Add new payment
- GET `/payments/report` - Get payment report

## Technologies Used

### Frontend
- React.js
- Tailwind CSS for styling
- Axios for API requests
- React Router for navigation

### Backend
- Node.js with Express
- MySQL database
- JWT for authentication
- bcrypt for password hashing

## Database Schema

The application uses a MySQL database with the following main tables:
- users (authentication)
- cars (vehicle information)
- packages (service packages)
- payments (payment records)

All tables use appropriate foreign key constraints with CASCADE deletion where necessary.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers. 