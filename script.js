// ==========================================
// SDG WEBATHON - JAVASCRIPT LOGIC
// Real-time Firebase Sync setup 
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// our database config
const firebaseConfig = {
    apiKey: "AIzaSyBNO8SiOBW49CqL7YgHd572pF9mikE7ABo",
    authDomain: "ecofootprint-9c4ed.firebaseapp.com",
    projectId: "ecofootprint-9c4ed",
    storageBucket: "ecofootprint-9c4ed.firebasestorage.app",
    messagingSenderId: "425267033599",
    appId: "1:425267033599:web:3554770c24a204594ba3ca",
    measurementId: "G-NCNFZTHKS4"
};

// boot up firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// 1. POLICY SIMULATOR LOGIC
// ==========================================
document.getElementById('footprintForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // stops the annoying page reload

    let ans1 = Number(document.getElementById("q1").value);
    let ans2 = Number(document.getElementById("q2").value);
    let ans3 = Number(document.getElementById("q3").value);
    let ans4 = Number(document.getElementById("q4").value);
    let ans5 = Number(document.getElementById("q5").value);
    
    let finalPoints = ans1 + ans2 + ans3 + ans4 + ans5;

    // SENDING DATA: Save the score to the cloud
    try {
        await addDoc(collection(db, "simulatorScores"), {
            score: finalPoints,
            timeSaved: new Date().toISOString()
        });
    } catch (err) {
        console.log("DB error: ", err);
    }

    let feedbackBox = document.getElementById("feedbackText");
    let uiEmoji = "";
    let barHex = "";

    if (finalPoints >= 80) {
        uiEmoji = "🌍🏆";
        barHex = "#2ecc71"; // green
        feedbackBox.innerHTML = "🔥 INCREDIBLE! You implemented a true sustainable framework. By shifting to renewables and enforcing a circular economy, we can reach Net-Zero!";
        feedbackBox.style.color = "#27ae60"; 
    } else if (finalPoints >= 40 && finalPoints < 80) {
        uiEmoji = "⚠️📉";
        barHex = "#ffeb3b"; // yellow
        feedbackBox.innerHTML = "🌱 A GOOD START. But half-measures like EVs aren't enough. We need systemic shifts in agriculture and public transit. Try again!";
        feedbackBox.style.color = "#d35400"; 
    } else {
        uiEmoji = "🏭❌";
        barHex = "#ff5252"; // red
        feedbackBox.innerHTML = "🚨 DISASTER. Continuing the status quo guarantees severe global warming. We need radical policy shifts immediately.";
        feedbackBox.style.color = "#c0392b"; 
    }

    document.getElementById("resultEmoji").innerHTML = uiEmoji;
    document.getElementById('footprintForm').style.display = 'none';
    document.getElementById("resultBox").style.display = "block";

    // cool counting animation
    let tally = 0;
    document.getElementById("scoreDisplay").innerHTML = "0"; 
    
    let timer = setInterval(() => {
        if (tally >= finalPoints) {
            clearInterval(timer);
            document.getElementById("scoreDisplay").innerHTML = finalPoints; 
        } else {
            tally++;
            document.getElementById("scoreDisplay").innerHTML = tally;
        }
    }, 20); 

    setTimeout(() => {
        document.getElementById("scoreBarFill").style.width = finalPoints + "%";
        document.getElementById("scoreBarFill").style.backgroundColor = barHex;
    }, 100);
});

// ==========================================
// 2. REAL-TIME DATABASE SYNC (GIVE & TAKE)
// ==========================================

const boardDb = collection(db, "listedItems");
const sortQuery = query(boardDb, orderBy("timestamp", "desc"));

// GIVING DATA (REAL-TIME READ): This listens to Firestore 24/7.
// If anyone adds or claims an item, this runs instantly for everyone!
onSnapshot(sortQuery, (snapshot) => {
    let htmlContainer = document.getElementById('give-take-cards');
    htmlContainer.innerHTML = ""; // clear old stuff

    snapshot.forEach((docSnap) => {
        let itemData = docSnap.data();
        let docId = docSnap.id; 

        let taken = itemData.status === "claimed";
        let buttonText = taken ? "CLAIMED ❌" : "CLAIM FOR FREE";
        let disabledState = taken ? "disabled" : "";
        let borderStyle = taken ? 'style="border-color: #9e9e9e; box-shadow: none;"' : '';

        // build the HTML card dynamically
        let makeCard = `
            <div class="item-card" id="card-${docId}" ${borderStyle}>
                <div class="card-icon">${itemData.icon}</div>
                <h3>${itemData.name}</h3>
                <p class="item-lister">Listed by: ${itemData.lister}</p>
                <p>${itemData.description}</p>
                <button class="claim-btn" id="btn-${docId}" onclick="claimItem('${docId}')" ${disabledState}>${buttonText}</button>
            </div>
        `;
        htmlContainer.insertAdjacentHTML('beforeend', makeCard);
    });
});

// SENDING DATA: When someone lists a new item
document.getElementById('addItemForm').addEventListener('submit', async function(e) {
    e.preventDefault(); 

    let formBtn = document.querySelector(".add-btn");
    formBtn.innerHTML = "LISTING... ⏳";
    
    try {
        // pushing data to firestore
        await addDoc(collection(db, "listedItems"), {
            name: document.getElementById('newItemName').value,
            icon: document.getElementById('newItemIcon').value,
            lister: document.getElementById('newListerName').value,
            description: document.getElementById('newItemDesc').value,
            status: "available",
            timestamp: new Date().toISOString()
        });

        alert("📦 Item is live on the board!");
        document.getElementById('addItemForm').reset();

    } catch (err) {
        console.error("DB Upload Failed: ", err);
        alert("Network error.");
    } finally {
        formBtn.innerHTML = "LIST ITEM SECURELY 🔒";
    }
});

// UPDATING DATA: When someone clicks Claim
async function claimItem(docId) {
    let btn = document.getElementById("btn-" + docId);
    btn.innerHTML = "WAIT... ⏳";
    btn.disabled = true;

    try {
        // find the exact item in DB and change status
        const itemRef = doc(db, "listedItems", docId);
        await updateDoc(itemRef, {
            status: "claimed"
        });

        alert("♻️ Claimed! The board is syncing for everyone else now.");

    } catch (err) {
        console.error("Claim failed:", err);
        alert("Error claiming item.");
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

// Attach to window so HTML buttons can trigger them
window.claimItem = claimItem;
window.resetQuiz = resetQuiz;
