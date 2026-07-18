// importing firebase stuff from the web - dont ask me how this works lol
// my partner tried to download this as a zip file first and it broke my whole laptop 😭
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// DO NOT TOUCH THIS CONFIG - took me forever to copy paste this right
// seriously if you change a single quote mark in here the entire database explodes
// i think this is public but whatever, please don't hack our school project
const firebaseConfig = {
  apiKey: "AIzaSyBNO8SiOBW49CqL7YgHd572pF9mikE7ABo",
  authDomain: "ecofootprint-9c4ed.firebaseapp.com",
  projectId: "ecofootprint-9c4ed",
  storageBucket: "ecofootprint-9c4ed.firebasestorage.app",
  messagingSenderId: "425267033599",
  appId: "1:425267033599:web:3554770c24a204594ba3ca",
  measurementId: "G-NCNFZTHKS4"
};

// booting up the database (sounds like a movie hacker thing ngl)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// -----------------------------
// QUIZ SECTION LOGIC - don't break this, it's fragile lol
// -----------------------------
document.getElementById('footprintForm').addEventListener('submit', async function(e) {
  e.preventDefault(); // IF YOU FORGET THIS THE PAGE RELOADS AND WE LOSE EVERYTHING. AGAIN.
  
  // grabbing the answers and converting to real numbers bc javascript is dumb
  // using base 10 because I learned that in math today
  let ans1 = parseInt(document.getElementById("q1").value, 10) || 0;
  let ans2 = parseInt(document.getElementById("q2").value, 10) || 0;
  let q3_val = parseInt(document.getElementById("q3").value, 10) || 0; // i ran out of good variable names
  let fourth = parseInt(document.getElementById("q4").value, 10) || 0;
  let a5 = parseInt(document.getElementById("q5").value, 10) || 0; // a5 sounds like a piece of paper lol
  
  let totalScore = ans1 + ans2 + q3_val + fourth + a5;
  
  // trying to save to database. if the school wifi drops this is gonna fail so hard
  try { await addDoc(collection(db, 'simulatorScores'), { score: totalScore, date: new Date().toString() }); } 
  catch (err) { console.log("bruh firebase error wtf: ", err); } // checking console is basically screaming into the void
  
  let fMsg = document.getElementById("feedbackText");
  let face = ""; let cHex = "";
  
  // judging the user heavily based on their score
  if (totalScore >= 80) { 
    face = "🌍🏆"; 
    cHex = "green"; 
    fMsg.innerText = "🔥 INCREDIBLE! You implemented a true sustainable framework. By shifting to renewables and enforcing a circular economy, we can reach Net-Zero!"; 
    fMsg.style.color = "green"; 
  } 
  else if (totalScore >= 40 && totalScore < 80) { 
    face = "⚠️📉"; 
    cHex = "orange"; 
    fMsg.innerText = "🌱 A GOOD START. But half-measures like EVs aren't enough. We need systemic shifts in agriculture and public transit. Try again!"; 
    fMsg.style.color = "orange"; 
  } 
  else { 
    // literal doomsday scenario 💀
    face = "🏭❌"; 
    cHex = "red"; 
    fMsg.innerText = "🚨 DISASTER. Continuing the status quo guarantees severe global warming. We need radical policy shifts immediately."; 
    fMsg.style.color = "red"; 
  }
  
  // updating the dom. dom sounds like a guy's name but it's just the html thing
  document.getElementById("resultEmoji").innerText = face;
  document.getElementById('footprintForm').style.display = 'none'; // bye bye form
  document.getElementById("resultBox").style.display = "block"; // hello results
  
  let c = 0;
  document.getElementById("scoreText").innerText = "0"; 
  
  // ok so I watched a 40 minute youtube video just to make this number count up
  // it looks SO PROFESSIONAL tho. the judges are gonna love it.
  let ticker = setInterval(function() {
    if (c >= totalScore) { 
      clearInterval(ticker); // stop counting or it goes to infinity
      document.getElementById("scoreText").innerText = totalScore; 
    } 
    else { 
      c++; 
      document.getElementById("scoreText").innerText = c; 
    }
  }, 20); // 20ms is fast enough so the teacher doesn't get bored waiting
  
  // wait a tiny bit then slide the bar across. pure CSS magic combined with JS. I am a hacker.
  setTimeout(() => { 
    document.getElementById("barFill").style.width = totalScore + "%"; 
    document.getElementById("barFill").style.backgroundColor = cHex; 
  }, 150);
});

// -----------------------------
// LIVE BOARD & TRACKER LOGIC
// -----------------------------
const board = collection(db, "listedItems");
const myQ = query(board, orderBy("timestamp", "desc")); // sorts newest first so it looks active

// onSnapshot is basically magic. it just knows when stuff changes. kinda creepy tbh.
onSnapshot(myQ, (snapshotThing) => {
  let b = document.getElementById('live-board');
  let cList = document.getElementById('claimed-list'); // the dropdown list we made
  
  // EMPTY THESE OUT OR IT DUPLICATES FOREVER. IT HAPPENED AT 1AM AND MY LAPTOP ALMOST CRASHED
  b.innerHTML = ""; 
  cList.innerHTML = ""; 
  
  let count_items = 0; 
  let count_claimed = 0;

  snapshotThing.forEach((d) => {
    let itemData = d.data(); 
    let idString = d.id; 
    
    // Logic: If claimed, hide it in the history dropdown. If not, show on the main board.
    if (itemData.status === "claimed") {
      count_claimed++;
      // my partner wrote this string interpolation and bragged about it for 10 minutes
      cList.innerHTML += `<li>✅ <strong>${itemData.name}</strong> was snagged by ${itemData.claimedBy}!</li>`;
    } else {
      count_items++; 
      // writing HTML inside JS feels illegal but stackoverflow says it's fine
      let htmlCard = `<div class="item-card" id="card-${idString}">
                        <div class="card-icon">${itemData.icon}</div>
                        <h3>${itemData.name}</h3>
                        <p class="lister-name">Listed by: ${itemData.lister}</p>
                        <p>${itemData.description}</p>
                        <button class="grab-btn" id="btn-${idString}" onclick="claimIt('${idString}')">CLAIM FOR FREE</button>
                      </div>`;
      b.innerHTML += htmlCard;
    }
  });

  // if the database is empty it looks dumb, so we put a placeholder message
  if (count_items === 0) { b.innerHTML = "<h3 style='width:100%;text-align:center;color:gray;'>No items available right now. Be the first to list something! ♻️</h3>"; }
  if (count_claimed === 0) { cList.innerHTML = "<li>No items claimed yet... be the first!</li>"; }
});

// submit form for new item - this part is kinda cool actually
document.getElementById('addItemForm').addEventListener('submit', async (ev) => {
  ev.preventDefault(); 
  let btn_submit = document.querySelector(".post-btn");
  let old_txt = btn_submit.innerText;
  
  // make the button look like it's thinking so kids don't spam click it
  btn_submit.innerText = "UPLOADING... ⏳";
  
  try {
    // throw it into the cloud ☁️
    await addDoc(collection(db, "listedItems"), {
      name: document.getElementById('newItemName').value,
      icon: document.getElementById('newItemIcon').value,
      lister: document.getElementById('newListerName').value,
      description: document.getElementById('newItemDesc').value,
      status: "available",
      timestamp: new Date().toISOString() // gives a weird long time string but it works for sorting
    });
    alert("📦 It's live on the board! (unless the wifi blocked it)");
    document.getElementById('addItemForm').reset();
  } catch (error) { 
    console.log(error); 
    alert("network error bro, our school blocklist probably blocked firebase again smh"); 
  } 
  
  // put the button text back to normal
  btn_submit.innerText = old_txt;
});

// putting this on window so the inline html onclick can actually see it
// if you don't do this the button literally says "function not found" and you look like an idiot
window.claimIt = async function(itemID) {
  let u_name = prompt("♻️ Awesome! Enter your name & class so the owner knows who to give it to:");
  
  // if they hit cancel or type nothing, just stop
  if (!u_name || u_name.trim() === "") { return; }
  
  let the_card = document.getElementById("card-" + itemID);
  let the_btn = document.getElementById("btn-" + itemID);
  
  // visually lock it instantly so nobody else tries to click it while the database catches up
  if (the_btn) { 
    the_btn.innerText = "CLAIMED!"; 
    the_btn.style.background = "green"; 
    the_btn.disabled = true; 
  }
  
  // fake delay so it looks like it's doing hard math before updating the database
  setTimeout(async function() {
    try {
      let r = doc(db, "listedItems", itemID);
      await updateDoc(r, { status: "claimed", claimedBy: u_name });
    } catch (e) {
      console.log("err: " + e); 
      alert("🚨 ERROR: Couldn't connect to server! Try turning off your VPN maybe?");
      // undo the visual lock if it failed
      if (the_btn) { 
        the_btn.innerText = "CLAIM FOR FREE"; 
        the_btn.style.background = ""; 
        the_btn.disabled = false; 
      }
    }
  }, 800); 
};

// resetting the quiz like a time machine
window.resetQuiz = () => {
  document.getElementById("footprintForm").reset();
  document.getElementById("scoreText").innerText = "0";
  document.getElementById("barFill").style.width = "0%";
  
  // swap the display boxes back
  document.getElementById("resultBox").style.display = "none";
  document.getElementById("footprintForm").style.display = "block";
  
  // scroll them back up so they aren't staring at the bottom of the page confused
  window.scrollTo(0, document.getElementById('sim').offsetTop);
};
