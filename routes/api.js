const express = require('express');
const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const Measurement = require(path.join(__dirname, '..', 'models', 'measurement'));

const router = express.Router();

const apiKey = process.env.OPENWEATHER_API_KEY;

router.get('/weather', async (req, res) => {
    const city = req.query.city;

    if (!city) {
        return res.status(400).json({ error: 'City is not specified' });
    }

    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=en`);
        const weatherData = {
            temperature: response.data.main.temp,
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind.speed,
        };

        const newMeasurement = new Measurement(weatherData);
        await newMeasurement.save();

        res.json(weatherData);
    } catch (error) {
        console.error('Error fetching data from OpenWeather:', error);
        res.status(500).json({ error: 'Failed to get weather data' });
    }
});

router.get('/measurements', async (req, res) => {
    const { start_date, end_date, field } = req.query;

    if (!field) {
        return res.status(400).json({ error: 'Field must be specified' });
    }

    const startDate = start_date ? new Date(start_date) : new Date(0);
    const endDate = end_date ? new Date(end_date) : new Date();
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
    }

    try {
        const query = {
            timestamp: {
                $gte: startDate,
                $lte: endDate
            }
        };

        const measurements = await Measurement.find(query).select(`timestamp ${field}`);

        if (measurements.length === 0) {
            return res.status(404).json({ error: 'No data available' });
        }

        res.json(measurements.map(item => ({
            timestamp: item.timestamp.toISOString(),
            [field]: item[field]
        })));
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

router.get('/measurements/metrics', async (req, res) => {
    const { field, start_date, end_date } = req.query;

    if (!field) {
        return res.status(400).json({ error: 'Field (temperature, humidity, or windSpeed) must be specified' });
    }

    const startDate = start_date ? new Date(start_date) : new Date(0);
    const endDate = end_date ? new Date(end_date) : new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
    }

    try {
        const query = {
            timestamp: { 
                $gte: startDate,
                $lte: endDate
            }
        };

        const measurements = await Measurement.find(query).select(field);

        if (measurements.length === 0) {
            return res.status(404).json({ error: 'No data for analysis' });
        }

        const values = measurements.map(item => item[field]).filter(Number.isFinite);

        if (!values.length) {
            return res.status(404).json({ error: 'No valid data for analysis' });
        }

        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const stdDev = Math.sqrt(values.reduce((sum, val) => sum + (val - avg) ** 2, 0) / values.length);

        res.json({
            avg: avg.toFixed(2),
            min,
            max,
            stdDev: stdDev.toFixed(2)
        });
    } catch (error) {
        console.error('Error fetching measurement data for metrics:', error);
        res.status(500).json({ error: 'Failed to fetch measurement data for metrics' });
    }
});

router.post('/measurements', async (req, res) => {
    const { temperature, humidity, windSpeed, timestamp } = req.body;

    if (!temperature || !humidity || !windSpeed || !timestamp) {
        return res.status(400).json({ error: 'All fields (temperature, humidity, windSpeed, timestamp) must be specified' });
    }

    try {
        const newMeasurement = new Measurement({
            temperature,
            humidity,
            windSpeed,
            timestamp,
        });

        await newMeasurement.save();
        res.status(201).json(newMeasurement);
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

module.exports = router;
