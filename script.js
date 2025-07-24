// Fetch sensor data and fill form
function loadSensorData() {
  fetch('/get-latest-sensor')
    .then(res => res.json())
    .then(data => {
      document.getElementById('heartRate').value = data.heartRate || '';
      document.getElementById('temperature').value = data.temperature || '';
      document.getElementById('ecg').value = data.ecg || '';
      document.getElementById('sugar').value = data.sugar || '';
      document.getElementById('bp').value = data.bp || '';
    });
}

// Submit patient data to backend
document.getElementById('patientForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = {
    name: document.getElementById('name').value,
    age: document.getElementById('age').value,
    gender: document.getElementById('gender').value
  };

  fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  }).then(res => {
    if (res.ok) {
      alert('Patient data saved to Excel!');
    } else {
      alert('Error saving data.');
    }
  });
});

// For "Next Patient" button
function nextPatient() {
  document.getElementById('patientForm').reset();  // clear text fields
  loadSensorData();  // fetch new sensor values
}

// Auto-load on page load
window.onload = loadSensorData;
