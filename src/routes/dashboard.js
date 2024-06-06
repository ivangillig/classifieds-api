import express from 'express';

const router = express.Router();

// @desc    Dashboard
// @route   GET /dashboard
router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`<h1>Welcome ${req.user.displayName}</h1><p>You are logged in and this is the dashboard.</p>`);
  } else {
    res.redirect('/');
  }
});

export default router;
