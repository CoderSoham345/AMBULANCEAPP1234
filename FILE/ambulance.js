const callBtn = document.getElementById("callBtn");
const statusP = document.getElementById("status");
const instructions = document.getElementById("instructions");

callBtn.addEventListener("click", () => {
  statusP.textContent = "Obtaining location...";
  if (!navigator.geolocation) {
    statusP.textContent = "Geolocation not supported by browser.";
    return;
  }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const payload = {
      location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
      user: { name: "Unknown", phone: "Not provided" } // optionally collect
    };
    statusP.textContent = "Sending ambulance request...";
    try {
      const res = await fetch("/api/call-ambulance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        statusP.textContent = "Ambulance request sent. Help is on the way.";
        instructions.classList.remove("hidden");
      } else {
        statusP.textContent = "Failed: " + (data.message || "unknown");
      }
    } catch(err) {
      statusP.textContent = "Network error: " + err.message;
    }
  }, (err) => {
    statusP.textContent = "Location error: " + err.message;
  }, { enableHighAccuracy: true, timeout: 10000 });
});
