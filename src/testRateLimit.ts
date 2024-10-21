import http from 'http';

const makeRequest = (i: number) => {
  http.get('http://localhost:3000/', (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`Response ${i}: ${res.statusCode} - ${data}`);
      if (res.statusCode === 429) {
        console.log('Rate limit exceeded. Further requests will be rejected.');
      }
    });
  }).on('error', (err) => {
    console.error(`Error on request ${i}: ${err.message}`);
  });
};

const sendRequests = (count: number) => {
  for (let i = 0; i < count; i++) {
    makeRequest(i + 1);
  }
};

// Configura cuántas solicitudes deseas enviar
const numberOfRequests = 10; // Cambia este valor si lo necesitas
sendRequests(numberOfRequests);
