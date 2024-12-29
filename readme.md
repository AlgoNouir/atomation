# Atomation

Atomation is a powerful project management and task tracking application built with Next.js and Redux. It provides a user-friendly interface for managing projects, milestones, and tasks using a Kanban board and Gantt chart visualization.

## Features

- User authentication with role-based access control (Owner, Admin, User)
- Project management with milestones
- Kanban board for task management
- Gantt chart for project timeline visualization
- Task dependencies and checklist management
- Team collaboration with user assignments and permissions
- Activity logging and team statistics
- Dark mode support

## Technologies Used

- Next.js 13 (App Router)
- React 18
- Redux Toolkit for state management
- TypeScript
- Tailwind CSS and DaisyUI for styling
- @hello-pangea/dnd for drag-and-drop functionality
- D3.js for Gantt chart visualization
- Lucide React for icons

## Prerequisites

- Node.js (v14 or later)
- npm or yarn

## Setup

1. Clone the repository:
```
git clone [https://github.com/your-username/atomation.git](https://github.com/your-username/atomation.git)
```
```
cd atomation
```

2. Install dependencies:

```
npm install
```

or

```
yarn install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory and add the following variables:

```
NEXT_PUBLIC_API_URL=[http://your-backend-api-url](http://your-backend-api-url)
```


4. Run the development server:

```
npm run dev
```
or
```
yarn dev
```


5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Log in with your credentials. If you don't have an account, contact the system administrator.
2. Navigate through projects using the sidebar.
3. Create, update, and manage tasks on the Kanban board.
4. View project timelines using the Gantt chart.
5. Manage team members and their permissions in the Team Stats section.

## Project Structure

- `/app`: Next.js 13 App Router pages and layouts
- `/components`: React components used throughout the application
- `/store`: Redux store configuration and slices
- `/types`: TypeScript type definitions
- `/utils`: Utility functions and helpers

## Backend

The backend for Atomation is built with Django and Django REST Framework. It provides a robust API for managing projects, tasks, and user authentication.

### Key Features

- RESTful API endpoints for all major functionalities
- JWT-based authentication
- Role-based access control
- Database models for Projects, Milestones, Tasks, and User management

### Setup

1. Navigate to the `backend` directory
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Set up the database:
   ```
   python manage.py migrate
   ```
4. Create a superuser:
   ```
   python manage.py createsuperuser
   ```
5. Run the development server:
   ```
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`.

For detailed API documentation, refer to the `api/views.py` and `api/urls.py` files.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- [D3.js](https://d3js.org/)
- [Lucide](https://lucide.dev/)

