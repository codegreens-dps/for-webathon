import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, serverTimestamp, limit } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* DO NOT TOUCH CONFIG OR DB EXPLODES */
var conf = {apiKey:"AIzaSyBNO8SiOBW49CqL7YgHd572pF9mikE7ABo",authDomain:"ecofootprint-9c4ed.firebaseapp.com",projectId:"ecofootprint-9c4ed",storageBucket:"ecofootprint-9c4ed.firebasestorage.app",messagingSenderId:"425267033599",appId:"1:425267033599:web:3554770c24a204594ba3ca",measurementId:"G-NCNFZTHKS4"};
var firebaseApp = initializeApp(conf), database = getFirestore(firebaseApp);

function cln(s){ if(!s)return""; var d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

/* --- KONAMI CODE --- */
const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']; 
let konamiPosition = 0;
document.addEventListener('keydown', function(e) {
    const pressedKey = e.key.toLowerCase(), expectedKey = konamiCode[konamiPosition];
    if (pressedKey === expectedKey) {
        konamiPosition++;
        if (konamiPosition === konamiCode.length) {
            document.getElementById('konami-modal').style.display = 'flex'; document.body.classList.add('winner-mode');
            setTimeout(() => { document.body.classList.remove('winner-mode'); document.getElementById('konami-modal').style.display = 'none'; }, 5000);
            konamiPosition = 0;
        }
    } else konamiPosition = 0;
});

window.onload = function() {
    /* --- Electricity Maps API --- */
    var fetchCarbonIntensity = async function(zone) {
        var valDisplay = document.getElementById("intensityValue"), meterFill = document.getElementById("intensityMeterFill"), statusDisplay = document.getElementById("intensityStatus");
        if(zone === "MARS") { valDisplay.innerText = "-42"; if(meterFill) { meterFill.style.width = "100%"; meterFill.style.backgroundColor = "#ff4500"; } if(statusDisplay) { statusDisplay.innerText = "Elon approves. 100% Nuclear/Solar. 🚀"; statusDisplay.style.color = "#ff4500"; } return; }
        valDisplay.innerText = "Loading..."; if(meterFill) meterFill.style.width = "0%";
        try {
            var data = await (await fetch("./data/" + zone + ".json")).json();
            if (data && data.carbonIntensity !== null) {
                var intensity = data.carbonIntensity; valDisplay.innerText = intensity;
                if(meterFill && statusDisplay) {
                    var pct = Math.min((intensity / 800) * 100, 100); meterFill.style.width = pct + "%";
                    if(intensity < 250) { meterFill.style.backgroundColor = "var(--green)"; statusDisplay.innerText = "Grid is looking clean today! 🌿"; statusDisplay.style.color = "var(--green)"; } 
                    else if(intensity < 550) { meterFill.style.backgroundColor = "var(--yellow)"; statusDisplay.innerText = "Moderate emissions. Meh. 🤷‍♂️"; statusDisplay.style.color = "var(--yellow)"; } 
                    else { meterFill.style.backgroundColor = "var(--orange)"; statusDisplay.innerText = "Grid is literally coughing smog. 🏭"; statusDisplay.style.color = "var(--orange)"; }
                }
            }
        } catch (err) { valDisplay.innerText = "N/A"; if(statusDisplay) statusDisplay.innerText = "Sync failure on cloud assets 💀"; }
    };
    var regionDrop = document.getElementById("regionSelect");
    if (regionDrop) { regionDrop.addEventListener("change", (e) => fetchCarbonIntensity(e.target.value)); fetchCarbonIntensity(regionDrop.value); }

    /* --- SIMULATOR LOGIC --- */
    document.getElementById("footprintForm").onsubmit = function(e) {
        e.preventDefault(); 
        var summ = (document.getElementById('q1').value*1) + (document.getElementById('q2').value*1) + (document.getElementById('q3').value*1) + (document.getElementById('q4').value*1) + (document.getElementById('q5').value*1);
        addDoc(collection(database, 'simulatorScores'), { score: summ, date: serverTimestamp() });
        var fb = document.getElementById("feedbackText"), emj = "", col = "", displayScore = summ;
        if(summ < 0) { emj="🛸"; col="var(--purple)"; displayScore = "ERROR: 999"; summ = 100; fb.innerText="🌌 WAIT WHAT. You unlocked alien teleportation technology!"; fb.style.color="var(--purple)"; } 
        else if(summ>79) { emj="🌍"; col="var(--green)"; fb.innerText="🔥 INCREDIBLE! Net-Zero path achieved."; fb.style.color="var(--green)"; } 
        else if(summ>39) { emj="⚠️"; col="var(--yellow)"; fb.innerText="🌱 A GOOD START. Systemic shifts needed."; fb.style.color="var(--yellow)"; } 
        else { emj="❌"; col="var(--orange)"; fb.innerText="🚨 DISASTER. Immediate policy shifts required."; fb.style.color="var(--orange)"; }
        document.getElementById("resultEmoji").innerText = emj; document.getElementById('footprintForm').style.display='none'; document.getElementById("resultBox").style.display='block';
        if(displayScore === "ERROR: 999") { document.getElementById("scoreText").innerText = displayScore; } else { let c=0; let tmr = setInterval(() => { if(c>=summ) clearInterval(tmr); document.getElementById("scoreText").innerText=c++; }, 20); }
        setTimeout(() => { document.getElementById("barFill").style.width=summ+"%"; document.getElementById("barFill").style.backgroundColor=col; }, 150); 
    };

    /* --- BOARD LOGIC --- */
    onSnapshot(query(collection(database, "listedItems"), orderBy("timestamp", "desc"), limit(30)), function(s) {
        var b = document.getElementById('live-board'), l = document.getElementById('claimed-list');
        b.innerHTML=""; l.innerHTML=""; var i_c=0, c_c=0;
        s.forEach((d) => {
            var o = d.data(), iid = d.id;
            if(o.status=="claimed") { c_c++; l.innerHTML += "<li>✅ <strong>"+cln(o.name)+"</strong> claimed by "+cln(o.claimedBy)+"!</li>"; } 
            else { i_c++; b.innerHTML += "<div class='item-card'><div class='card-icon'>"+o.icon+"</div><h3>"+cln(o.name)+"</h3><p>Listed by: "+cln(o.lister)+"</p><button class='grab-btn' id='btn-"+iid+"' onclick='claimIt(\""+iid+"\")'>CLAIM ⚡</button></div>"; }
        });
        var el = document.getElementById('landfillCounter'); 
        if(el) el.innerHTML = c_c + "<div style='font-size: 0.35em; color: var(--yellow); margin-top: 12px; font-family: monospace;'>~" + (c_c * 4.5).toFixed(1) + " kg CO₂ saved!</div>";
    });

    document.getElementById('addItemForm').onsubmit = function(ev) {
        ev.preventDefault(); var btn = document.querySelector(".post-btn"); btn.innerText="UPLOADING..."; 
        addDoc(collection(database, "listedItems"), { name: document.getElementById('newItemName').value, icon: document.getElementById('newItemIcon').value, lister: document.getElementById('newListerName').value, description: document.getElementById('newItemDesc').value, status: "available", timestamp: serverTimestamp() }).then(() => { alert("Item Live!"); document.getElementById('addItemForm').reset(); btn.innerText="LIST ITEM 📌"; });
    };
};

window.claimIt = (id) => {
    var un = prompt("♻️ Enter your name:"); if(!un) return; 
    var btn = document.getElementById("btn-"+id); if(btn) { btn.innerText="CLAIMED!"; btn.disabled=true; }
    setTimeout(() => updateDoc(doc(database, "listedItems", id), { status:"claimed", claimedBy: un }), 800);
};

window.resetQuiz = () => {
    document.getElementById("footprintForm").reset(); document.getElementById("resultBox").style.display="none"; document.getElementById("footprintForm").style.display="block"; 
    window.scrollTo({ top: document.getElementById('sim').offsetTop, behavior: 'smooth' }); 
};

window.activateWinnerProtocol = () => {
    document.body.classList.add("winner-mode");
    var b = document.createElement('div'); b.className = 'victory-banner'; b.innerHTML = '<h1 style="font-family:\'Orbitron\';font-size:5rem;color:#fff;">HACKATHON WINNERS! 🏆</h1>'; document.body.appendChild(b);
    setTimeout(() => { if (b.parentNode) b.remove(); document.body.classList.remove("winner-mode"); }, 5000);
};

window.printReport = () => window.print();
