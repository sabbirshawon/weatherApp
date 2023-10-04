const db = require('./db');

const weatherDataSchema = {
  city: String,
  country: String,
  coordinates_lat: Number, 
  coordinates_lon: Number,
  weatherCondition: String,
  temperatureCelsius: Number,
  feelsLikeCelsius: Number,
  humidity: Number,
  windSpeedKmHour: Number,
  timestamp: {
    type: 'TIMESTAMP',
    default: 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  },
};

db.query(
  `CREATE TABLE IF NOT EXISTS WeatherData (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(255),
    country VARCHAR(20),
    coordinates_lat DECIMAL(9, 6),
    coordinates_lon DECIMAL(9, 6),
    weatherCondition VARCHAR(255),
    temperatureCelsius DECIMAL(5, 2),
    feelsLikeCelsius DECIMAL(5, 2),
    humidity DECIMAL(5, 2),
    windSpeedKmHour DECIMAL(5, 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  (err) => {
    if (err) {
      console.error('Error creating WeatherData table:', err);
    } else {
      console.log('WeatherData table created or already exists');
    }
  }
);

module.exports = weatherDataSchema;
