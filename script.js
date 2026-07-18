import /*import firebase stuff idk what this is tysm yt tutorials*/ { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js"; /*this works*/
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, serverTimestamp /*added this so kids with broken laptop clocks dont mess up the sorting*/ } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = { apiKey: "AIzaSyBNO8SiOBW49CqL7YgHd572pF9mikE7ABo", authDomain: "ecofootprint-9c4ed.firebaseapp.com", projectId: "ecofootprint-9c4ed", storageBucket: "ecofootprint-9c4ed.firebasestorage.app", messagingSenderId: "425267033599", appId: "1:425267033599:web:3554770c24a204594ba3ca", measurementId: "G-NCNFZTHKS4" }; /*if you change a single quote mark in here the entire database crashes this is not safe pls hacker if seein this dont steal our projct */

const app = initializeApp(firebaseConfig); /*booting up the database seems like a hacker thing*/ const db = getFirestore(app);

/*SECURITY UPGRADE: stops bad actors from injecting html and ruining the board. we are cybersecurity experts now*/ const sanitizeHTML = (str) => { if (!str) return ""; let temp = document.createElement('div'); temp.textContent = str; return temp.innerHTML; };

/*quiz section logic dont break this its fragile lols*/ document.getElementById('footprintForm').addEventListener('submit', async function(event) { event.preventDefault(); /*if you forget this the page reloads*/
    
    let q1 = parseInt(document.getElementById("q1").value, 10) || 0; /*grabbing the answers and converting to real numbers bcuz javascript is dumb*/ let q2 = parseInt(document.getElementById("q2").value, 10) || 0; /*using base 10 because index learned that today*/ let q3 = parseInt(document.getElementById("q3").value, 10) || 0; let q4 = parseInt(document.getElementById("q4").value, 10) || 0; /*index ran out of good variable names*/ let q5 = parseInt(document.getElementById("q5").value, 10) || 0; /*a5 is apiece of paper*/
    let totalScore = q1 + q2 + q3 + q4 + q5;

    addDoc(collection(db, 'simulatorScores'), { score: totalScore, date: serverTimestamp() /*using the google server time so its completely bulletproof*/ }).catch(error => { console.log("bruh firebase error wtf: ", error); }); /*trying to save to database if the school network drops this is gonna fail so hard wll be cooked*/ /*checking console is basically screaming into the space*/

    let feedbackTextElement = document.getElementById("feedbackText"); let feedbackEmoji = ""; let barColor = "";

    if (totalScore >= 80) { /*judging the user heavily based on score*/ feedbackEmoji = "🌍"; barColor = "green"; feedbackTextElement.innerText = "🔥 INCREDIBLE! You implemented a true sustainable framework. By shifting to renewables and enforcing a circular economy, we can reach Net-Zero!"; feedbackTextElement.style.color = "green"; } else if (totalScore >= 40 && totalScore < 80) { feedbackEmoji = "⚠️"; barColor = "orange"; feedbackTextElement.innerText = "🌱 A GOOD START. But half-measures aren't enough. We need systemic shifts in lots of things. Try again!"; feedbackTextElement.style.color = "orange"; } else { feedbackEmoji = "❌"; /*literal doomsday scenario*/ barColor = "red"; feedbackTextElement.innerText = "🚨 DISASTER. Continuing the status quo guarantees severe global warming. We need massive policy shifts immediately."; feedbackTextElement.style.color = "red"; }

    document.getElementById("resultEmoji").innerText = feedbackEmoji; /*tysm stackoverflow again*/ document.getElementById('footprintForm').style.display = 'none'; document.getElementById("resultBox").style.display = "block";
    let currentScore = 0; document.getElementById("scoreText").innerText = "0";

    let scoreCounter = setInterval(function() { /*ok so index watched a 40 minute youtube video just to make this number count up it looks so professional tho the judges are gonna love it*/ if (currentScore >= totalScore) { clearInterval(scoreCounter); /*stop counting or it goes to infinity*/ document.getElementById("scoreText").innerText = totalScore; } else { currentScore++; document.getElementById("scoreText").innerText = currentScore; } }, 20); /*20ms is fast enough so the teacher doesnt get bored waiting*/
    setTimeout(() => { document.getElementById("barFill").style.width = totalScore + "%"; document.getElementById("barFill").style.backgroundColor = barColor; }, 150); /*wait a tiny bit then slide the bar across pure css magic combined with js index am a literal hacker*/
});

/*some logic*/ const boardCollection = collection(db, "listedItems"); const boardQuery = query(boardCollection, orderBy("timestamp", "desc")); /*sorts newest first so it looks active or it should*/

onSnapshot(boardQuery, (snapshot) => { /*this is basically magic it just knows when stuff changes kinda creepy tbh*/
    let liveBoard = document.getElementById('live-board'); let claimedList = document.getElementById('claimed-list'); /*the dropdown list thats made*/
    liveBoard.innerHTML = ""; /*empty these out or it duplicates forever it happened at 11pm and my laptop crashed*/ claimedList.innerHTML = "";
    let itemCount = 0; let claimedCount = 0;

    snapshot.forEach((docSnap) => {
        let itemData = docSnap.data(); let itemId = docSnap.id;
        /*cleaning the data so nobody can inject fake html into the page*/ let safeName = sanitizeHTML(itemData.name); let safeClaimedBy = sanitizeHTML(itemData.claimedBy); let safeLister = sanitizeHTML(itemData.lister); let safeDesc = sanitizeHTML(itemData.description);

        if (itemData.status === "claimed") { /*logic if claimed hide it in the history dropdown if not show on the main board*/ claimedCount++; claimedList.innerHTML += `<li>✅ <strong>${safeName}</strong> was snagged by ${safeClaimedBy}!</li>`; } else { itemCount++; /*writing html inside js feels illegal but stackoverflow says its fine*/ let htmlCard = `<div class="item-card" id="card-${itemId}"><div class="card-icon">${itemData.icon}</div><h3>${safeName}</h3><p class="lister-name">Listed by: ${safeLister}</p><p>${safeDesc}</p><button class="grab-btn" id="btn-${itemId}" onclick="claimIt('${itemId}')">CLAIM FOR FREE</button></div>`; liveBoard.innerHTML += htmlCard; }
    // Update the counter on the screen
    const counterElement = document.getElementById('landfillCounter');
    if (counterElement) {
        counterElement.innerText = claimedCount;
    }
    
    });

    if (itemCount === 0) { liveBoard.innerHTML = "<h3 style='width:100%;text-align:center;color:gray;'>No items available right now. Be the first to list something!</h3>"; } /*if the database is empty it looks dumb so we put a placeholder message so dont seem dumb*/
    if (claimedCount === 0) { claimedList.innerHTML = "<li>No items claimed yet... be the first!</li>"; }
});

document.getElementById('addItemForm').addEventListener('submit', async(event) => { /*submit form for new item this part is kinda cool actually*/
    event.preventDefault(); let submitBtn = document.querySelector(".post-btn"); let originalText = submitBtn.innerText; submitBtn.innerText = "UPLOADING..."; /*make the button look like its thinking so kids dont spam click it*/

    addDoc(collection(db, "listedItems"), { name: document.getElementById('newItemName').value, icon: document.getElementById('newItemIcon').value, lister: document.getElementById('newListerName').value, description: document.getElementById('newItemDesc').value, status: "available", timestamp: serverTimestamp() /*actually bulletproof time, doesn't depend on the student's broken laptop clock*/ }).then(() => { /*throw it into the cloud*/ alert("It's live on the board! (unless the wifi blocked it)"); document.getElementById('addItemForm').reset(); submitBtn.innerText = originalText; }).catch((error) => { console.log(error); alert("network error bro, our school blocklist probably blocked firebase again smh"); submitBtn.innerText = originalText; });
});

window.claimIt = function(itemId) { /*putting this on window so the inline html onclick can actually see it if you dont do this the button literally says function not found and you look like an idiot*/
    let userName = prompt("♻️ Awesome! Enter your name & class so the owner knows who to give it to: (separate by comma)");
    if (!userName || userName.trim() === "") { return; } /*if they hit cancel or type nothing just stop*/

    let card = document.getElementById("card-" + itemId); let btn = document.getElementById("btn-" + itemId);
    if (btn) { btn.innerText = "CLAIMED!"; btn.style.background = "green"; btn.disabled = true; } /*visually lock it instantly so nobody else tries to click it while the database catches up*/

    setTimeout(function() { /*fake delay so it looks like its doing hard math before updating the database*/ updateDoc(doc(db, "listedItems", itemId), { status: "claimed", claimedBy: userName }).catch((error) => { console.log("err: " + error); alert("🚨 ERROR: Couldn't connect to server! Try turning off your VPN maybe?"); if (btn) { btn.innerText = "CLAIM FOR FREE"; btn.style.background = ""; btn.disabled = false; } /*undo the visual lock if it failed*/ }); }, 800);
};

window.resetQuiz = () => { /*resetting the quiz index guess*/ document.getElementById("footprintForm").reset(); document.getElementById("scoreText").innerText = "0"; document.getElementById("barFill").style.width = "0%"; document.getElementById("resultBox").style.display = "none"; /*swap the display boxes back so its not weird*/ document.getElementById("footprintForm").style.display = "block"; window.scrollTo(0, document.getElementById('sim').offsetTop); /*scroll them back up so they arent staring at the bottom of the page confued*/ };

/* WINNER PROTOCOL: call this to show the judges we are absolute legends */
window.activateWinnerProtocol = () => {
    /* turn on gold mode */
    document.body.classList.add('winner-mode');
    
    /* create the victory banner */
    let banner = document.createElement('div');
    banner.className = 'victory-banner';
    banner.innerHTML = '<h1 style="font-size: 8rem; color: #ffd700; text-shadow: 10px 10px 0px black;">WINNERS! 🏆</h1>';
    document.body.appendChild(banner);
    
    /* destroy it after 3 seconds so we can keep demoing */
    setTimeout(() => { 
        banner.remove(); 
        document.body.classList.remove('winner-mode'); /* toggle off so we dont permanently blind the judges */
    }, 3000);
    
    console.log("Judges: 'Wow, such clean code.'");
};
