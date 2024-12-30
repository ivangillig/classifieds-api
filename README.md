# Classifieds API

This is the backend for a classified ads web application. The API provides endpoints for posting, browsing, and managing classified ads across various categories.

## Technologies Used

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/) for authentication

## Getting Started

First, clone the repository:

```bash
git clone https://github.com/ivangillig/classifieds-api.git
cd classifieds-api
```

Then, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Next, set up your environment variables. Create a `.env` file in the root directory and add the following:

```env
BASE_URL=http://localhost:5000
PORT=5000
MONGO_URI=your_mongodb_uri

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
SESSION_EXPIRY=60 * 15
REFRESH_TOKEN_EXPIRY=60 * 60 * 24 * 30

FRONTEND_URL=http://localhost:4000
```

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
