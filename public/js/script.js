const socket = io();
console.log("Socket connected");

// Create the map with an initial view
const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Satyam Raaz"
}).addTo(map);

// Object to store markers for each connected user
const markers = {};

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log("My location:", latitude, longitude);

            // Send location to server
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

// Handle receiving location from other users
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    // Check if the marker for this user already exists
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        // Create a new marker if it doesn't exist
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Handle user disconnection and remove their marker
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]); // Remove the marker from the map
        delete markers[id]; // Delete the marker from the markers object
    }
});

// Optional: Center the map on your own location initially
socket.on("connect", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 16); // Center the map on your location
            },
            (error) => {
                console.error(error);
            }
        );
    }
});
