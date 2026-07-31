# Mini Clinic Information System - Backend

## Tech Stack

- Node.js
- Express.js
- MySQL
- Sequelize ORM
- JWT Authentication
- bcryptjs
- dotenv
- express-validator
- cors

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create `.env` file in backend root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mini_clinic_db
DB_PORT=3306

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:3000
```

### 3. Create MySQL Database

```sql
CREATE DATABASE mini_clinic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run Application

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Patients
- `GET /api/patients` - Get all patients (with pagination & search)
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient (Admin, Registration Staff)
- `PUT /api/patients/:id` - Update patient (Admin, Registration Staff)
- `DELETE /api/patients/:id` - Delete patient (Admin only)

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Create new doctor (Admin only)
- `PUT /api/doctors/:id` - Update doctor (Admin only)
- `DELETE /api/doctors/:id` - Delete doctor (Admin only)

### Clinics
- `GET /api/clinics` - Get all clinics
- `GET /api/clinics/:id` - Get clinic by ID
- `POST /api/clinics` - Create new clinic (Admin only)
- `PUT /api/clinics/:id` - Update clinic (Admin only)
- `DELETE /api/clinics/:id` - Delete clinic (Admin only)

### Registrations
- `GET /api/registrations` - Get all registrations (with filters)
- `GET /api/registrations/:id` - Get registration by ID
- `POST /api/registrations` - Create new registration (Admin, Registration Staff)
- `PUT /api/registrations/:id` - Update registration (Admin, Registration Staff, Doctor)
- `DELETE /api/registrations/:id` - Delete registration (Admin only)

### Queues
- `GET /api/queues/today` - Get today's queues
- `GET /api/queues/next` - Get next queue (Doctor, Registration Staff)
- `GET /api/queues/history` - Get queue history
- `PUT /api/queues/:id/status` - Update queue status (Doctor, Registration Staff)

### Examinations (SOAP)
- `GET /api/examinations/registration/:registration_id` - Get examination by registration
- `GET /api/examinations/patient/:patient_id/history` - Get patient examination history
- `POST /api/examinations` - Create examination (Doctor only)
- `PUT /api/examinations/:id` - Update examination (Doctor only)
- `POST /api/examinations/medical-actions` - Add medical action (Doctor only)
- `POST /api/examinations/prescriptions` - Add prescription (Doctor only)
- `PUT /api/examinations/:id/complete` - Complete examination (Doctor only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (Admin only)
- `GET /api/dashboard/recent-registrations` - Get recent registrations (Admin only)
- `GET /api/dashboard/patient-statistics` - Get patient statistics (Admin only)

## Response Format

Success:
```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Roles

- **Administrator**: Full access to all features
- **Dokter**: Examinations, queues update, patient history
- **Petugas Pendaftaran**: Patient CRUD, registration, queue management

## Auto-Generation

- **Medical Record Number**: Format `RM000001`, increments automatically
- **Queue Number**: Format `A001`, resets daily, increments per registration

## Database Schema

See `docs/erd.md` for complete ERD and relationships.

## Project Structure

```
backend/
├── config/          # Database configuration
├── controllers/     # Business logic
├── middleware/      # Auth, validation middleware
├── models/          # Sequelize models
├── routes/          # API routes
├── services/        # Additional services
├── helpers/         # Helper functions (generators)
├── validations/     # Input validation rules
├── migrations/      # Database migrations
├── seeders/         # Database seeders
├── uploads/         # File uploads
├── app.js           # Express app setup
├── server.js        # Server entry point
└── package.json     # Dependencies
```

## Default Admin User

Create first admin user via `/api/auth/register` with role 'Administrator'

## Testing

Use Postman or similar tool to test endpoints. Import API collection (if provided).

## Security Notes

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Implement rate limiting
- Add input sanitization
- Use environment variables for sensitive data
- Regular security updates