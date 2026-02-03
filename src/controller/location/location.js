const {
    getEventLocation,
} = require("../../handler/location/location");





exports.GetLocations = async function (req, res) {
    try {
        const response = await getEventLocation(req);
        return res.status(response.responseCode).send(response);
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
