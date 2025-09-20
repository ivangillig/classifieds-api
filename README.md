# Classifieds API

This is the backend for a classified ads web application. The API provides endpoints for posting, browsing, and managing classified ads across various categories.

## Technologies Used

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/) for authentication

## Getting Started

### 1. Set up MongoDB (Docker Container)

This project uses MongoDB running in a Docker container. Make sure you have Docker installed and your MongoDB container running with the following configuration:

```bash
# Example Docker command to run MongoDB
docker run -d \
  --name mongodb-classifieds \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=SecureMongoDB2025! \
  mongo:latest
```

**MongoDB Connection Details:**

- **Host:** 127.0.0.1
- **Port:** 27017
- **Username:** admin
- **Password:** SecureMongoDB2025!
- **Database:** classifieds
- **Auth Source:** admin

### 2. Set up the project

Clone the repository:

```bash
git clone https://github.com/ivangillig/classifieds-api.git
cd classifieds-api
```

Install the dependencies:

```bash
npm install
```

Set up your environment variables. Copy `.env.example` to `.env` and adjust as needed:

```bash
copy .env.example .env
```

### 3. Run the application

Finally, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The API will be running on [http://localhost:5000](http://localhost:5000).

## Frontend

This project works in conjunction with the frontend UI available at [Classifieds UI](https://github.com/ivangillig/classifieds-ui). Make sure to follow the instructions in the frontend repository to set it up and run it locally.

https://github.com/ivangillig/classifieds-ui
