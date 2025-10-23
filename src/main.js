
import { meet } from '@googleworkspace/meet-addons/meet.addons';

const CLOUD_PROJECT_NUMBER = '418566026845';
const MAIN_STAGE_URL = "https://fcardia.github.io/meet_extension_example/dist/MainStage.html";

export async function setUpAddon() {
  console.log("Add-on set up!")
  const session = await meet.addon.createAddonSession({
    cloudProjectNumber: CLOUD_PROJECT_NUMBER,
  });
  const sidePanelClient = await session.createSidePanelClient();
  document
    .getElementById('start-activity')
    .addEventListener('click', async () => {
      await sidePanelClient.startActivity({ mainStageUrl: MAIN_STAGE_URL });
    });
}

export async function initializeMainStage() {
  const session = await meet.addon.createAddonSession({
    cloudProjectNumber: CLOUD_PROJECT_NUMBER,
  });
  await session.createMainStageClient();
}

export async function sendRequest() {
  const btn = document.getElementById("send-request");
  const output = document.getElementById("output");

  btn.onclick = async () => {
    const name = document.getElementById("name").value || "Sconosciuto";

    try {
      const response = await fetch("http://127.0.0.1:5000/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      output.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      output.textContent = "❌ Errore: " + err.message;
    }
  };
};

let socket;
let mediaRecorder;

export async function startStreaming() {

  if (socket && socket.readyState === WebSocket.OPEN) {
    console.warn("Connessione WebSocket già aperta");
    return;
  }

  socket = new WebSocket("ws://localhost:8000/ws");

  socket.onopen = async () => {
    console.log("🔗 Connessione WebSocket aperta");

    // Microphone permission
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Crea recorder
    mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm; codecs=opus" });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
        event.data.arrayBuffer().then(buffer => socket.send(buffer));
      }
    };

    mediaRecorder.start(1000); // invia chunk ogni 250 ms
    console.log("🎧 Streaming audio avviato");
  };

  // socket.onmessage = (event) => {
  //   document.getElementById("output").textContent += event.data + "\n";
  // };

  socket.onclose = () => {
    console.log("❌ Connessione WebSocket chiusa");
  };

  socket.onerror = (err) => {
    console.error("Errore WebSocket:", err);
  };
}

export function stopStreaming() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    console.log("🛑 Registrazione interrotta");
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }
}