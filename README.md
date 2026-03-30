# Task Tracker Frontend

A modern React-based frontend application for the Task Tracker system with AWS Cognito authentication.

## Features

- ✅ User Authentication (Login, Register, Email Confirmation)
- ✅ JWT Token Management with Auto-Refresh
- ✅ Role-Based Access Control (ADMIN, TASK_CREATOR, READ_ONLY)
- ✅ Project Management (Create, Read, Update, Delete)
- ✅ Task Management (Create, Read, Update, Delete)
- ✅ Task Status Tracking (NEW, IN_PROGRESS, BLOCKED, COMPLETED, NOT_STARTED)
- ✅ Responsive Design
- ✅ Modern UI with Gradient Themes

## Prerequisites

- Node.js 14+ and npm
- Running backend server on `http://localhost:8080/api`

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm start
```

3. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── api/                    # API service layer
│   ├── axiosConfig.js      # Axios configuration with interceptors
│   ├── authService.js      # Authentication API calls
│   ├── projectService.js   # Project API calls
│   └── taskService.js      # Task API calls
├── components/             # React components
│   ├── Login.js            # Login component
│   ├── Register.js         # Registration component
│   ├── ConfirmRegistration.js  # Email confirmation
│   ├── Dashboard.js        # Main dashboard
│   ├── ProjectList.js      # Project list & management
│   ├── CreateProject.js    # Create project modal
│   ├── TaskList.js         # Task list & management
│   ├── CreateTask.js       # Create task modal
│   └── PrivateRoute.js     # Protected route wrapper
├── context/                # React context
│   └── AuthContext.js      # Authentication context & hooks
└── App.js                  # Main app component with routing
```

## Authentication Flow

1. **Register**: Create account with username, email, and password
2. **Confirm**: Verify email with confirmation code from AWS Cognito
3. **Login**: Authenticate and receive JWT tokens
4. **Auto-Refresh**: Access tokens automatically refresh when expired

## User Roles

- **ADMIN**: Full access to all features
- **TASK_CREATOR**: Can create and manage projects and tasks
- **READ_ONLY**: Can view tasks and update status of assigned tasks

## API Configuration

The frontend connects to `http://localhost:8080/api` by default.

To change the API URL, edit `src/api/axiosConfig.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

## Building for Production

```bash
npm run build
```

Creates an optimized production build in the `build/` folder.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
