const axios = require("axios");



exports.getEventLocation = async (req, res) => {
    const { search } = req.body;
  
    try {
      // Validate search parameter
      if (!search || search.trim() === "") {
        return {
          success: false,
          responseCode: 400,
          message: "Search parameter is required",
        };
      }
  
      // Check if API key is available
      if (!process.env.GOOGLE_PLACES_API_KEY) {
        return {
          success: false,
          responseCode: 500,
          message: "Google Places API key not configured",
        };
      }
  
      // Google Places API Text Search endpoint
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
  
      const params = {
        query: search.trim(),
        key: apiKey,
        fields: "place_id,name,formatted_address,geometry,address_components",
      };
  
      // Make API request
      const response = await axios.get(url, { params });
  
      if (
        response.data.status !== "OK" &&
        response.data.status !== "ZERO_RESULTS"
      ) {
        return {
          success: false,
          responseCode: 500,
          message: `Google Places API Error: ${response.data.status}`,
          error: response.data.error_message || "Unknown API error",
        };
      }
  
      if (!response.data.results || response.data.results.length === 0) {
        return {
          success: false,
          responseCode: 404,
          message: "No locations found",
        };
      }
  
      // Format the response data
      const locations = response.data.results.map((place) => {
        // Extract address components
        const addressComponents = place.address_components || [];
        let street = "";
        let city = "";
        let state = "";
        let country = "";
        let postalCode = "";
  
        addressComponents.forEach((component) => {
          const types = component.types;
          if (types.includes("street_number") || types.includes("route")) {
            street += component.long_name + " ";
          } else if (
            types.includes("locality") ||
            types.includes("administrative_area_level_2")
          ) {
            city = component.long_name;
          } else if (types.includes("administrative_area_level_1")) {
            state = component.long_name;
          } else if (types.includes("country")) {
            country = component.long_name;
          } else if (types.includes("postal_code")) {
            postalCode = component.long_name;
          }
        });
  
        return {
          place_id: place.place_id,
          name: place.name,
          formatted_address: place.formatted_address,
          street: street.trim(),
          city: city,
          state: state,
          country: country,
          postal_code: postalCode,
          coordinates: {
            lat: place.geometry?.location?.lat || null,
            lng: place.geometry?.location?.lng || null,
          },
        };
      });
  
      return {
        success: true,
        responseCode: 200,
        message: "Locations fetched successfully",
        data: {
          search_query: search,
          results_count: locations.length,
          locations: locations,
        },
      };
    } catch (error) {
      console.error("Google Places API Error:", error);
      return {
        success: false,
        responseCode: 500,
        message: "Failed to fetch locations",
        error: error.message,
      };
    }
  };