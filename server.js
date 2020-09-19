require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');

// middleware
app.use(cors());
app.use(express.json()); // req.body

// routes

// create a restaurant

app.post('/api/v1/restaurants', async (req, res) => {
  try {
    const { name, location, price_range } = req.body;
    const results = await pool.query(
      'INSERT INTO restaurants (name, location, price_range) VALUES($1, $2, $3) RETURNING *',
      [name, location, price_range]
    );
    // 'RETURNING *' works for insert/update

    res
      .status(201)
      .json({ status: 'success', data: { restaurant: results.rows[0] } });
  } catch (err) {
    console.error(err.message);
  }
});

// get all restaurants

app.get('/api/v1/restaurants', async (req, res) => {
  try {
    const restaurantRatingsData = await pool.query(
      `SELECT * FROM restaurants LEFT JOIN 
        (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating), 1) AS average_rating 
          FROM reviews 
          GROUP BY restaurant_id) reviews 
        ON restaurants.id = reviews.restaurant_id`
    );

    res.status(200).json({
      status: 'success',
      results: restaurantRatingsData.rows.length,
      data: { restaurants: restaurantRatingsData.rows },
    });
  } catch (err) {
    console.error(err.message);
  }
});

// get a restaurant

app.get('/api/v1/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await pool.query(
      `SELECT * FROM restaurants LEFT JOIN 
          (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating), 1) AS average_rating 
            FROM reviews 
            GROUP BY restaurant_id) reviews 
          ON restaurants.id = reviews.restaurant_id
          WHERE id=$1`,
      [id]
    );

    const reviews = await pool.query(
      'SELECT * FROM reviews WHERE restaurant_id=$1',
      [id]
    );

    res.json({
      status: 'success',
      data: { restaurant: restaurant.rows[0], reviews: reviews.rows },
    });
  } catch (err) {
    console.error(err.message);
  }
});

// update a restaurant

app.put('/api/v1/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, price_range } = req.body;

    const results = await pool.query(
      'UPDATE restaurants SET name = $1, location = $2, price_range = $3 WHERE id = $4 RETURNING *',
      [name, location, price_range, id]
    );

    res
      .status(200)
      .json({ status: 'success', data: { restaurant: results.rows[0] } });
  } catch (err) {
    console.error(err.message);
  }
});

// delete a restaurant

// can't delete if it has review
// update or delete on table "restaurants" violates foreign key constraint "reviews_restaurant_id_fkey" on table "reviews"

app.delete('/api/v1/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteRestaurant = await pool.query(
      'DELETE FROM restaurants WHERE id = $1',
      [id]
    );

    res.status(204).json({ status: 'success' });
  } catch (err) {
    console.error(err.message);
  }
});

// reviews

// create a review for specified restaurant

app.post('/api/v1/restaurants/:id/addReview', async (req, res) => {
  try {
    const { id: restaurantId } = req.params;
    const { name, review, rating } = req.body;

    const results = await pool.query(
      'INSERT INTO reviews (restaurant_id, name, review, rating) VALUES($1, $2, $3, $4) RETURNING *',
      [restaurantId, name, review, rating]
    );
    // 'RETURNING *' works for insert/update

    res
      .status(201)
      .json({ status: 'success', data: { review: results.rows[0] } });
  } catch (err) {
    console.error(err.message);
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server has started on port ${port}.`);
});

// https://github.com/Sanjeev-Thiyagarajan/PERN-STACK-YELP-CLONE.git
// https://www.youtube.com/watch?v=J01rYl9T3BU
// PERN Stack Course - Build a Yelp clone (Postgres, Express, React, Node.js), 6:20 and Node 8/14/2020
