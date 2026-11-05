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
npm install
```

### 2. Configure Environment Variables

Create `.env` file in backend root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mini_clinic
DB_PORT=3306

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

PORT=5000
NODE_ENV=development

```

### 3. Generate JWT_SECRET

```bash
Run node scripts/generateSecret.js
Paste JWT_SECRET to .env
```

### 4. Create MySQL Database

```sql
CREATE DATABASE mini_clinic
```

### 5. Run Application

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

- `POST /api/auth/login` - Login user

### Patients

- `GET /api/patients` - Get all patients (with pagination & search)
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Doctors

- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Create new doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Clinics

- `GET /api/clinics` - Get all clinics
- `GET /api/clinics/:id` - Get clinic by ID
- `POST /api/clinics` - Create new clinic
- `PUT /api/clinics/:id` - Update clinic
- `DELETE /api/clinics/:id` - Delete clinic

### Registrations

- `GET /api/registrations` - Get all registrations
- `GET /api/registrations/:id` - Get registration by ID
- `POST /api/registrations` - Create new registration
- `PUT /api/registrations/:id` - Update registration
- `DELETE /api/registrations/:id` - Delete registration

### Queues

- `GET /api/queues/today` - Get today's queues
- `GET /api/queues/next` - Get next queue
- `GET /api/queues/history` - Get queue history
- `PUT /api/queues/:id/status` - Update queue status

### Examinations (SOAP)

- `GET /api/examinations/registration/:registration_id` - Get examination by registration
- `GET /api/examinations/patient/:patient_id/history` - Get patient examination history
- `POST /api/examinations` - Create examination
- `PUT /api/examinations/:id` - Update examination
- `POST /api/examinations/medical-actions` - Add medical action
- `POST /api/examinations/prescriptions` - Add prescription
- `PUT /api/examinations/:id/complete` - Complete examination

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-registrations` - Get recent registrations
- `GET /api/dashboard/patient-statistics` - Get patient statistics

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

## Testing

Use Postman or similar tool to test endpoints. Import API collection (if provided).

## Security Notes

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Implement rate limiting
- Add input sanitization
- Use environment variables for sensitive data
- Regular security updates

Untuk perubahan 3 November 2026: jalankan `npm run migrate` sebelum server. Lihat `../docs/pembaruan-2026-11-03.md` untuk konfigurasi, pembuatan administrator awal, dan pengujian (`npm test`). Endpoint registrasi akun sekarang hanya dapat dipakai administrator yang sudah masuk.
