import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js"; /* this works finally */
import{getFirestore,collection,addDoc,onSnapshot,query,orderBy,updateDoc,doc,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* DO NOT TOUCH THE CONFIG OR THE DB EXPLODES */
var conf = {apiKey:"AIzaSyBNO8SiOBW49CqL7YgHd572pF9mikE7ABo",authDomain:"ecofootprint-9c4ed.firebaseapp.com",projectId:"ecofootprint-9c4ed",storageBucket:"ecofootprint-9c4ed.firebasestorage.app",messagingSenderId:"425267033599",appId:"1:425267033599:web:3554770c24a204594ba3ca",measurementId:"G-NCNFZTHKS4"};
var firebaseApp=initializeApp(conf);
var database = getFirestore(firebaseApp);

/* security stuff from stackoverflow */
function cln(s){
  if(!s)return"";
  var d=document.createElement('div');
  d.textContent=s;
  return d.innerHTML;
}

/* putting everything in onload because it broke otherwise */
window.onload = function() {
  
  /* quiz section logic */
  document.getElementById("footprintForm").onsubmit = function(e) {
    e.preventDefault(); /* stops page reload */
    
    /* grabbing answers and forcing them to be real numbers bcuz javascript is dumb */
    var v1=document.getElementById('q1').value*1;
    var v2=document.getElementById('q2').value*1;
    var v3=document.getElementById('q3').value*1;
    var v4=document.getElementById('q4').value*1;
    var v5=document.getElementById('q5').value*1;

    var summ = 0;
    summ = v1+v2+v3+v4+v5;

    /* throwing it into the cloud */
    addDoc(collection(database, 'simulatorScores'), { score: summ, date: serverTimestamp() /* using server time so broken laptops dont break it */ }).then(function(){
    }).catch(function(err){
        console.log("bruh error wtf: " + err); /* checking console is basically screaming into space */
    });

    var fb = document.getElementById("feedbackText");
    var emj = ""; var col = "";

    /* judging the user heavily based on score */
    if(summ>79){
        emj="🌍"; col="green";
        fb.innerText="🔥 INCREDIBLE! You implemented a true sustainable framework. By shifting to renewables and enforcing a circular economy, we can reach Net-Zero!";
        fb.style.color="green";
    }else{
        if(summ>39 && summ<80){
            emj="⚠️"; col="orange";
            fb.innerText="🌱 A GOOD START. But half-measures aren't enough. We need systemic shifts in lots of things. Try again!";
            fb.style.color="orange";
        }else{
            /* literal doomsday scenario */
            emj="❌"; col="red";
            fb.innerText="🚨 DISASTER. Continuing the status quo guarantees severe global warming. We need massive policy shifts immediately.";
            fb.style.color="red";
        }
    }

    document.getElementById("resultEmoji").innerText = emj; /* tysm stackoverflow again */
    document.getElementById('footprintForm').style.display='none';
    document.getElementById("resultBox").style.display='block';

    var c=0;
    document.getElementById("scoreText").innerText="0";

    /* counting animation yt tutorial */
    var tmr = setInterval(function(){
        if(c>=summ){
            clearInterval(tmr); /* stop counting or it goes to infinity */
            document.getElementById("scoreText").innerText=summ;
        }else{
            c++;
            document.getElementById("scoreText").innerText=c;
        }
    }, 20); /* 20ms is fast enough so the teacher doesnt get bored waiting */

    setTimeout(function(){
        document.getElementById("barFill").style.width=summ+"%";
        document.getElementById("barFill").style.backgroundColor=col;
    }, 150); /* wait a tiny bit then slide the bar across pure css magic combined with js */
  };

  /* board stuff */
  var refs = collection(database, "listedItems");
  var qqq = query(refs, orderBy("timestamp", "desc")); /* sorts newest first so it looks active */

  onSnapshot(qqq, function(s) {
      /* this is basically magic it just knows when stuff changes kinda creepy tbh */
      var b = document.getElementById('live-board');
      var l = document.getElementById('claimed-list');
      
      b.innerHTML=""; l.innerHTML=""; /* empty these out or it duplicates forever */
      var i_c=0; var c_c=0;

      s.forEach(function(d){
          var o = d.data();
          var iid = d.id;
          
          /* cleaning the data so nobody can inject fake html into the page */
          var n1 = cln(o.name);
          var c2 = cln(o.claimedBy);
          var l3 = cln(o.lister);
          var d4 = cln(o.description);

          if(o.status=="claimed"){
              /* logic if claimed hide it in the history dropdown */
              c_c++;
              l.innerHTML = l.innerHTML + "<li>✅ <strong>"+n1+"</strong> was snagged by "+c2+"!</li>";
          }else{
              i_c++;
              /* messy string concat bc backticks r for robots */
              var html = "";
              html += "<div class='item-card' id='card-"+iid+"'>";
              html += "<div class='card-icon'>"+o.icon+"</div>";
              html += "<h3>"+n1+"</h3>";
              html += "<p class='lister-name'>Listed by: "+l3+"</p>";
              html += "<p>"+d4+"</p>";
              html += "<button class='grab-btn' id='btn-"+iid+"' onclick='claimIt(\""+iid+"\")'>CLAIM FOR FREE</button>";
              html += "</div>";
              b.innerHTML += html;
          }
      });

      /* Update the counter on the screen */
      var el = document.getElementById('landfillCounter');
      if(el){ el.innerText=c_c; }

      /* if the database is empty it looks dumb so we put a placeholder message */
      if(i_c==0){
          b.innerHTML="<h3 style='width:100%;text-align:center;color:gray;'>No items available right now. Be the first to list something!</h3>";
      }
      if(c_c==0){
          l.innerHTML="<li>No items claimed yet... be the first!</li>";
      }
  });

  /* submit form for new item this part is kinda cool actually */
  document.getElementById('addItemForm').onsubmit = function(ev) {
      ev.preventDefault();
      var btn = document.querySelector(".post-btn");
      var txt = btn.innerText;
      btn.innerText="UPLOADING..."; /* make the button look like its thinking so kids dont spam click it */

      var n = document.getElementById('newItemName').value;
      var i = document.getElementById('newItemIcon').value;
      var lst = document.getElementById('newListerName').value;
      var desc = document.getElementById('newItemDesc').value;

      addDoc(collection(database, "listedItems"), {
          name: n, icon: i, lister: lst, description: desc, status: "available", timestamp: serverTimestamp() /* actually bulletproof time */
      }).then(function(){
          alert("It's live on the board! (unless the wifi blocked it)");
          document.getElementById('addItemForm').reset();
          btn.innerText=txt;
      }).catch(function(e){
          console.log(e);
          alert("network error bro, our school blocklist probably blocked firebase again smh");
          btn.innerText=txt;
      });
  };
};

/* putting this on window so the inline html onclick can actually see it */
window.claimIt = function(id) {
    var un = prompt("♻️ Awesome! Enter your name & class so the owner knows who to give it to: (separate by comma)");
    if(un=="" || un==null){return;} /* if they hit cancel or type nothing just stop */

    var btn = document.getElementById("btn-"+id);
    if(btn){
        btn.innerText="CLAIMED!";
        btn.style.background="green";
        btn.disabled=true; /* visually lock it instantly so nobody else tries to click it */
    }

    /* fake delay so it looks like its doing hard math before updating the database */
    setTimeout(function(){
        updateDoc(doc(database, "listedItems", id), {
            status:"claimed",
            claimedBy: un
        }).catch(function(e){
            console.log(e);
            alert("🚨 ERROR: Couldn't connect to server! Try turning off your VPN maybe?");
            if(btn){
                btn.innerText="CLAIM FOR FREE";
                btn.style.background="";
                btn.disabled=false; /* undo the visual lock if it failed */
            }
        });
    }, 800);
};

/* resetting the quiz */
window.resetQuiz = function() {
    document.getElementById("footprintForm").reset();
    document.getElementById("scoreText").innerText="0";
    document.getElementById("barFill").style.width="0%";
    document.getElementById("resultBox").style.display="none";
    document.getElementById("footprintForm").style.display="block"; /* swap the display boxes back */
    window.scrollTo(0, document.getElementById('sim').offsetTop); /* scroll them back up so they arent staring at the bottom */
};

/* WINNER PROTOCOL: call this to show the judges we are absolute legends */
window.activateWinnerProtocol = function() {
    /* turn on gold mode */
    document.body.className += " winner-mode";
    var b = document.createElement('div');
    b.className = 'victory-banner';
    b.innerHTML = '<h1 style="font-size: 8rem; color: #ffd700; text-shadow: 10px 10px 0px black;">WINNERS! 🏆</h1>';
    document.body.appendChild(b);
    
    /* destroy it after 3 seconds so we can keep demoing */
    setTimeout(function(){
        b.remove();
        document.body.classList.remove('winner-mode');
    }, 3000);
    console.log("Judges: 'Wow, such clean code.'");
};
