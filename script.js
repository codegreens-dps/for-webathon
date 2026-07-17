// ==========================================
// SDG WEBATHON - FULL STACK JAVASCRIPT LOGIC
// Update: BRO WE HAVE A REAL DATABASE NOW ☁️
// ==========================================

// 1. IMPORT FIREBASE (Using your exact v12.16.0 links)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
// I added Firestore so we can save data to the cloud!
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// 2. YOUR FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyBNO8SiOBW49CqL7YgHd572pF9mikE7ABo",
    authDomain: "ecofootprint-9c4ed.firebaseapp.com",
    projectId: "ecofootprint-9c4ed",
    storageBucket: "ecofootprint-9c4ed.firebasestorage.app",
    messagingSenderId: "425267033599",
    appId: "1:425267033599:web:3554770c24a204594ba3ca",
    measurementId: "G-NCNFZTHKS4"
};

// 3. INITIALIZE THE APP & DATABASE
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

console.log("%c🌿 TEAM CODEGREENS CONNECTED TO THE CLOUD! ☁️", "color: #2ecc71; font-size: 20px; font-weight: bold;");
console.log("Database initialized. Ready to save the world.");

// ==========================================
// POLICY SIMULATOR LOGIC
// ==========================================

// Notice the 'async' word here? That lets us wait for the cloud database to save!
document.getElementById('footprintForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    let q1 = Number(document.getElementById("q1").value);
    let q2 = Number(document.getElementById("q2").value);
    let q3 = Number(document.getElementById("q3").value);
    let q4 = Number(document.getElementById("q4").value);
    let q5 = Number(document.getElementById("q5").value);

    let totalScore = q1 + q2 + q3 + q4 + q5;

    // 🔥 BIG BRAIN CLOUD MOVE: Save the score to Firebase Firestore!
    try {
        await addDoc(collection(db, "simulatorScores"), {
            score: totalScore,
            timestamp: new Date().toISOString()
        });
        console.log("Bro we just saved a score of " + totalScore + " to the cloud!");
    } catch (e) {
        console.error("Database error bro: ", e);
    }

    let scoreDisplay = document.getElementById("scoreDisplay");
    let feedbackText = document.getElementById("feedbackText");
    let resultBox = document.getElementById("resultBox");
    let resultEmoji = document.getElementById("resultEmoji");
    let scoreBarFill = document.getElementById("scoreBarFill");

    let emoji = "";
    let barColor = "";

    if (totalScore >= 80) {
        emoji = "🌍🏆";
        barColor = "#2ecc71"; 
        feedbackText.innerHTML = "🔥 INCREDIBLE! You implemented a true sustainable framework. By shifting to renewables, protecting natural carbon sinks, and enforcing a circular economy, we can actually reach Net-Zero by 2050!";
        feedbackText.style.color = "#27ae60"; 
    } else if (totalScore >= 40 && totalScore < 80) {
        emoji = "⚠️📉";
        barColor = "#ffeb3b"; 
        feedbackText.innerHTML = "🌱 A GOOD START. Half-measures like EVs and recycling are helpful, but without systemic shifts in agriculture, public transit, and ending fossil fuels, we will still miss our climate targets. Try again!";
        feedbackText.style.color = "#d35400"; 
    } else {
        emoji = "🏭❌";
        barColor = "#ff5252"; 
        feedbackText.innerHTML = "🚨 DISASTER. Continuing the status quo with fossil fuels, deforestation, and a linear 'throw-away' economy guarantees severe global warming. We need radical policy shifts immediately.";
        feedbackText.style.color = "#c0392b"; 
    }

    resultEmoji.innerHTML = emoji;
    document.getElementById('footprintForm').style.display = 'none';
    resultBox.style.display = "block";

    let currentCount = 0;
    scoreDisplay.innerHTML = "0"; 
    
    let counterInterval = setInterval(() => {
        if (currentCount >= totalScore) {
            clearInterval(counterInterval);
            scoreDisplay.innerHTML = totalScore; 
        } else {
            currentCount += 1;
            scoreDisplay.innerHTML = currentCount;
        }
    }, 20); 

    setTimeout(() => {
        scoreBarFill.style.width = totalScore + "%";
        scoreBarFill.style.backgroundColor = barColor;
    }, 100);
});

// ==========================================
// THE GIVE & TAKE BOARD CLOUD LOGIC
// ==========================================

// async function so we can push to Firebase
async function claimItem(itemId) {
    let btn = document.getElementById("btn-" + itemId);
    
    // Change UI instantly so it feels fast
    btn.innerHTML = "CLAIMING... ⏳";
    btn.disabled = true;

    try {
        // 🔥 Push the claim to your live Firebase database!
        await addDoc(collection(db, "claimedItems"), {
            itemClaimed: itemId,
            status: "claimed",
            timestamp: new Date().toISOString()
        });

        alert("♻️ Circular Economy WIN! Claim recorded in the cloud database. Go meet the senior in the cafeteria to pick it up!");

        btn.innerHTML = "CLAIMED ❌";
        document.getElementById("card-" + itemId).style.borderColor = "#9e9e9e";
        document.getElementById("card-" + itemId).style.boxShadow = "none";

    } catch (e) {
        console.error("Failed to claim item in DB:", e);
        alert("Database error! Could not claim.");
        btn.innerHTML = "CLAIM FOR FREE";
        btn.disabled = false;
    }
}

function resetQuiz() {
    document.getElementById("footprintForm").reset();
    document.getElementById("scoreDisplay").innerHTML = "0";
    document.getElementById("scoreBarFill").style.width = "0%";
    document.getElementById("resultBox").style.display = "none";
    document.getElementById("footprintForm").style.display = "block";
    document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
}

// ⚠️ MEGA IMPORTANT JAVASCRIPT HACK ⚠️
// Because we are using type="module", functions aren't global anymore.
// We HAVE to attach these to the window object so the HTML onclick="" buttons can find them!
window.claimItem = claimItem;
window.resetQuiz = resetQuiz;
