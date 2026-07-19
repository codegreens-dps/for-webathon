import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js"; /* this works finally */
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* DO NOT TOUCH THE CONFIG OR THE DB EXPLODES */
var conf = {apiKey:"AIzaSyBNO8SiOBW49CqL7YgHd572pF9mikE7ABo",authDomain:"ecofootprint-9c4ed.firebaseapp.com",projectId:"ecofootprint-9c4ed",storageBucket:"ecofootprint-9c4ed.firebasestorage.app",messagingSenderId:"425267033599",appId:"1:425267033599:web:3554770c24a204594ba3ca",measurementId:"G-NCNFZTHKS4"};
var firebaseApp = initializeApp(conf), database = getFirestore(firebaseApp);

/* security stuff from stackoverflow */
function cln(s){ if(!s)return""; var d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

/* --- KONAMI CODE (Cleaned Up) --- */
const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']; 
let konamiPosition = 0;

document.addEventListener('keydown', function(e) {
    // Normalize input to lowercase to match our array
    const pressedKey = e.key.toLowerCase();
    const expectedKey = konamiCode[konamiPosition];

    if (pressedKey === expectedKey) {
        konamiPosition++;
        console.log("Konami progress: " + konamiPosition); // Debug: Check console to see if it's counting up

        if (konamiPosition === konamiCode.length) {
            console.log("Konami Activated!");
            
            // Trigger your effects
            document.getElementById('konami-modal').style.display = 'flex';
            document.body.classList.add('winner-mode');
            
            // Reset glitch effect and hide modal after 5 seconds (5000ms)
            setTimeout(() => {
                document.body.classList.remove('winner-mode');
                document.getElementById('konami-modal').style.display = 'none';
            }, 5000);
            
            konamiPosition = 0; // Reset after success
        }
    } else {
        // Reset if they press the wrong key
        konamiPosition = 0;
    }
});

/* putting everything in onload because it broke otherwise */
window.onload = function() {
    
    /* --- Electricity Maps API Magic --- */
    var fetchCarbonIntensity = async function(zone) {
        var valDisplay = document.getElementById("intensityValue"), meterFill = document.getElementById("intensityMeterFill"), statusDisplay = document.getElementById("intensityStatus");
        
        // Easter Egg: Mars Colony Alpha
        if(zone === "MARS") {
            valDisplay.innerText = "-42";
            if(meterFill) { meterFill.style.width = "100%"; meterFill.style.backgroundColor = "#ff4500"; }
            if(statusDisplay) { statusDisplay.innerText = "Elon approves. 100% Nuclear/Solar. 🚀"; statusDisplay.style.color = "#ff4500"; }
            return;
        }

        valDisplay.innerText = "Loading..."; if(meterFill) meterFill.style.width = "0%";
        if(statusDisplay) { statusDisplay.innerText = "Checking grid health..."; statusDisplay.style.color = "var(--text-color)"; }

        try {
            // Frontend requests the localized static files continuously updated by the GitHub Engine
            var dataUrl = "./data/" + zone + ".json";
            
            var res = await fetch(dataUrl, { method: "GET" });
            if (!res.ok) { throw new Error("Resource not synchronized yet. Status: " + res.status); }
            var data = await res.json();
            
            if (data && data.carbonIntensity !== undefined && data.carbonIntensity !== null) {
                var intensity = data.carbonIntensity; valDisplay.innerText = intensity;
                
                /* Your original UI rendering matrix stays exactly the same */
                if(meterFill && statusDisplay) {
                    var pct = Math.min((intensity / 800) * 100, 100); meterFill.style.width = pct + "%";
                    
                    if(intensity < 250) { meterFill.style.backgroundColor = "var(--green)"; statusDisplay.innerText = "Grid is looking clean today! 🌿"; statusDisplay.style.color = "var(--green)"; } 
                    else if(intensity < 550) { meterFill.style.backgroundColor = "var(--yellow)"; statusDisplay.innerText = "Moderate emissions. Meh. 🤷‍♂️"; statusDisplay.style.color = "var(--yellow)"; } 
                    else { meterFill.style.backgroundColor = "var(--red)"; statusDisplay.innerText = "Grid is literally coughing smog. 🏭"; statusDisplay.style.color = "var(--red)"; }
                }
            }
        } catch (err) {
            console.error("🚨 Static fetch system exception: ", err.message);
            valDisplay.innerText = "N/A";
            if(statusDisplay) statusDisplay.innerText = "Sync failure on cloud assets 💀";
        }
    };

    /* hook up the dropdown so it updates automatically */
    var regionDrop = document.getElementById("regionSelect");
    if (regionDrop) { regionDrop.addEventListener("change", function(e) { fetchCarbonIntensity(e.target.value); }); fetchCarbonIntensity(regionDrop.value); }

    /* quiz section logic */
    document.getElementById("footprintForm").onsubmit = function(e) {
        e.preventDefault(); 
        var summ = (document.getElementById('q1').value*1) + (document.getElementById('q2').value*1) + (document.getElementById('q3').value*1) + (document.getElementById('q4').value*1) + (document.getElementById('q5').value*1);

        addDoc(collection(database, 'simulatorScores'), { score: summ, date: serverTimestamp() }).catch(err => console.log("bruh error wtf: " + err));

        var fb = document.getElementById("feedbackText"), emj = "", col = "", displayScore = summ;

        // EASTER EGG: Selected the secret Teleportation option (-50)
        if(summ < 0) {
            emj="🛸"; col="var(--purple)"; displayScore = "ERROR: 999"; summ = 100; // fill bar all the way
            fb.innerText="🌌 WAIT WHAT. You unlocked alien teleportation technology! Carbon emissions for transport dropped to zero. You literally solved climate change with sci-fi."; fb.style.color="var(--purple)";
        } else if(summ>79) {
            emj="🌍"; col="var(--green)"; fb.innerText="🔥 INCREDIBLE! You implemented a true sustainable framework. By shifting to renewables and enforcing a circular economy, we can reach Net-Zero!"; fb.style.color="var(--green)";
        } else if(summ>39 && summ<80) {
            emj="⚠️"; col="var(--yellow)"; fb.innerText="🌱 A GOOD START. But half-measures aren't enough. We need systemic shifts in lots of things. Try again!"; fb.style.color="var(--yellow)";
        } else {
            emj="❌"; col="var(--red)"; fb.innerText="🚨 DISASTER. Continuing the status quo guarantees severe global warming. We need massive policy shifts immediately."; fb.style.color="var(--red)";
        }

        document.getElementById("resultEmoji").innerText = emj; document.getElementById('footprintForm').style.display='none'; document.getElementById("resultBox").style.display='block';
        var c=0; document.getElementById("scoreText").innerText="0";

        if(displayScore === "ERROR: 999") {
            document.getElementById("scoreText").innerText = displayScore; document.getElementById("scoreText").classList.add("glitch-text");
        } else {
            var tmr = setInterval(function() {
                if(c>=summ) { clearInterval(tmr); document.getElementById("scoreText").innerText=summ; }
                else { c++; document.getElementById("scoreText").innerText=c; }
            }, 20); 
        }
        setTimeout(function() { document.getElementById("barFill").style.width=summ+"%"; document.getElementById("barFill").style.backgroundColor=col; }, 150); 
    };

    /* board stuff */
    onSnapshot(query(collection(database, "listedItems"), orderBy("timestamp", "desc")), function(s) {
        var b = document.getElementById('live-board'), l = document.getElementById('claimed-list');
        b.innerHTML=""; l.innerHTML=""; var i_c=0, c_c=0;

        s.forEach(function(d){
            var o = d.data(), iid = d.id, n1 = cln(o.name), c2 = cln(o.claimedBy), l3 = cln(o.lister), d4 = cln(o.description);
            if(o.status=="claimed") { c_c++; l.innerHTML += "<li>✅ <strong>"+n1+"</strong> was snagged by "+c2+"!</li>"; } 
            else { 
                i_c++; 
                b.innerHTML += "<div class='item-card neo-border hover-lift' id='card-"+iid+"'><div class='card-icon'>"+o.icon+"</div><h3>"+n1+"</h3><p class='lister-name mono-text'>Listed by: "+l3+"</p><p>"+d4+"</p><button class='grab-btn brutal-btn' id='btn-"+iid+"' onclick='claimIt(\""+iid+"\")'>CLAIM FOR FREE ⚡</button></div>"; 
            }
        });

        /* --- UPDATED GAMIFICATION METRIC --- */
        var el = document.getElementById('landfillCounter'); 
        if(el) {
            var co2Saved = (c_c * 4.5).toFixed(1); // 4.5kg of CO2 saved per item
            el.innerHTML = c_c + "<div style='font-size: 0.35em; color: var(--yellow); text-shadow: 0 0 10px rgba(255,230,0,0.5); margin-top: 12px; font-family: monospace; letter-spacing: 0px;'>~" + co2Saved + " kg CO₂ saved!</div>";
        }

        if(i_c==0) b.innerHTML="<h3 style='width:100%;text-align:center;color:var(--text-color);' class='blink-text'>No items available right now. Be the first to list something!</h3>";
        if(c_c==0) l.innerHTML="<li class='empty-state'>No items claimed yet... be the first!</li>";
    });

    document.getElementById('addItemForm').onsubmit = function(ev) {
        ev.preventDefault(); var btn = document.querySelector(".post-btn"), txt = btn.innerText; btn.innerText="UPLOADING..."; 
        var n = document.getElementById('newItemName').value, i = document.getElementById('newItemIcon').value, lst = document.getElementById('newListerName').value, desc = document.getElementById('newItemDesc').value;

        addDoc(collection(database, "listedItems"), { name: n, icon: i, lister: lst, description: desc, status: "available", timestamp: serverTimestamp() }).then(function(){
            // Easter Egg trigger: Listed alien tech
            if(i === "🛸") alert("Wait, where did you find Alien Tech?! 👽 It's live on the board!"); else alert("It's live on the board! (unless the wifi blocked it)");
            document.getElementById('addItemForm').reset(); btn.innerText=txt;
        }).catch(function(e){ console.log(e); alert("network error bro, our school blocklist probably blocked firebase again smh"); btn.innerText=txt; });
    };
}; /* <--- This bracket correctly closes the window.onload function */

window.claimIt = function(id) {
    var un = prompt("♻️ Awesome! Enter your name & class so the owner knows who to give it to:"); if(un=="" || un==null) return; 
    var btn = document.getElementById("btn-"+id);
    if(btn) { btn.innerText="CLAIMED!"; btn.style.background="var(--green)"; btn.style.color="#000"; btn.disabled=true; }

    setTimeout(function(){
        updateDoc(doc(database, "listedItems", id), { status:"claimed", claimedBy: un }).catch(function(e){
            console.log(e); alert("🚨 ERROR: Couldn't connect to server! Try turning off your VPN maybe?");
            if(btn){ btn.innerText="CLAIM FOR FREE ⚡"; btn.style.background=""; btn.style.color=""; btn.disabled=false; }
        });
    }, 800);
};

window.resetQuiz = function() {
    document.getElementById("footprintForm").reset(); document.getElementById("scoreText").innerText="0"; document.getElementById("scoreText").className="glitch-score";
    document.getElementById("barFill").style.width="0%"; document.getElementById("resultBox").style.display="none"; document.getElementById("footprintForm").style.display="block"; 
    window.scrollTo({ top: document.getElementById('sim').offsetTop, behavior: 'smooth' }); 
};

window.activateWinnerProtocol = function() {
    // 1. Add visual class
    document.body.classList.add("winner-mode");
    
    // 2. Create the banner
    var b = document.createElement('div'); b.className = 'victory-banner';
    b.innerHTML = '<h1 style="font-family: \'Orbitron\', sans-serif; font-size: 5rem; color: #fff; text-shadow: 10px 10px 0px var(--orange);">HACKATHON WINNERS! 🏆</h1>'; document.body.appendChild(b);
    
    // 3. Remove everything after 5 seconds (5000ms)
    setTimeout(function(){ if (b.parentNode) b.remove(); document.body.classList.remove("winner-mode"); }, 5000);
    console.log("Judges: 'Wow, such clean code.'");
};

/* --- NEW: PRINT REPORT FEATURE --- */
window.printReport = function() {
    window.print();
};
