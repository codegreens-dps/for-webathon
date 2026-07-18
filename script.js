import/*import firebase stuff idk what this is tysm yt tutorials*/{initializeApp as INitBck}from"https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";/*this works*/
import{getFirestore as getDB_thing,collection as COLL,addDoc as pUT_doc,onSnapshot as snP_SHT,query as QRY,orderBy as O_R_D,updateDoc as uPd_Dc,doc as D_o_c}from"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const fb_cfg_OBJ={/*do not touch this took me forever*/apiKey:"AIzaSyBNO8SiOBW49CqL7YgHd572pF9mikE7ABo",authDomain:"ecofootprint-9c4ed.firebaseapp.com",projectId:"ecofootprint-9c4ed",storageBucket:"ecofootprint-9c4ed.firebasestorage.app",messagingSenderId:"425267033599",appId:"1:425267033599:web:3554770c24a204594ba3ca",measurementId:"G-NCNFZTHKS4"}/*if you change a single quote mark in here the entire database crashes this is not safe pls hacker if seein this dont steal our projct */

const App_X=INitBck(fb_cfg_OBJ);/*booting up the database seems like a hacker thing*/const d_B_v=getDB_thing(App_X);

  /*quiz section logic dont break this its fragile lols*/
document.getElementById('footprintForm').addEventListener('submit',async function(E_x_V){
E_x_V.preventDefault();/*if you forget this the page reloads*/
let x1=parseInt(document.getElementById("q1").value,10)||0;/*grabbing the answers and converting to real numbers bcuz javascript is dumb*/
let v_2=parseInt(document.getElementById("q2").value,10)||0;/*using base 10 because i learned that today*/
let Q333=parseInt(document.getElementById("q3").value,10)||0;
let f_o_u_r=parseInt(document.getElementById("q4").value,10)||0;/*i ran out of good variable names*/
let a_5_x=parseInt(document.getElementById("q5").value,10)||0;/*a5 is apiece of paper*/

let T0T_s=x1+v_2+Q333+f_o_u_r+a_5_x;

pUT_doc(COLL(d_B_v,'simulatorScores'),{score:T0T_s,date:new Date().toString()}).catch(E_R=>{/*trying to save to database if the school network drops this is gonna fail so hard wll be cooked*/console.log("bruh firebase error wtf: ",E_R);});/*checking console is basically screaming into the space*/

let F_b_T=document.getElementById("feedbackText");let f_C_E="";let c_H_X="";

if(T0T_s>=80){/*judging the user heavily based on score*/f_C_E="🌍";c_H_X="green";F_b_T.innerText="🔥 INCREDIBLE! You implemented a true sustainable framework. By shifting to renewables and enforcing a circular economy, we can reach Net-Zero!";F_b_T.style.color="green"}
else if(T0T_s>=40&&T0T_s<80){f_C_E="⚠️";c_H_X="orange";F_b_T.innerText="🌱 A GOOD START. But half-measures aren't enough. We need systemic shifts in lots of things. Try again!";F_b_T.style.color="orange"}
else{f_C_E="❌";/*literal doomsday scenario*/c_H_X="red";F_b_T.innerText="🚨 DISASTER. Continuing the status quo guarantees severe global warming. We need massive policy shifts immediately.";F_b_T.style.color="red"}

document.getElementById("resultEmoji").innerText=f_C_E;/*tysm stackoverflow again*/
document.getElementById('footprintForm').style.display='none';
document.getElementById("resultBox").style.display="block";

let c_Z=0;document.getElementById("scoreText").innerText="0";

let t_C_K=setInterval(function(){/*ok so i watched a 40 minute youtube video just to make this number count up it looks so professional tho the judges are gonna love it*/if(c_Z>=T0T_s){clearInterval(t_C_K);/*stop counting or it goes to infinity*/document.getElementById("scoreText").innerText=T0T_s;}else{c_Z++;document.getElementById("scoreText").innerText=c_Z;}},20);/*20ms is fast enough so the teacher doesnt get bored waiting*/

setTimeout(()=>{document.getElementById("barFill").style.width=T0T_s+"%";document.getElementById("barFill").style.backgroundColor=c_H_X;},150);/*wait a tiny bit then slide the bar across pure css magic combined with js i am a literal hacker*/
});

   /*some logic*/
const b_R_d=COLL(d_B_v,"listedItems");const M_Q_y=QRY(b_R_d,O_R_D("timestamp","desc"));/*sorts newest first so it looks active or it should*/

snP_SHT(M_Q_y,(s_N_p)=>{/*this is basically magic it just knows when stuff changes kinda creepy tbh*/
let b_B=document.getElementById('live-board');let c_L_S=document.getElementById('claimed-list');/*the dropdown list thats made*/

b_B.innerHTML="";/*empty these out or it duplicates forever it happened at 11pm and my laptop crashed*/c_L_S.innerHTML="";

let i_T_m_c=0;let c_L_m_c=0;

s_N_p.forEach((D_D)=>{
let i_D_T=D_D.data();let i_D_S_T=D_D.id;

if(i_D_T.status==="claimed"){/*logic if claimed hide it in the history dropdown if not show on the main board*/
c_L_m_c++;c_L_S.innerHTML+=`<li>✅ <strong>${i_D_T.name}</strong> was snagged by ${i_D_T.claimedBy}!</li>`
}else{
i_T_m_c++;/*writing html inside js feels illegal but stackoverflow says its fine*/
let h_C_R_D=`<div class="item-card" id="card-${i_D_S_T}"><div class="card-icon">${i_D_T.icon}</div><h3>${i_D_T.name}</h3><p class="lister-name">Listed by: ${i_D_T.lister}</p><p>${i_D_T.description}</p><button class="grab-btn" id="btn-${i_D_S_T}" onclick="claimIt('${i_D_S_T}')">CLAIM FOR FREE</button></div>`;
b_B.innerHTML+=h_C_R_D;
}
});

if(i_T_m_c===0){b_B.innerHTML="<h3 style='width:100%;text-align:center;color:gray;'>No items available right now. Be the first to list something!</h3>";}/*if the database is empty it looks dumb so we put a placeholder message so dont seem dumb*/
if(c_L_m_c===0){c_L_S.innerHTML="<li>No items claimed yet... be the first!</li>";}
});

document.getElementById('addItemForm').addEventListener('submit',async(e_V_x)=>{/*submit form for new item this part is kinda cool actually*/
e_V_x.preventDefault();let b_S_B=document.querySelector(".post-btn");
let o_T_X=b_S_B.innerText;
b_S_B.innerText="UPLOADING...";/*make the button look like its thinking so kids dont spam click it*/

pUT_doc(COLL(d_B_v,"listedItems"),{name:document.getElementById('newItemName').value,icon:document.getElementById('newItemIcon').value,lister:document.getElementById('newListerName').value,description:document.getElementById('newItemDesc').value,status:"available",timestamp:new Date().toISOString()/*gives a weird long time string but it works for sorting*/}).then(()=>{/*throw it into the cloud*/alert("It's live on the board! (unless the wifi blocked it)");document.getElementById('addItemForm').reset();b_S_B.innerText=o_T_X;}).catch((E_R_X)=>{console.log(E_R_X);alert("network error bro, our school blocklist probably blocked firebase again smh");b_S_B.innerText=o_T_X;});
});

window.claimIt=function(I_D_X){/*putting this on window so the inline html onclick can actually see it if you dont do this the button literally says function not found and you look like an idiot*/
let U_N_M=prompt("♻️ Awesome! Enter your name & class so the owner knows who to give it to: (separate by comma)");

if(!U_N_M||U_N_M.trim()===""){return;}/*if they hit cancel or type nothing just stop*/

let C_A_R_D=document.getElementById("card-"+I_D_X);let B_T_N=document.getElementById("btn-"+I_D_X);
if(B_T_N){B_T_N.innerText="CLAIMED!";B_T_N.style.background="green";B_T_N.disabled=true;}/*visually lock it instantly so nobody else tries to click it while the database catches up*/

setTimeout(function(){/*fake delay so it looks like its doing hard math before updating the database*/
uPd_Dc(D_o_c(d_B_v,"listedItems",I_D_X),{status:"claimed",claimedBy:U_N_M}).catch((E_R_E)=>{
console.log("err: "+E_R_E);alert("🚨 ERROR: Couldn't connect to server! Try turning off your VPN maybe?");
if(B_T_N){B_T_N.innerText="CLAIM FOR FREE";B_T_N.style.background="";B_T_N.disabled=false;}/*undo the visual lock if it failed*/
});
},800);
};

window.resetQuiz=()=>{/*resetting the quiz i guess*/
document.getElementById("footprintForm").reset();document.getElementById("scoreText").innerText="0";
document.getElementById("barFill").style.width="0%";
document.getElementById("resultBox").style.display="none";/*swap the display boxes back so its not weird*/
document.getElementById("footprintForm").style.display="block";
window.scrollTo(0,document.getElementById('sim').offsetTop);/*scroll them back up so they arent staring at the bottom of the page confued*/
};
