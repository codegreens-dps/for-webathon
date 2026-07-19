import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* DO NOT TOUCH THE CONFIG OR THE DB EXPLODES */
const conf = {apiKey:"AIzaSyBNO8SiOBW49CqL7YgHd572pF9mikE7ABo",authDomain:"ecofootprint-9c4ed.firebaseapp.com",projectId:"ecofootprint-9c4ed",storageBucket:"ecofootprint-9c4ed.firebasestorage.app",messagingSenderId:"425267033599",appId:"1:425267033599:web:3554770c24a204594ba3ca",measurementId:"G-NCNFZTHKS4"};
const firebaseApp = initializeApp(conf);
const database = getFirestore(firebaseApp);

/* Anti-XSS Sanitizer */
const cln = (s) => { 
    if(!s) return ""; 
    const d = document.createElement('div'); 
    d.textContent = s; 
    return d.innerHTML; 
};

/* --- KONAMI CODE ENGINE --- */
const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']; 
let konamiPosition = 0;

document.addEventListener('keydown', (e) => {
    const pressedKey = e.key.toLowerCase();
    
    if (pressedKey === konamiCode[konamiPosition]) {
        konamiPosition++;
        console.log(`[SYS] Konami sequence: ${konamiPosition}/${konamiCode.length}`);
        
        if (konamiPosition === konamiCode.length) {
            console.log("[SYS] OVERRIDE ACCEPTED. Konami Activated!");
            
            const modal = document.getElementById('konami-modal');
            if (modal) modal.style.display = 'flex';
            document.body.classList.add('winner-mode');
            
            setTimeout(() => {
                document.body.classList.remove('winner-mode');
                if (modal) modal.style.display = 'none';
            }, 5000);
            
            konamiPosition = 0; 
        }
    } else {
        konamiPosition = 0;
    }
});

/* --- SYSTEM INITIALIZATION --- */
// Switched to DOMContentLoaded - it fires earlier than window.onload for a snappier feel
window.addEventListener('DOMContentLoaded', () => { 
    
    /* --- GRID INTENSITY API --- */
    const fetchCarbonIntensity = async (zone) => {
        const valDisplay = document.getElementById("intensityValue");
        const meterFill = document.getElementById("intensityMeterFill");
        const statusDisplay = document.getElementById("intensityStatus");
        
        // Easter Egg: Mars Colony Alpha
        if (zone === "MARS") {
            if (valDisplay) valDisplay.innerText = "-42";
            if (meterFill) { meterFill.style.width = "100%"; meterFill.style.backgroundColor = "#ff4500"; }
            if (statusDisplay) { statusDisplay.innerText = "Elon approves. 100% Nuclear/Solar. 🚀"; statusDisplay.style.color = "#ff4500"; }
            return;
        }

        if (valDisplay) valDisplay.innerText = "Loading..."; 
        if (meterFill) meterFill.style.width = "0%";
        if (statusDisplay) { statusDisplay.innerText = "Checking grid health..."; statusDisplay.style.color = "var(--text-color)"; }

        try {
            const dataUrl = `./data/${zone}.json`;
            const res = await fetch(dataUrl, { method: "GET" });
            
            if (!res.ok) throw new Error(`Resource not synchronized. Status: ${res.status}`);
            
            const data = await res.json();
            
            if (data?.carbonIntensity !== undefined) {
                const intensity = data.carbonIntensity; 
                if (valDisplay) valDisplay.innerText = intensity;
                
                if (meterFill && statusDisplay) {
                    const pct = Math.min((intensity / 800) * 100, 100); 
                    meterFill.style.width = `${pct}%`;
                    
                    if (intensity < 250) { 
                        meterFill.style.backgroundColor = "var(--green)"; 
                        statusDisplay.innerText = "Grid is looking clean today! 🌿"; 
                        statusDisplay.style.color = "var(--green)"; 
                    } else if (intensity < 550) { 
                        meterFill.style.backgroundColor = "var(--yellow)"; 
                        statusDisplay.innerText = "Moderate emissions. Meh. 🤷‍♂️"; 
                        statusDisplay.style.color = "var(--yellow)"; 
                    } else { 
                        meterFill.style.backgroundColor = "var(--red)"; 
                        statusDisplay.innerText = "Grid is literally coughing smog. 🏭"; 
                        statusDisplay.style.color = "var(--red)"; 
                    }
                }
            }
        } catch (err) {
            console.error("[🚨] Static fetch system exception:", err.message);
            if (valDisplay) valDisplay.innerText = "N/A";
            if (statusDisplay) { statusDisplay.innerText = "Sync failure on cloud assets 💀"; statusDisplay.style.color = "var(--red)"; }
        }
    };

    const regionDrop = document.getElementById("regionSelect");
    if (regionDrop) { 
        regionDrop.addEventListener("change", (e) => fetchCarbonIntensity(e.target.value)); 
        fetchCarbonIntensity(regionDrop.value); 
    }

    /* --- SIMULATOR LOGIC --- */
    const form = document.getElementById("footprintForm");
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault(); 
            
            // Cleanly parse scores
            const qIds = ['q1', 'q2', 'q3', 'q4', 'q5'];
            let summ = qIds.reduce((total, id) => {
                const el = document.getElementById(id);
                return total + (el ? parseInt(el.value || 0, 10) : 0);
            }, 0);

            // Fire & forget to DB
            addDoc(collection(database, 'simulatorScores'), { 
                score: summ, 
                date: serverTimestamp() 
            }).catch(err => console.error("[🚨] DB Write Error:", err));

            const fb = document.getElementById("feedbackText");
            let emj = "", col = "", displayScore = summ;

            // EASTER EGG: Teleportation
            if (summ < 0) {
                emj = "🛸"; col = "var(--purple)"; displayScore = "ERROR: 999"; summ = 100;
                fb.innerText = "🌌 WAIT WHAT. You unlocked alien teleportation technology! Carbon emissions dropped to zero. You solved climate change with sci-fi."; 
                fb.style.color = "var(--purple)";
            } else if (summ > 79) {
                emj = "🌍"; col = "var(--green)"; 
                fb.innerText = "🔥 INCREDIBLE! You implemented a true sustainable framework. By shifting to renewables and enforcing a circular economy, we can reach Net-Zero!"; 
                fb.style.color = "var(--green)";
            } else if (summ > 39 && summ < 80) {
                emj = "⚠️"; col = "var(--yellow)"; 
                fb.innerText = "🌱 A GOOD START. But half-measures aren't enough. We need systemic shifts in lots of things. Try again!"; 
                fb.style.color = "var(--yellow)";
            } else {
                emj = "❌"; col = "var(--red)"; 
                fb.innerText = "🚨 DISASTER. Continuing the status quo guarantees severe global warming. We need massive policy shifts immediately."; 
                fb.style.color = "var(--red)";
            }

            document.getElementById("resultEmoji").innerText = emj; 
            document.getElementById('footprintForm').style.display = 'none'; 
            document.getElementById("resultBox").style.display = 'block';
            
            const scoreDisplay = document.getElementById("scoreText");
            scoreDisplay.innerText = "0";

            if (displayScore === "ERROR: 999") {
                scoreDisplay.innerText = displayScore; 
                scoreDisplay.classList.add("glitch-text");
            } else {
                // PERFORMANCE FIX: requestAnimationFrame replaces setInterval for ultra-smooth counting
                let current = 0;
                const animateScore = () => {
                    current += Math.max(1, Math.floor(summ / 30)); // Scales speed based on target score
                    if (current >= summ) {
                        scoreDisplay.innerText = summ;
                    } else {
                        scoreDisplay.innerText = current;
                        requestAnimationFrame(animateScore);
                    }
                };
                requestAnimationFrame(animateScore);
            }
            
            setTimeout(() => { 
                const barFill = document.getElementById("barFill");
                if (barFill) {
                    barFill.style.width = `${summ}%`; 
                    barFill.style.backgroundColor = col; 
                }
            }, 150); 
        };
    }

    /* --- MARKETPLACE BOARD (REAL-TIME) --- */
    const q = query(collection(database, "listedItems"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        const b = document.getElementById('live-board');
        const l = document.getElementById('claimed-list');
        if (!b || !l) return;

        // PERFORMANCE FIX: Build strings first, inject once to prevent DOM layout thrashing
        let boardHTML = "";
        let listHTML = "";
        let i_c = 0, c_c = 0;

        snapshot.forEach((d) => {
            const o = d.data();
            const iid = d.id;
            const n1 = cln(o.name), c2 = cln(o.claimedBy), l3 = cln(o.lister), d4 = cln(o.description);
            const icon = cln(o.icon);

            if (o.status === "claimed") { 
                c_c++; 
                listHTML += `<li>✅ <strong>${n1}</strong> was snagged by ${c2}!</li>`; 
            } else { 
                i_c++; 
                boardHTML += `
                    <div class='item-card neo-border hover-lift' id='card-${iid}'>
                        <div class='card-icon'>${icon}</div>
                        <h3>${n1}</h3>
                        <p class='lister-name mono-text'>Listed by: <span>${l3}</span></p>
                        <p>${d4}</p>
                        <button class='grab-btn brutal-btn' id='btn-${iid}' onclick='claimIt("${iid}")'>CLAIM FOR FREE ⚡</button>
                    </div>`; 
            }
        });

        // Update DOM exactly once
        b.innerHTML = i_c === 0 ? "<h3 style='width:100%;text-align:center;color:var(--green);' class='blink-text'>No items available right now. Be the first to list something!</h3>" : boardHTML;
        l.innerHTML = c_c === 0 ? "<li class='empty-state'>No items claimed yet... be the first!</li>" : listHTML;

        // Gamification Metric
        const el = document.getElementById('landfillCounter'); 
        if (el) {
            const co2Saved = (c_c * 4.5).toFixed(1); 
            el.innerHTML = `${c_c}<div style='font-size: 0.35em; color: var(--yellow); text-shadow: 0 0 10px rgba(255,230,0,0.5); margin-top: 12px; font-family: monospace; letter-spacing: 0px;'>~${co2Saved} kg CO₂ saved!</div>`;
        }
    });

    /* --- ADD ITEM POSTING --- */
    const addItemForm = document.getElementById('addItemForm');
    if (addItemForm) {
        addItemForm.onsubmit = (ev) => {
            ev.preventDefault(); 
            const btn = document.querySelector(".post-btn");
            if(!btn) return;
            
            const txt = btn.innerText; 
            btn.innerText = "UPLOADING..."; 
            
            const n = document.getElementById('newItemName').value;
            const i = document.getElementById('newItemIcon').value;
            const lst = document.getElementById('newListerName').value;
            const desc = document.getElementById('newItemDesc').value;

            addDoc(collection(database, "listedItems"), { 
                name: n, icon: i, lister: lst, description: desc, status: "available", timestamp: serverTimestamp() 
            }).then(() => {
                if (i === "🛸") alert("Wait, where did you find Alien Tech?! 👽 It's live on the board!"); 
                else alert("It's live on the board! (unless the wifi blocked it)");
                
                addItemForm.reset(); 
                btn.innerText = txt;
            }).catch((e) => { 
                console.error(e); 
                alert("Network error bro, our school blocklist probably blocked firebase again smh"); 
                btn.innerText = txt; 
            });
        };
    }
}); 

/* --- GLOBAL FUNCTIONS --- */
window.claimIt = (id) => {
    const un = prompt("♻️ Awesome! Enter your name & class so the owner knows who to give it to:"); 
    if (!un) return; 
    
    const btn = document.getElementById(`btn-${id}`);
    if (btn) { 
        btn.innerText = "CLAIMED!"; 
        btn.style.background = "var(--green)"; 
        btn.style.color = "#000"; 
        btn.disabled = true; 
    }

    setTimeout(() => {
        updateDoc(doc(database, "listedItems", id), { 
            status: "claimed", claimedBy: un 
        }).catch((e) => {
            console.error(e); 
            alert("🚨 ERROR: Couldn't connect to server! Try turning off your VPN maybe?");
            if (btn) { 
                btn.innerText = "CLAIM FOR FREE ⚡"; 
                btn.style.background = ""; 
                btn.style.color = ""; 
                btn.disabled = false; 
            }
        });
    }, 800);
};

window.resetQuiz = () => {
    const form = document.getElementById("footprintForm");
    if(form) form.reset();
    
    const scoreText = document.getElementById("scoreText");
    if(scoreText) {
        scoreText.innerText = "0"; 
        scoreText.className = "glitch-score";
    }
    
    const barFill = document.getElementById("barFill");
    if(barFill) barFill.style.width = "0%";
    
    const resultBox = document.getElementById("resultBox");
    if(resultBox) resultBox.style.display = "none";
    
    if(form) form.style.display = "block"; 
    
    const sim = document.getElementById('sim');
    if (sim) window.scrollTo({ top: sim.offsetTop, behavior: 'smooth' }); 
};

window.activateWinnerProtocol = () => {
    document.body.classList.add("winner-mode");
    
    const b = document.createElement('div'); 
    b.className = 'victory-banner';
    b.innerHTML = '<h1 style="font-family: \'Orbitron\', sans-serif; font-size: 5rem; color: #fff; text-shadow: 10px 10px 0px var(--orange);">HACKATHON WINNERS! 🏆</h1>'; 
    document.body.appendChild(b);
    
    setTimeout(() => { 
        if (b.parentNode) b.remove(); 
        document.body.classList.remove("winner-mode"); 
    }, 5000);
    console.log("[SYS] Judges: 'Wow, such clean code.'");
};

window.printReport = () => window.print();
