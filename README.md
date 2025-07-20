# 🏠 Household Harmony Hub

A modern, mobile-first web application for managing household tasks, grocery lists, notes, and tracking family activities. Built with React and designed for seamless collaboration between household members.

## ✨ Features

### 📅 Smart Calendar System
- **Visual task scheduling** with recurring task management
- **Color-coded timer bars** showing time left before tasks are due
- **Direct calendar interaction** for quick task creation
- **User assignment** with toggle between household members

### ✅ Task Management
- **Recurring task tracking** with customizable frequencies
- **Visual progress indicators** with color-coded status:
  - 🟢 Green: Plenty of time left
  - 🟡 Yellow: Due in 2 days
  - 🟠 Orange: Due tomorrow
  - 🔴 Red: Overdue
- **Smart completion tracking** with user attribution

### 🛒 Smart Grocery List
- **Collaborative shopping** with real-time updates
- **Mobile camera integration** for product photos
- **Export & sharing capabilities**:
  - 📤 Native mobile sharing
  - 💾 Download as text file
  - 📋 JSON backup/restore
  - 📥 Import from text or backup files
- **Offline support** with automatic local caching
- **Completion tracking** with user attribution

### 📝 Shared Notes
- **Quick note-taking** for household reminders
- **User attribution** for accountability
- **Timestamp tracking** for reference

### 📊 Household Reports
- **Task completion analytics**
- **Overdue task alerts**
- **Grocery usage statistics**
- **User contribution tracking**
- **Completion rate visualization**

### 📱 Mobile-First Design
- **Touch-optimized interface** with 44px+ touch targets
- **Responsive grid navigation** with emoji icons
- **iOS zoom prevention** on input focus
- **Offline-capable** with localStorage persistence
- **PWA-ready** for home screen installation

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/household-harmony-hub.git
   cd household-harmony-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` (or your configured port)

### Custom Port Setup
To run on a specific port (e.g., 8743):
1. Create a `.env` file in the root directory
2. Add: `PORT=8743`
3. Start with `npm start`

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0
- **Styling**: Tailwind CSS (utility classes)
- **State Management**: React Hooks (useState, useEffect, useMemo)
- **Storage**: localStorage for offline persistence
- **Mobile**: Web Share API, File API, Camera capture
- **Build**: Create React App (react-scripts 5.0.1)

## 📱 Mobile Features

### Camera Integration
- **Environment camera** for grocery item photos
- **Image preview** with removal option
- **Base64 encoding** for storage

### Native Sharing
- **Web Share API** support for mobile devices
- **Clipboard fallback** for desktop
- **Multiple export formats** (text, JSON)

### Offline Support
- **Automatic data persistence** via localStorage
- **Corruption detection** and recovery
- **Cache size monitoring** and status display

## 🏗️ Project Structure

```
src/
├── App.js          # Main application component
├── App.css         # Mobile-optimized styles
├── index.js        # React entry point
└── index.css       # Global styles

public/
├── index.html      # HTML template
└── ...

.env                # Environment configuration
package.json        # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables
- `PORT` - Development server port (default: 3000)

### User Configuration
Users are currently configured in `MOCK_USERS` object:
```javascript
const MOCK_USERS = {
  'user_1': { name: 'You', color: 'bg-teal-600' },
  'user_2': { name: 'Partner', color: 'bg-purple-600' }
};
```

## 📊 Data Storage

### localStorage Schema
- `household-tasks` - Recurring tasks with frequencies
- `household-notes` - Shared notes and reminders  
- `household-events` - Generated calendar events
- `household-grocery` - Grocery list items with photos

### Data Structure Examples

**Task:**
```javascript
{
  id: 1,
  name: "Clean toilets",
  frequency: 3, // days
  lastCompleted: Date,
  completedBy: "user_1"
}
```

**Grocery Item:**
```javascript
{
  id: 1,
  item: "Milk",
  addedBy: "user_1",
  timestamp: Date,
  completed: false,
  image: "data:image/jpeg;base64,..."
}
```

## 🎨 Customization

### Colors & Theming
The app uses a dark theme with teal accents. Main colors:
- Background: `bg-gray-900`
- Cards: `bg-gray-800`
- Accent: `bg-teal-600`
- Text: `text-white`, `text-gray-300`

### Adding New Users
1. Update `MOCK_USERS` in `App.js`
2. Add new user ID and display name
3. Choose a unique background color class

## 🚀 Deployment

### Local Development
```bash
npm start
```

### Production Build
```bash
npm run build
npm install -g serve
serve -s build -l 3000
```

### Docker Deployment
```bash
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Future Enhancements

- [ ] Real backend API integration
- [ ] User authentication system
- [ ] Push notifications for due tasks
- [ ] Advanced reporting and analytics
- [ ] Calendar synchronization
- [ ] Multi-household support
- [ ] Voice note recording
- [ ] Barcode scanning for groceries

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/household-harmony-hub/issues) page
2. Create a new issue with detailed description
3. Include browser and device information

---

**Made with ❤️ for happy households**
