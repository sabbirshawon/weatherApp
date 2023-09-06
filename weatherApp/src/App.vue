<template>
  <div class="container mt-5">
    <div class="row">

      <div class="col col-12 col-md-7">
        <div class="weather-reports">
          <h2>Weather Reports</h2>
          <div class="row mt-5">
            <div v-for="(cityData, index) in weatherData" :key="index" class="mb-4 col-md-4">
              <div class="city-box p-3 rounded-lg">
                <h3>{{ cityData.city }}</h3>
                <p>{{ cityData.country }}</p>
                <div class="w-box">
                  <img :src="getWeatherIcon(cityData.weatherCondition)" class="mr-2 w-icon" alt="Weather Icon" />
                  <h2 class="temperature">{{ cityData.temperatureCelsius }}<sup>°C</sup></h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col col-12 col-md-5">
        <div class="statistics">

          <div class="row">
            <div class="col-md-6">
              <h2>Statistics</h2>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <select
                  id="citySelect"
                  class="form-control"
                  v-model="selectedCity"
                >
                  <option value="">Select a city</option>
                  <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="row mt-4">
            <div class="col-md-6">
              <h6>Temparature (Last 24 Hours)</h6>
            </div>
          </div>

          <div class="row mt-4">
            <div class="col-md-12">
              <canvas ref="temperatureChart" height="600px"></canvas>
            </div>
          </div>

          <div class="row mt-4">
            <div class="col-md-6">
              <h6>Wind (Last 24 Hours)</h6>
            </div>
          </div>

          <div class="row mt-4">
            <div class="col-md-12">
              <canvas ref="windChart" height="600px"></canvas>
            </div>
          </div>

          <div class="row mt-4">
            <div class="col-md-6">
              <h6>Humidity (Last 24 Hours)</h6>
            </div>
          </div>

          <div class="row mt-4">
            <div class="col-md-12">
              <canvas ref="humidityChart" height="600px"></canvas>
            </div>
          </div>
        
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import clearIcon from '@/assets/clear.svg'; 
import rainIcon from '@/assets/rain.svg';
import dustIcon from '@/assets/dust.svg';
import cloudIcon from '@/assets/cloud.svg';
import fogIcon from '@/assets/fog.svg';
import defaultIcon from '@/assets/default.svg';
import Chart from 'chart.js/auto';
import moment from 'moment';
import 'chartjs-adapter-moment';

export default {
  data() {
    return {
      weatherData: [],
      selectedCity: 'Abu Dhabi',
      cities: [],
      temperatureChart: null,
      windChart: null,
      humidityChart: null,
    };
  },

  computed: {
    uniqueCities() {
      const cities = [...new Set(this.weatherData.map(cityData => cityData.city))];
      return cities;
    },
  },

  mounted() {
    const apiUrl = 'http://localhost:3000/api/weather';

    axios
      .get(apiUrl)
      .then((response) => {
        this.weatherData = response.data;
        this.cities = this.uniqueCities;
        this.createTemperatureChart(); 
        this.createWindChart();
        this.createHumidityChart(); 
      })
      .catch((error) => {
        console.error('Error fetching weather data:', error);
      });
  },


  methods: {
    getWeatherIcon(condition) {
      switch (condition) {
        case 'Clear':
          return clearIcon;
        case 'Rain':
          return rainIcon;
        case 'Dust':
          return dustIcon;
        case 'Clouds':
          return cloudIcon;
        case 'Fog':
          return fogIcon;
        default:
          return defaultIcon;
      }
    },

    createTemperatureChart() {
      if (this.temperatureChart) {
        this.temperatureChart.destroy();
      }

      const selectedCity = this.selectedCity || 'Abu Dhabi';

      const selectedCityData = this.weatherData
        .filter((dataPoint) =>
          dataPoint.city === selectedCity &&
          moment(dataPoint.timestamp).isAfter(moment().subtract(24, 'hours'))
        )
        .sort((a, b) => moment(a.timestamp) - moment(b.timestamp));

      const labels = selectedCityData.map((dataPoint) =>
        moment(dataPoint.timestamp)
      );
      const temperatureData = selectedCityData.map(
        (dataPoint) => dataPoint.temperatureCelsius
      );

      const ctx = this.$refs.temperatureChart.getContext('2d');

      const data = {
        labels: labels,
        datasets: [
          {
            label: 'Temperature (°C)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            data: temperatureData,
          },
        ],
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour',
              stepSize: 2,
              min: moment().subtract(24, 'hours'),
              max: moment(),
              tooltipFormat: 'h:mm a',
            },
            title: {
              display: true,
              text: 'Time',
            },
          },
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Temperature (°C)',
            },
            ticks: {
              stepSize: 10,
              min: 10,
              max: 50,
            },
          },
        },

        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
      };

      this.temperatureChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options,
      });
    },


    createWindChart() {
      if (this.windChart) {
        this.windChart.destroy();
      }

      const selectedCity = this.selectedCity || 'Abu Dhabi';

      const selectedCityData = this.weatherData
        .filter((dataPoint) =>
          dataPoint.city === selectedCity &&
          moment(dataPoint.timestamp).isAfter(moment().subtract(24, 'hours'))
        )
        .sort((a, b) => moment(a.timestamp) - moment(b.timestamp));

      const labels = selectedCityData.map((dataPoint) =>
        moment(dataPoint.timestamp)
      );
      const windData = selectedCityData.map(
        (dataPoint) => dataPoint.windSpeedKmHour
      );

      const ctx = this.$refs.windChart.getContext('2d');

      const data = {
        labels: labels,
        datasets: [
          {
            label: 'Wind Speed (km/h)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            data: windData,
          },
        ],
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour',
              stepSize: 2,
              min: moment().subtract(24, 'hours'),
              max: moment(),
              tooltipFormat: 'h:mm a',
            },
            title: {
              display: true,
              text: 'Time',
            },
          },
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Wind Speed (km/h)',
            },
            ticks: {
              stepSize: 10,
              min: 0,
              max: 100, 
            },
          },
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
      };

      this.windChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options,
      });
    },

    createHumidityChart() {
      if (this.humidityChart) {
        this.humidityChart.destroy();
      }

      const selectedCity = this.selectedCity || 'Abu Dhabi';

      const selectedCityData = this.weatherData
        .filter((dataPoint) =>
          dataPoint.city === selectedCity &&
          moment(dataPoint.timestamp).isAfter(moment().subtract(24, 'hours'))
        )
        .sort((a, b) => moment(a.timestamp) - moment(b.timestamp));

      const labels = selectedCityData.map((dataPoint) =>
        moment(dataPoint.timestamp)
      );
      const humidityData = selectedCityData.map(
        (dataPoint) => dataPoint.humidity
      );

      const ctx = this.$refs.humidityChart.getContext('2d');

      const data = {
        labels: labels,
        datasets: [
          {
            label: 'Humidity (%)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            data: humidityData,
          },
        ],
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour',
              stepSize: 2,
              min: moment().subtract(24, 'hours'),
              max: moment(),
              tooltipFormat: 'h:mm a',
            },
            title: {
              display: true,
              text: 'Time',
            },
          },
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Humidity (%)',
            },
            ticks: {
              stepSize: 10,
              min: 0,
              max: 100, 
            },
          },
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
      };

      this.humidityChart = new Chart(ctx, {
        type: 'bar', 
        data: data,
        options: options,
      });
    },


  },

  watch: {
    selectedCity: function (newCity) {
      this.createTemperatureChart();
      this.createWindChart();
      this.createHumidityChart(); 
    },
  },

};
</script>

<style scoped>

  .weather-reports h2, .statistics h2 {
    font-size: 30px;
  }
  .city-box{
    background-color: #736099;
    border-radius: 20px;
    height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  .city-box h3 {
    color: #fff;
    font-size: 20px;
    margin-bottom: 0;
  }
  .city-box p{
    color: #fff;
    font-size: 18px;
  }

  .w-box{
    display: flex !important;
    align-items: center !important;
    justify-content: center;
    flex-direction: column;
  }

  h2.temperature{
    color: #EAE7F0;
    font-size: 40px;
    font-weight: 700;
  }

  h2.temperature sup{
    color: #8497C9;
    font-size: 24px;
  }
  .w-icon{
    width: 100px;
    height: 100px;
  }
</style>
