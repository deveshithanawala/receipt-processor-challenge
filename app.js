const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { isValidDate, isValidTime } = require('./utils/app.validation');

app.use(bodyParser.json());

const receipts = {};

function calculatePoints(receiptData) {
  let points = 0;

  // Rule 1: One point for every alphanumeric character in the retailer name
  points += receiptData.retailer.replace(/[^a-zA-Z0-9]/g, '').length;

  // Rule 2: 50 points if the total is a round dollar amount with no cents
  const totalValue = parseFloat(receiptData.total.replace(/\$/g, '').trim());
  if (totalValue === Math.floor(totalValue)) {
  points += 50;
  }

  // Rule 3: 25 points if the total is a multiple of 0.25
  if (parseFloat(receiptData.total) % 0.25 === 0) {
    points += 25;
  }

  // Rule 4: 5 points for every two items on the receipt
  points += Math.floor(receiptData.items.length / 2) * 5;

  // Rule 5: Calculate points based on item description length
  receiptData.items.forEach((item) => {
    const trimmedLength = item.shortDescription.trim().length;
    if (trimmedLength % 3 === 0) {
      const itemPoints = Math.ceil(parseFloat(item.price) * 0.2);
      points += itemPoints;
    }
  });

  // Rule 6: 6 points if the day in the purchase date is odd
  const purchaseDate = new Date(receiptData.purchaseDate);
  if(purchaseDate.getDay() % 2 === 1) {   
   points += 6;
}

  // Rule 7: 10 points if the time of purchase is after 2:00pm and before 4:00pm
  const purchaseTime = receiptData.purchaseTime.split(':');
  const purchaseHour = parseInt(purchaseTime[0], 10);
  if (purchaseHour >= 14 && purchaseHour < 16) {
    points += 10;
  }

  return points;
}

// POST Endpoint
app.post('/receipts/process', (req, res) => {
  const receiptData = req.body;

  if (!isValidDate(receiptData.purchaseDate)) {
    return res.status(400).json({ error: 'Invalid purchaseDate format' });
  }

  if (!isValidTime(receiptData.purchaseTime)) {
    return res.status(400).json({ error: 'Invalid purchaseTime format' });
  }

  const receiptId = Math.random().toString(36).substring(7);

  const points = calculatePoints(receiptData);

  receipts[receiptId] = { receiptData, points };

  res.json({ id: receiptId });
});

// GET Endpoint (/:id)
app.get('/receipts/:id/points', (req, res) => {
  const receiptId = req.params.id;

  if (receipts.hasOwnProperty(receiptId)) {
    const points = receipts[receiptId].points;
    res.json({ points });
  } else {
    res.status(404).json({ error: 'Receipt not found' });
  }
});

const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
    const { address, port } = server.address();
    console.log(`Server is running at http://${address}:${port}`);
  });

  module.exports = app;