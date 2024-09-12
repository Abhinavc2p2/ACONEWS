const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// Define the default language for news API
const lang = "en";

// Example facts variable; replace with actual facts if needed
const facts = [];

// Error handling function
const handleError = (err, res) => {
    console.error('Error:', err.message);
    if (err.response) {
        console.error('Response Data:', err.response.data);
        console.error('Response Status:', err.response.status);
        console.error('Response Headers:', err.response.headers);
    } else if (err.request) {
        console.error('Request Data:', err.request);
    }
    return res.status(500).render('500error');
};

// Function to fetch news data from the API
const fetchNewsData = async (topic = '') => {
    try {
        const url = `https://gnews.io/api/v4/top-headlines?token=${process.env.APIKEY}&lang=${lang}${topic ? `&topic=${topic}` : ''}`;
        return await axios.get(url);
    } catch (error) {
        console.error('Error fetching news data:', error.message);
        throw error; // Re-throw the error to be caught by the route handler
    }
};

// Route to fetch and render news data for the homepage
router.get('/', async (req, res) => {
    try {
        const newsAPI = await fetchNewsData();
        res.render('usernews', { news: newsAPI.data, facts });
    } catch (err) {
        handleError(err, res);
    }
});

// Route to fetch and render news data based on topic
router.get('/news/:topic', async (req, res) => {
    const { topic } = req.params;
    try {
        const newsAPI = await fetchNewsData(topic);
        res.render('usernews', { news: newsAPI.data, facts });
    } catch (err) {
        handleError(err, res);
    }
});

// Search Route to handle POST requests for news search
router.post('/news/search', async (req, res) => {
    const { search } = req.body;
    if (!search) {
        return res.status(400).render('usernews', { news: null, facts });
    }
    try {
        const newsAPI = await axios.get(`https://gnews.io/api/v4/search?q=${encodeURIComponent(search)}&token=${process.env.APIKEY}&lang=${lang}`);
        res.render('usernews', { news: newsAPI.data, facts });
    } catch (err) {
        handleError(err, res);
    }
});

module.exports = router;
