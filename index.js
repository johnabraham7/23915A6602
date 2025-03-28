require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

let windowSize = 10;
let storedNumbers = [];

const TEST_SERVER_URL = "http://20.244.56.144";
const ACCESS_TOKEN = "XytvvM"; 


const fetchNumbers = async (type) => {
  try {
    const response = await axios.get(`${TEST_SERVER_URL}/numbers/${type}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      timeout: 500, 
    });

    return response.data.numbers;
  } catch (error) {
    console.error("Error fetching numbers:", error.message);
    return [];
  }
};


const updateStoredNumbers = (newNumbers) => {
  newNumbers.forEach((num) => {
    if (!storedNumbers.includes(num)) {
      storedNumbers.push(num);
      if (storedNumbers.length > windowSize) {
        storedNumbers.shift(); 
      }
    }
  });
};


const calculateAverage = () => {
  if (storedNumbers.length === 0) return 0;
  const sum = storedNumbers.reduce((acc, num) => acc + num, 0);
  return (sum / storedNumbers.length).toFixed(2);
};


app.get("/numbers/:type", async (req, res) => {
  const { type } = req.params;
  const validTypes = ["p", "f", "e", "r"]; 

  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: "Invalid type. Use p, f, e, or r." });
  }

  const prevState = [...storedNumbers];
  const newNumbers = await fetchNumbers(type);
  updateStoredNumbers(newNumbers);
  const avg = calculateAverage();

  res.json({
    windowPrevState: prevState,
    windowCurrState: storedNumbers,
    avg: avg,
  });
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
