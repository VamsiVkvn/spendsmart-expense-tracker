# 💸 SpendSmart - Personal Expense Tracker

A full-stack personal expense tracker web application built with React, Node.js, Express, and MongoDB. Users can sign up, log in, and track their daily expenses with category breakdowns, monthly stats, and a clean responsive dashboard.

## 🚀 Live Demo
- Frontend: [Coming Soon]
- Backend API: [Coming Soon]

---

## ✨ Features

- 🔐 User Authentication (Register & Login with JWT)
- ➕ Add, Edit, Delete Expenses
- 📊 Category-wise Expense Breakdown with Visual Bars
- 📅 Filter Expenses by Month, Year and Category
- 📈 Monthly Stats — Total Spent, Avg/Day, Top Category
- 📱 Fully Responsive Design

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite), Tailwind CSS, React Router DOM, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT + bcryptjs |
| Deployment | Vercel (Frontend) + Render (Backend) |

---

## 📁 Project Structure

```
spendsmart/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Expense.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── expenses.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free)

### 1. Clone the repository
```bash
git clone https://github.com/VamsiVkvn/spendsmart-expense-tracker.git
cd spendsmart-expense-tracker
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/spendsmart?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```
You should see:
```
✅ MongoDB connected
🚀 Server on port 5000
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` folder:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🌐 Deployment

### Backend → Render (free)
1. Push backend folder to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set Start Command: `npm start`
5. Add all environment variables from `.env`
6. Deploy → get your live API URL

### Frontend → Vercel (free)
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Set environment variable: `VITE_API_URL=https://your-render-url.onrender.com/api`
4. Deploy → get your live website URL

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Add new expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/stats` | Get category stats |

---

## 👨‍💻 Author

**Vamsi Krishna**  
GitHub: [@VamsiVkvn](https://github.com/VamsiVkvn)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
