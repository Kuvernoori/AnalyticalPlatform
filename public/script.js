const apiUrl = 'http://localhost:3000/api/weather'; 

function fetchData(city) {
    const url = `${apiUrl}?city=${city}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            document.getElementById('temperature').textContent = `${data.temperature}°C`;
            document.getElementById('windSpeed').textContent = `${data.windSpeed} m/s`;
            document.getElementById('humidity').textContent = `${data.humidity}%`;
        })
        .catch(error => console.error('Error fetching data:', error));
}

document.getElementById('getWeatherBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        fetchData(city);
    } else {
        alert('Please enter a city name');
    }
});
