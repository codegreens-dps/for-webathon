// importing firebase stuff from the web - dont ask me how this works lol
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// DO NOT TOUCH THIS CONFIG - took me forever to copy paste this right
var firebaseConfig = {
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

// -----------------------------
// QUIZ SECTION LOGIC
// -----------------------------
document.getElementById('footprintForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // stop page reload!!!

    // console.log("button clicked");

    // get all the answers from the dropdowns
    var ans1 = parseInt(document.getElementById("q1").value) || 0;
    let ans2 = parseInt(document.getElementById("q2").value) || 0;
    var q3_val = Number(document.getElementById("q3").value) || 0;
    let fourth = parseInt(document.getElementById("q4").value) || 0;
    var a5 = parseInt(document.getElementById("q5").value) || 0;
    
    let totalScore = ans1 + ans2 + q3_val + fourth + a5;
    // console.log(totalScore);

    // save score to the cloud secretly
    try {
      await addDoc(collection(db, 'simulatorScores'), {
         score: totalScore,
         date: new Date().toString()
      });
    } catch (err) {
      console.log("bruh firebase error wtf: ", err);
    }

    let fMsg = document.getElementById("feedbackText");
    var face = "";
    var cHex = "";

    // update the ui colors and text based on how well they did
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
    } else {
            face = "🏭❌";
            cHex = "red"; 
            fMsg.innerText = "🚨 DISASTER. Continuing the status quo guarantees severe global warming. We need radical policy shifts immediately.";
            fMsg.style.color = "red"; 
    }

    document.getElementById("resultEmoji").innerText = face;
    document.getElementById('footprintForm').style.display = 'none'; // hide form
    document.getElementById("resultBox").style.display = "block"; // show results

    // cool little counting animation I found online on codepen
    var c = 0;
    document.getElementById("scoreText").innerText = "0"; 
    
    let ticker = setInterval(function() {
        if (c >= totalScore) {
            clearInterval(ticker);
            document.getElementById("scoreText").innerText = totalScore; 
        } else {
            c++;
            document.getElementById("scoreText").innerText = c;
        }
    }, 20); 

    // animate the bar filling up
    setTimeout(() => {
       document.getElementById("barFill").style.width = totalScore + "%";
       document.getElementById("barFill").style.backgroundColor = cHex;
    }, 150);
});


// -----------------------------
// LIVE BOARD LOGIC
// -----------------------------
const board = collection(db, "listedItems");
const myQ = query(board, orderBy("timestamp", "desc"));

// this updates the board instantly when someone posts without needing to refresh
onSnapshot(myQ, (snapshotThing) => {
    let b = document.getElementById('live-board');
    b.innerHTML = ""; // empty first
    
    var count_items = 0; 

    snapshotThing.forEach((d) => {
        let itemData = d.data();
        let idString = d.id; 

        // if someone already took it, just skip rendering it
        if (itemData.status == "claimed") {
            return; 
        }

        count_items++; 

        // build the html for the item card (using string concat cos its easier to read sometimes)
        let htmlCard = '<div class="item-card" id="card-' + idString + '">' +
            '<div class="card-icon">' + itemData.icon + '</div>' +
            '<h3>' + itemData.name + '</h3>' +
            '<p class="lister-name">Listed by: ' + itemData.lister + '</p>' +
            '<p>' + itemData.description + '</p>' +
            '<button class="grab-btn" id="btn-' + idString + '" onclick="claimIt(\'' + idString + '\')">CLAIM FOR FREE</button>' +
        '</div>';
        
        b.innerHTML += htmlCard;
    });
    
    if (count_items === 0) {
        b.innerHTML = "<h3 style='width:100%;text-align:center;color:gray;'>No items available right now. Be the first to list something! ♻️</h3>";
    }
});


// submit form for new item
document.getElementById('addItemForm').addEventListener('submit', async (ev) => {
    ev.preventDefault(); 

    let btn_submit = document.querySelector(".post-btn") || document.querySelector("button[type='submit']");
    var old_txt = btn_submit.innerText;
    btn_submit.innerText = "UPLOADING... ⏳";
    
    try {
        await addDoc(collection(db, "listedItems"), {
            name: document.getElementById('newItemName').value,
            icon: document.getElementById('newItemIcon').value,
            lister: document.getElementById('newListerName').value,
            description: document.getElementById('newItemDesc').value,
            status: "available",
            timestamp: new Date().toISOString()
        });

        alert("📦 It's live on the board!");
        document.getElementById('addItemForm').reset();

    } catch (error) {
        console.log(error);
        alert("network error bro");
    } 
    
    btn_submit.innerText = old_txt;
});


// putting this on window so the inline html onclick can actually see it
window.claimIt = async function(itemID) {
    let u_name = prompt("♻️ Awesome! Enter your name & class so the owner knows who to give it to:");

    // if they cancel the prompt just stop
    if (!u_name || u_name.trim() == "") {
        return; 
    }

    var the_card = document.getElementById("card-" + itemID);
    var the_btn = document.getElementById("btn-" + itemID);

    // fake the ui update first so it feels super fast to the user
    if(the_btn) {
        the_btn.innerText = "🎉 CLAIMED BY " + u_name.toUpperCase() + "!";
        the_btn.style.background = "green"; 
        the_btn.style.color = "white";
        the_btn.disabled = true;
    }

    if(the_card) {
        the_card.style.borderColor = "green";
    }

    // wait a second then actually update database
    setTimeout(async function() {
        
        if (the_card) {
            the_card.style.opacity = "0.3"; // fade it out a bit
        }

        try {
            // update firebase
            let r = doc(db, "listedItems", itemID);
            await updateDoc(r, {
                status: "claimed",
                claimedBy: u_name
            });
            
        } catch (e) {
            console.log("err: " + e);
            alert("🚨 ERROR: Couldn't connect to server!");
            
            // if it failed, put the button back to normal
            if(the_btn) {
                the_btn.innerText = "CLAIM FOR FREE";
                the_btn.style.background = "";
                the_btn.style.color = "black";
                the_btn.disabled = false;
            }
            if(the_card) {
                the_card.style.borderColor = "black";
                the_card.style.opacity = "1";
            }
        }

    }, 800); 
};


// reset button for quiz
window.resetQuiz = () => {
    document.getElementById("footprintForm").reset();
    document.getElementById("scoreText").innerText = "0";
    document.getElementById("barFill").style.width = "0%";
    document.getElementById("resultBox").style.display = "none";
    document.getElementById("footprintForm").style.display = "block";
    
    // scroll back up
    window.scrollTo(0, document.getElementById('sim').offsetTop);
}
