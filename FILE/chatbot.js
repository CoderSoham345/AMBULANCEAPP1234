const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send");
const findDoctorBtn = document.getElementById("findDoctor");

function append(msg, cls="bot") {
  const el = document.createElement("div");
  el.style.padding = "8px 6px";
  el.style.margin = "6px 0";
  el.textContent = msg;
  if (cls === "user") el.style.textAlign = "right";
  chatbox.appendChild(el);
  chatbox.scrollTop = chatbox.scrollHeight;
}

sendBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();
  if (!text) return;
  append("You: " + text, "user");
  messageInput.value = "";
  append("Bot: ...");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    chatbox.lastChild.textContent = "Bot: " + (data.reply || data.message);
  } catch(err) {
    chatbox.lastChild.textContent = "Bot: Network error.";
  }
});

findDoctorBtn.addEventListener("click", () => {
  if (!navigator.geolocation) { append("Browser doesn't support geolocation"); return; }
  append("Looking up nearest doctors...");
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const res = await fetch("/api/find-doctor", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ location: { lat: pos.coords.latitude, lng: pos.coords.longitude } })
      });
      const data = await res.json();
      if (data.success) {
        append("Nearest doctors:");
        data.doctors.forEach(d => append(`${d.name} — ${d.phone} — ${d.distance_km} km`));
      } else {
        append("Failed to load doctors: " + data.message);
      }
    } catch(err) {
      append("Network error: " + err.message);
    }
  }, (err) => {
    append("Location error: " + err.message);
  });
});
