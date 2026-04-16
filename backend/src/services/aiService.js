const axios = require("axios");

async function getBatchPrediction(payload) {
  const baseUrl = process.env.AI_SERVICE_URL;
  if (!baseUrl) {
    throw new Error("AI_SERVICE_URL is not configured");
  }

  const { data } = await axios.post(`${baseUrl}/predict`, payload, {
    timeout: 8000,
  });

  return data;
}

module.exports = { getBatchPrediction };
