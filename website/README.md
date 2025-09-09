# MR-ROBOT Computer Repair Website

A professional computer repair service website with admin panel, client portal, and knowledge base.

## 🚀 Features

- **Professional Service Management** - Add, edit, and manage repair services
- **Dynamic Category System** - Organize services and knowledge articles
- **Admin Dashboard** - Complete CRUD operations for all content
- **Client Portal** - User registration, booking, and article access
- **Knowledge Base** - Technical articles with automatic thumbnail handling
- **Responsive Design** - Mobile-first approach with modern UI
- **Real-time Updates** - Dynamic category management across all pages

## 🛠️ Tech Stack

**Frontend:**
- React 19.0.0
- React Router DOM
- Tailwind CSS
- Shadcn UI Components
- Lucide React Icons

**Backend:**
- Node.js & Express.js
- MySQL/MariaDB
- JWT Authentication
- Multer (file uploads)
- Axios (HTTP requests)

## 📦 Installation

### Prerequisites
- Node.js >= 16.0.0
- MySQL/MariaDB
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp config.env config.production.env
# Edit config.production.env with your database credentials
npm start
```

### Frontend Setup
```bash
cd fronted
npm install
npm start
```

## 🔧 Configuration

### Environment Variables
Create `backend/config.production.env`:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=MrRobot_ComputerRepair
JWT_SECRET=your_secure_jwt_secret
CORS_ORIGINS=http://localhost:3000
```

### Database Setup
```bash
mysql -u root -p < database_schema.sql
node setup_database.js
node setup_admin.js
```

## 🚀 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Add environment variable: `REACT_APP_BACKEND_URL`

### Backend Hosting
- Deploy to VPS, Heroku, or similar
- Update CORS_ORIGINS with your domain
- Set NODE_ENV=production

## 📱 Usage

### Admin Panel
- Access: `/admin`
- Default credentials: Check `setup_admin.js`
- Manage services, categories, articles, and users

### Client Portal
- Access: `/login`
- Users can register and book services
- Access knowledge base articles

## 🔒 Security Features

- JWT authentication
- Rate limiting
- Input validation
- SQL injection protection
- CORS configuration
- Password hashing (bcrypt)
- Security headers (Helmet)

## 📊 Performance

- Optimized images (WebP format)
- Lazy loading
- Code splitting
- Minified assets
- Responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, email mr.robotcomputerservice@gmail.com or create an issue in this repository.

---

**Built with ❤️ for professional computer repair services**
