Design Decisions:-

Database Design:
-- Chose MongoDB for its flexibility in handling varied task structures.
--Designed a simple and clean schema with appropriate field types.
--Added indexes on frequently queried fields such as status, priority, and due_date to improve performance.
--Included timestamps to support tracking and auditing of changes.

API Design:
--Built a RESTful API using standard HTTP methods.
--Implemented input validation and consistent error handling across endpoints.
--Ensured all responses follow a uniform, structured format.
--Enabled CORS to allow seamless communication with the frontend.

Frontend Architecture:
--Used a component-based React architecture for modularity and reusability.
--Managed state efficiently with React Hooks.
--Designed a responsive layout using CSS Grid for an adaptive user experience.
--Ensured the UI updates in real time after any create, update, or delete action.

Improvements for Production:
--Add user authentication (JWT)
--Implement pagination for large task lists
--Add unit and integration tests
--Add rate limiting
--Implement proper error logging
--Add task categories/tags
--Implement task dependencies
--Add file attachments
--Implement real-time updates with WebSockets
--Add data export functionality