const colors=["red","yellow","green","blue"];
const faces=["","⚀","⚁","⚂","⚃","⚄","⚅"];
const emoji={red:"🔴",green:"🟢",yellow:"🟡",blue:"🔵"};

const board=document.getElementById("board");
const dice=document.getElementById("dice");
const rollButton=document.getElementById("rollButton");
const winningColor=document.getElementById("winningColor");
const turnText=document.getElementById("turnText");
const message=document.getElementById("message");
const rollResult=document.getElementById("rollResult");
const players=document.getElementById("players");
const newGame=document.getElementById("newGame");

let turn=2; // Green starts
let winProgress=0;
let winner=null;
let busy=false;

function cell(cls="", text=""){
  const el=document.createElement("div");
  el.className="cell "+cls;
  if(text) el.textContent=text;
  return el;
}

function buildTracks(){
  const top=document.getElementById("topTrack");
  const bottom=document.getElementById("bottomTrack");
  const left=document.getElementById("leftTrack");
  const right=document.getElementById("rightTrack");

  // Three-column vertical tracks. Coloured inner lanes mimic classic Ludo.
  for(let r=0;r<18;r++){
    const c=r%3;
    let t=cell();
    if(c===1 && r>=1 && r<=5) t.classList.add("home-yellow");
    if(r===0 && c===1) t.classList.add("arrow");
    if(r===2 && c===0) t.classList.add("star");
    top.appendChild(t);

    let b=cell();
    if(c===1 && r>=0 && r<=4) b.classList.add("home-blue");
    if(r===17 && c===1) b.classList.add("arrow");
    if(r===15 && c===2) b.classList.add("star");
    bottom.appendChild(b);
  }

  // Six-column horizontal tracks, repeated as 18 cells.
  for(let r=0;r<3;r++){
    for(let c=0;c<6;c++){
      let l=cell();
      if(r===1 && c>=0 && c<=4) l.classList.add("home-red");
      if(r===1 && c===0) l.classList.add("arrow");
      if(r===2 && c===2) l.classList.add("star");
      left.appendChild(l);

      let rr=cell();
      if(r===1 && c>=1 && c<=5) rr.classList.add("home-yellow");
      if(r===1 && c===5) rr.classList.add("arrow");
      if(r===0 && c===4) rr.classList.add("star");
      right.appendChild(rr);
    }
  }
}

function renderPlayers(){
  players.innerHTML="";
  colors.forEach((c,i)=>{
    const el=document.createElement("div");
    el.className="player "+(i===turn&&!winner?"active":"");
    el.textContent=emoji[c]+" "+c.toUpperCase();
    players.appendChild(el);
  });
}

function normalRoll(){return Math.floor(Math.random()*6)+1}
function demoRoll(){
  const c=colors[turn];
  if(c===winningColor.value) return [4,5,6][Math.floor(Math.random()*3)];
  return normalRoll();
}

function animateToken(color){
  const token=document.querySelector(`.token.${color}`);
  if(token){
    token.animate([
      {transform:"translateY(0)"},
      {transform:"translateY(-8px)"},
      {transform:"translateY(0)"}
    ],{duration:350});
  }
}

function roll(){
  if(busy||winner)return;
  busy=true;
  rollButton.disabled=true;
  let count=0;
  const timer=setInterval(()=>{
    dice.textContent=faces[normalRoll()];
    count++;
    if(count>=8){
      clearInterval(timer);
      const value=demoRoll();
      const color=colors[turn];
      dice.textContent=faces[value];
      rollResult.textContent=`${emoji[color]} ${color.toUpperCase()} rolled ${value}`;
      animateToken(color);

      if(color===winningColor.value){
        winProgress+=value;
        message.textContent=`${color.toUpperCase()} demo progress: ${winProgress}/30`;
        if(winProgress>=30){
          finish();
          return;
        }
      }else{
        message.textContent=`${color.toUpperCase()} rolled ${value}.`;
      }

      // Classic six = another turn.
      if(value!==6) turn=(turn+1)%4;
      turnText.textContent=winner?`🏆 ${winner.toUpperCase()} WINS!`:`${emoji[colors[turn]]} ${colors[turn].toUpperCase()}'S TURN`;
      renderPlayers();
      busy=false;
      rollButton.disabled=false;
    }
  },75);
}

function finish(){
  winner=winningColor.value;
  turnText.textContent=`🏆 ${emoji[winner]} ${winner.toUpperCase()} WINS!`;
  message.textContent=`Demo winner: ${winner.toUpperCase()}.`;
  rollResult.textContent=`Game finished`;
  rollButton.disabled=true;
  busy=false;
  board.animate([{transform:"scale(1)"},{transform:"scale(1.02)"},{transform:"scale(1)"}],{duration:500,iterations:4});
  renderPlayers();
}

function reset(){
  turn=2; winProgress=0; winner=null; busy=false;
  dice.textContent="⚀";
  rollResult.textContent="Ready";
  message.textContent="Roll the dice to start.";
  turnText.textContent="🟢 Green's Turn";
  rollButton.disabled=false;
  renderPlayers();
}

document.querySelectorAll(".token").forEach(token=>{
  token.addEventListener("click",()=>{
    if(winner)return;
    const color=token.dataset.color;
    message.textContent=`${emoji[color]} ${color.toUpperCase()} token selected. Roll the dice to move.`;
    token.animate([{transform:"scale(1)"},{transform:"scale(1.12)"},{transform:"scale(1)"}],{duration:250});
  });
});

rollButton.addEventListener("click",roll);
newGame.addEventListener("click",reset);
winningColor.addEventListener("change",reset);

buildTracks();
renderPlayers();
