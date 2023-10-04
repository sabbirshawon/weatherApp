const express = require('express');
const axios = require('axios');
const db = require('./db');
const WeatherData = require('./WeatherData');
const cron = require('node-cron');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const weatherApiUrl = 'http://api.openweathermap.org/data/2.5/weather';

const cities = [
    { name: 'Abu Dhabi', country: 'UAE', coordinates: { lat: 24.4667, lon: 54.3667 } },
    { name: 'Dubai', country: 'UAE', coordinates: { lat: 25.276987, lon: 55.296249 } },
    { name: 'Sharjah', country: 'UAE', coordinates: { lat: 25.3463, lon: 55.4209 } },
    { name: 'London', country: 'UK', coordinates: { lat: 51.5074, lon: -0.1278 } },
    { name: 'New York', country: 'USA', coordinates: { lat: 40.7128, lon: -74.0060 } },
    { name: 'Tokyo', country: 'Japan', coordinates: { lat: 35.682839, lon: 139.759455 } },
  ];
  
const apiKey = '';

const fetchAndStoreWeatherData = async () => {
  for (const city of cities) {
    try {
      const response = await axios.get(weatherApiUrl, {
        params: {
          lat: city.coordinates.lat,
          lon: city.coordinates.lon,
          appid: apiKey,
          units: 'metric', 
        },
      });

      const weatherData = {
        city: city.name,
        country: city.country,
        coordinates: city.coordinates,
        condition: response.data.weather[0].main,
        temperatureCelsius: response.data.main.temp,
        feelsLikeCelsius: response.data.main.feels_like,
        humidity: response.data.main.humidity,
        windSpeedKmHour: response.data.wind.speed,
      };

      db.query('INSERT INTO WeatherData (city, country, coordinates_lat, coordinates_lon, weatherCondition, temperatureCelsius, feelsLikeCelsius, humidity, windSpeedKmHour) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        weatherData.city,
        weatherData.country,
        weatherData.coordinates.lat,
        weatherData.coordinates.lon,
        weatherData.condition,
        weatherData.temperatureCelsius,
        weatherData.feelsLikeCelsius,
        weatherData.humidity,
        weatherData.windSpeedKmHour
      ], (err) => {
        if (err) {
          console.error(`Error inserting data for ${city.name}:`, err);
        } else {
          console.log(`Weather data for ${city.name} inserted into the database.`);
        }
      });

      

    } catch (error) {
      console.error(`Error fetching data for ${city.name}: ${error.message}`);
    }
  }
};

app.get('/api/weather', (req, res) => {
    db.query('SELECT * FROM WeatherData', (err, results) => {
      if (err) {
        console.error('Error retrieving weather data:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(results);
      }
    });
  });

// Schedule data fetching and storing every 10 minutes
cron.schedule('*/10 * * * *', fetchAndStoreWeatherData);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
