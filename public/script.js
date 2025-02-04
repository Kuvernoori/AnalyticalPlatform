const apiUrl = 'http://localhost:3000/api/weather';
const metricsUrl = 'http://localhost:3000/api/measurements/metrics';
const dataUrl = 'http://localhost:3000/api/measurements';

let chartInstance = null; 

function fetchMetrics(field, startDate, endDate) {
    const url = `${metricsUrl}?field=${field}&start_date=${startDate}&end_date=${endDate}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            document.getElementById('avg').textContent = data.avg;
            document.getElementById('min').textContent = data.min;
            document.getElementById('max').textContent = data.max;
            document.getElementById('stdDev').textContent = data.stdDev;
        })
        .catch(error => console.error('Error fetching metrics:', error));
}

function fetchChartData(field, startDate, endDate) {
    const url = `${dataUrl}?field=${field}&start_date=${startDate}&end_date=${endDate}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const timestamps = data.map(entry => entry.timestamp);
            const values = data.map(entry => entry[field]);
            renderChart(timestamps, values, field);
        })
        .catch(error => console.error('Error fetching chart data:', error));
}

function renderChart(labels, data, field) {
    const ctx = document.getElementById('chart').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${field} Data`,
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                }
            }
        }
    });
}

document.getElementById('getMetricsBtn').addEventListener('click', () => {
    const field = document.getElementById('field').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    if (startDate && endDate) fetchMetrics(field, startDate, endDate);
    else alert('Please select a valid date range');
});

document.getElementById('getChartBtn').addEventListener('click', () => {
    const field = document.getElementById('field').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    if (startDate && endDate) fetchChartData(field, startDate, endDate);
    else alert('Please select a valid date range');
});
