import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// --- CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyBNO8SiOBW49CqL7YgHd572pF9mikE7ABo",
    authDomain: "ecofootprint-9c4ed.firebaseapp.com",
    projectId: "ecofootprint-9c4ed",
    storageBucket: "ecofootprint-9c4ed.firebasestorage.app",
    messagingSenderId: "425267033599",
    appId: "1:425267033599:web:3554770c24a204594ba3ca",
    measurementId: "G-NCNFZTHKS4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- KONAMI CODE ENGINE ---
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiPosition = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === KONAMI_CODE[konamiPosition]) {
        konamiPosition++;
        if (konamiPosition === KONAMI_CODE.length) {
            triggerEasterEgg();
            konamiPosition = 0;
        }
    } else {
        konamiPosition = 0;
    }
});

function triggerEasterEgg() {
    const modal = document.getElementById('konami-modal');
    if (modal) modal.style.display = 'flex';
    document.body.classList.add('winner-mode');
    setTimeout(() => document.body.classList.remove('winner-mode'), 2000);
}

// --- APP LOGIC ---
window.onload = () => {
    // 1. Carbon Intensity API
    const fetchCarbonIntensity = async (zone) => {
        const valDisplay = document.getElementById("intensityValue");
        const meterFill = document.getElementById("intensityMeterFill");
        const statusDisplay = document.getElementById("intensityStatus");

        if (zone === "MARS") {
            valDisplay.innerText = "-42";
            if(meterFill) { meterFill.style.width = "100%"; meterFill.style.backgroundColor = "#ff4500"; }
            if(statusDisplay) { statusDisplay.innerText = "Elon approves. 🚀"; statusDisplay.style.color = "#ff4500"; }
            return;
        }

        try {
            const res = await fetch(`https://api.electricitymaps.com/v3/carbon-intensity/latest?zone=${zone}`, {
                method: "GET",
                headers: { "auth-token": "em_n3XyWvGUmEEhaaM7Qs9p4weDVx9yVMeJ" }
            });
            const data = await res.json();
            const intensity = data.carbonIntensity;
            
            valDisplay.innerText = intensity;
            const pct = Math.min((intensity / 800) * 100, 100);
            
            if (meterFill) meterFill.style.width = `${pct}%`;
            if (intensity < 250) { meterFill.style.backgroundColor = "var(--green)"; statusDisplay.innerText = "Grid is looking clean! 🌿"; }
            else if (intensity < 550) { meterFill.style.backgroundColor = "var(--yellow)"; statusDisplay.innerText = "Moderate emissions. 🤷‍♂️"; }
            else { meterFill.style.backgroundColor = "var(--red)"; statusDisplay.innerText = "High emissions. 🏭"; }
        } catch (err) {
            valDisplay.innerText = "N/A";
            statusDisplay.innerText = "API Blocked or Offline 😭";
        }
    };

    const regionDrop = document.getElementById("regionSelect");
    if (regionDrop) {
        regionDrop.addEventListener("change", (e) => fetchCarbonIntensity(e.target.value));
        fetchCarbonIntensity(regionDrop.value);
    }

    // 2. Quiz Logic
    document.getElementById("footprintForm").onsubmit = (e) => {
        e.preventDefault();
        const score = ['q1', 'q2', 'q3', 'q4', 'q5'].reduce((acc, id) => acc + Number(document.getElementById(id).value), 0);
        
        addDoc(collection(db, 'simulatorScores'), { score, date: serverTimestamp() });

        // Logic display (simplified)
        document.getElementById('footprintForm').style.display = 'none';
        document.getElementById("resultBox").style.display = 'block';
        document.getElementById("scoreText").innerText = score;
    };

    // 3. Live Board
    onSnapshot(query(collection(db, "listedItems"), orderBy("timestamp", "desc")), (snapshot) => {
        const board = document.getElementById('live-board');
        const list = document.getElementById('claimed-list');
        board.innerHTML = "";
        list.innerHTML = "";

        snapshot.forEach((docSnap) => {
            const item = docSnap.data();
            if (item.status === "claimed") {
                list.innerHTML += `<li>✅ <strong>${item.name}</strong> taken by ${item.claimedBy}</li>`;
            } else {
                board.innerHTML += `<div class='item-card'><h3>${item.name}</h3><button onclick='claimIt("${docSnap.id}")'>CLAIM</button></div>`;
            }
        });
    });
};

// Global scope for HTML button attributes
window.claimIt = async (id) => {
    const name = prompt("Enter your name:");
    if (!name) return;
    await updateDoc(doc(db, "listedItems", id), { status: "claimed", claimedBy: name });
};
