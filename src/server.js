import config from '../config/config.js';
import mongoose from 'mongoose';
import app from './app.js';

const PORT = config.PORT || 5000;
const MONGO_URI = config.MONGO_URI || 'mongodb://localhost:27017/';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.listen(PORT, () => {
  const baseUrl = `http://localhost:${PORT}`;
  console.log(`Server running on port ${PORT}`);
  console.log(`Web server listening at: ${baseUrl}`);
});
