// ==========================================
// SDG WEBATHON - JAVASCRIPT LOGIC
// Update: Swapped to 100% grounded, real-world UN SDG 13 policies. 
// Update 2: Added JS logic for the Give & Take Board!
// ==========================================

console.log("%c🌿 TEAM CODEGREENS FOR THE WIN! 🌿", "color: #2ecc71; font-size: 20px; font-weight: bold;");
console.log("Judges, all options in this simulator represent actual, proven climate mitigation strategies.");

window.onload = function() {
    let savedScore = localStorage.getItem("ecoScore");
    if(savedScore) {
        console.log("Last simulated policy score: " + savedScore + "/100");
    }
};

document.getElementById('footprintForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    let q1 = Number(document.getElementById("q1").value);
    let q2 = Number(document.getElementById("q2").value);
    let q3 = Number(document.getElementById("q3").value);
    let q4 = Number(document.getElementById("q4").value);
    let q5 = Number(document.getElementById("q5").value);

    // Max score is exactly 100! (5 questions * 20 points)
    let totalScore = q1 + q2 + q3 + q4 + q5;

    // Save to local storage to flex on the judges
    localStorage.setItem("ecoScore", totalScore);

    let scoreDisplay = document.getElementById("scoreDisplay");
    let feedbackText = document.getElementById("feedbackText");
    let resultBox = document.getElementById("resultBox");
    let resultEmoji = document.getElementById("resultEmoji");
    let scoreBarFill = document.getElementById("scoreBarFill");

    let emoji = "";
    let barColor = "";

    // 🔥 LOGIC: High score = Perfect Real-World Policy Implementation 🔥
    if (totalScore >= 80) {
        emoji = "🌍🏆";
        barColor = "#2ecc71"; // Green = W
        feedbackText.innerHTML = "🔥 INCREDIBLE! You implemented a true sustainable framework. By shifting to renewables, protecting natural carbon sinks, and enforcing a circular economy, we can actually reach Net-Zero by 2050!";
        feedbackText.style.color = "#27ae60"; 
    } else if (totalScore >= 40 && totalScore < 80) {
        emoji = "⚠️📉";
        barColor = "#ffeb3b"; // Yellow = Mid
        feedbackText.innerHTML = "🌱 A GOOD START. Half-measures like EVs and recycling are helpful, but without systemic shifts in agriculture, public transit, and ending fossil fuels, we will still miss our climate targets. Try again!";
        feedbackText.style.color = "#d35400"; 
    } else {
        emoji = "🏭❌";
        barColor = "#ff5252"; // Red = Cooked
        feedbackText.innerHTML = "🚨 DISASTER. Continuing the status quo with fossil fuels, deforestation, and a linear 'throw-away' economy guarantees severe global warming. We need radical policy shifts immediately.";
        feedbackText.style.color = "#c0392b"; 
    }

    resultEmoji.innerHTML = emoji;
    document.getElementById('footprintForm').style.display = 'none';
    resultBox.style.display = "block";

    // Animated number counter from 0 to their score
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

    // Animate the progress bar
    setTimeout(() => {
        scoreBarFill.style.width = totalScore + "%";
        scoreBarFill.style.backgroundColor = barColor;
    }, 100);
});

function resetQuiz() {
    document.getElementById("footprintForm").reset();
    document.getElementById("scoreDisplay").innerHTML = "0";
    document.getElementById("scoreBarFill").style.width = "0%";
    
    document.getElementById("resultBox").style.display = "none";
    document.getElementById("footprintForm").style.display = "block";
    
    document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// THE GIVE & TAKE BOARD LOGIC
// bro this makes the buttons actually work
// ==========================================
function claimItem(itemId) {
    // get the specific button they clicked
    let btn = document.getElementById("btn-" + itemId);
    
    // pop an alert to make it feel real
    alert("♻️ Circular Economy WIN! You just claimed this item. Go meet the senior in the cafeteria to pick it up!");

    // change the button text and disable it so nobody else can click it
    btn.innerHTML = "CLAIMED ❌";
    btn.disabled = true;
    
    // change the card's border to grey to show it's gone
    document.getElementById("card-" + itemId).style.borderColor = "#9e9e9e";
    document.getElementById("card-" + itemId).style.boxShadow = "none";
}
