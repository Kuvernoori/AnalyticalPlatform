const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true
    },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    windSpeed: { type: Number, required: true }, 
}, { timestamps: true });

module.exports = mongoose.model('Measurement', measurementSchema);
