
const ctx = document.getElementById('myChart');

if (ctx) {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Hearing', 'Vision'],
            datasets: [{
                label: 'Tests Taken',
                data: [3, 2], // simple placeholder for now
            }]
        }
    });
}