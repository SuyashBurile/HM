const express = require('express');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // ⬅️ Added axios for live ESP32 data fetch

const app = express();
const PORT = 3000;
const excelFile = 'patient_data.xlsx';

// Replace with your actual ESP32 IP
const ESP32_IP = 'http://192.168.1.50'; // ⬅️ Replace with your ESP32 IP

app.use(bodyParser.json());
app.use(express.static(__dirname));

// Temporary storage for sensor readings
let latestSensorData = {
  heartRate: '',
  temperature: '',
  ecg: '',
  sugar: '',
  bp: ''
};

// 🔐 Login credentials
const USERNAME = 'doctor';
const PASSWORD = '1234';

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    res.status(200).send('OK');
  } else {
    res.status(401).send('Unauthorized');
  }
});

// 🛰️ Receive data from ESP32 (optional if you fetch directly)
app.post('/sensor-data', (req, res) => {
  latestSensorData = req.body;
  console.log('Received sensor data:', latestSensorData);
  res.status(200).json({ message: 'Sensor data received successfully' });
});

// 🔁 Fetch latest data from ESP32 when "Next Patient" is clicked
app.get('/get-latest-sensor', async (req, res) => {
  try {
    const response = await axios.get(`${ESP32_IP}/sensor`); // ESP32 should respond with JSON
    latestSensorData = response.data;
    console.log('Fetched from ESP32:', latestSensorData);
    res.json(latestSensorData);
  } catch (error) {
    console.error('Error contacting ESP32:', error.message);
    res.status(500).json({ error: 'ESP32 not reachable' });
  }
});

// 📤 Submit and save patient + sensor data
app.post('/submit', async (req, res) => {
  const { name, age, gender } = req.body;

  const data = {
    name,
    age,
    gender,
    ...latestSensorData
  };

  let workbook;
  let worksheet;

  if (fs.existsSync(excelFile)) {
    workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFile);
    worksheet = workbook.getWorksheet(1);
  } else {
    workbook = new ExcelJS.Workbook();
    worksheet = workbook.addWorksheet('Patients');
    worksheet.columns = [
      { header: 'Name', key: 'name' },
      { header: 'Age', key: 'age' },
      { header: 'Gender', key: 'gender' },
      { header: 'Heart Rate', key: 'heartRate' },
      { header: 'Temperature', key: 'temperature' },
      { header: 'ECG', key: 'ecg' },
      { header: 'Sugar', key: 'sugar' },
      { header: 'BP', key: 'bp' },
    ];
  }

  worksheet.addRow(data);
  await workbook.xlsx.writeFile(excelFile);

  res.status(200).json({ message: 'Patient data saved successfully' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// 🟢 Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
