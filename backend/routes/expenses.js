const express = require('express');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/expenses  — all expenses for logged-in user
router.get('/', async (req, res) => {
  try {
    const { month, year, category } = req.query;
    const filter = { user: req.user._id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end   = new Date(year, month, 1);
      filter.date = { $gte: start, $lt: end };
    }
    if (category) filter.category = category;

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date, note } = req.body;
    if (!title || !amount) return res.status(400).json({ message: 'Title and amount required' });

    const expense = await Expense.create({
      user: req.user._id, title, amount, category, date, note,
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/expenses/:id
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Not found' });

    const { title, amount, category, date, note } = req.body;
    Object.assign(expense, { title, amount, category, date, note });
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/expenses/stats  — monthly totals for chart
router.get('/stats', async (req, res) => {
  try {
    const stats = await Expense.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: { month: { $month: '$date' }, year: { $year: '$date' }, category: '$category' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
