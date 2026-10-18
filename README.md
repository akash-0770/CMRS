# CMRS – Cash Management & Reconciliation System

## Project Overview
CMRS is a web-based application designed to manage customer records, loan repayment schedules, cash collections, cash reconciliation, and bank deposit settlements.

The system provides role-based access to support different banking operations and helps maintain accurate financial transaction records.

## Key Features
- **Dashboard:** View collection, reconciliation, and bank settlement summaries.
- **Customer Management:** Create and manage customer records.
- **Loan Management:** Manage loans and repayment schedules.
- **Cash Collection:** Record customer payments and generate receipt numbers.
- **Cash Reconciliation:** Compare expected and actual cash amounts and identify discrepancies.
- **Bank Deposits:** Track bank deposits and process settlements.
- **Role-Based Access:** Access controls for Admin, Collection Agent, Branch Manager, and Branch User.
- **Validation:** Prevent invalid payments, over-collection, duplicate bank references, and repeated settlements.

## Technology Stack
- **Backend:** Python, Django, Django REST Framework
- **Frontend:** React, Vite, JavaScript, CSS
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Version Control:** Git and GitHub

## Project Structure
```text
CMRS/
├── backend/
│   ├── accounts/
│   ├── banking/
│   ├── cash_collections/
│   ├── config/
│   ├── customers/
│   ├── dashboard/
│   ├── loans/
│   └── reconciliation/
├── frontend/
│   ├── public/
│   └── src/
└── README.md
```

## Main API Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/customers/` | Retrieve customers |
| GET | `/api/loans/` | Retrieve loans |
| GET | `/api/repayment-schedules/` | Retrieve repayment schedules |
| GET/POST | `/api/collections/` | View or record cash collections |
| GET/POST | `/api/submissions/` | View or create cash submissions |
| POST | `/api/submissions/<id>/reconcile/` | Reconcile a cash submission |
| GET/POST | `/api/deposits/` | View or create bank deposits |
| POST | `/api/deposits/<id>/settle/` | Process a bank settlement |
| GET | `/api/dashboard/summary/` | Retrieve dashboard summary |
| POST | `/api/token/` | Obtain authentication tokens |

## Local Setup

### Backend
1. Navigate to the backend directory.
2. Activate the Python virtual environment.
3. Install the required dependencies from `requirements.txt`, if available.
4. Configure the database and environment variables in `.env`.
5. Run database migrations.
6. Start the Django development server.

```bash
cd backend
python manage.py migrate
python manage.py runserver
```

### Frontend
Open another terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend development server typically runs at `http://localhost:5173`, and the Django backend runs at `http://localhost:8000`.

## Security
- Keep database credentials and secret keys in environment variables.
- Do not commit `.env` files or sensitive credentials.
- Use appropriate role-based permissions for financial operations.

## Author
Developed as a full-stack project to demonstrate financial transaction management, reconciliation workflows, REST API development, and role-based access control.
