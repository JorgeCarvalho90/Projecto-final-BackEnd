const { Client } = require("@googlemaps/google-maps-services-js");

require('dotenv').config()

const client = new Client();

async function validateAddress(address) {
  try {
    const geoResponse = await client.geocode({
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (
      geoResponse.data.results &&
      geoResponse.data.results.length > 0
    ) {
      return {
        valid: true,
        formattedAddress: geoResponse.data.results[0].formatted_address,
        location: geoResponse.data.results[0].geometry.location
      };
    } else {
      return { valid: false, message: "Address not found" };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return { valid: false, message: "Failed to validate address" };
  }
}

module.exports = { validateAddress };
