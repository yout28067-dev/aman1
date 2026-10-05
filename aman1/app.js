const password = document.querySelector('#password');
const toggle = document.querySelector('#toggleVisibility');
const meter = document.querySelector('.meter');
const bars = [...meter.querySelectorAll('i')];
const label = document.querySelector('#strengthLabel');
const scoreText = document.querySelector('#score');
const crackTime = document.querySelector('#crackTime');
const crackDetail = document.querySelector('#crackDetail');
const advice = document.querySelector('#advice');
const commonWords = ['password','qwerty','letmein','welcome','admin','iloveyou','monkey','dragon','football','baseball','abc','123456','india'];

function assess(value) {
  const hasLower = /[a-z]/.test(value), hasUpper = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value), hasSymbol = /[^A-Za-z0-9]/.test(value);
  const lower = value.toLowerCase();
  const common = commonWords.some(word => lower.includes(word)) || /(.)\1\1/.test(value) || /(?:123|234|345|456|567|678|789|abc)/i.test(value);
  let score = Math.min(value.length * 4, 40);
  score += hasLower && hasUpper ? 15 : 0;
  score += hasNumber ? 15 : 0;
  score += hasSymbol ? 15 : 0;
  score += value.length >= 16 ? 10 : 0;
  score -= common ? 35 : 0;
  return { score: Math.max(0, Math.min(100, score)), hasLower, hasUpper, hasNumber, hasSymbol, common };
}
function setCheck(name, pass, text) {
  const el = document.querySelector(`[data-check="${name}"]`);
  el.classList.toggle('pass', pass); el.querySelector('small').textContent = text;
}
function update() {
  const value = password.value; const a = assess(value);
  setCheck('length', value.length >= 12, `${value.length} / 12`);
  setCheck('case', a.hasLower && a.hasUpper, a.hasLower && a.hasUpper ? 'GOOD' : 'NEEDED');
  setCheck('number', a.hasNumber, a.hasNumber ? 'GOOD' : 'NEEDED');
  setCheck('symbol', a.hasSymbol, a.hasSymbol ? 'GOOD' : 'NEEDED');
  setCheck('unique', value.length > 0 && !a.common, !value.length ? '—' : a.common ? 'RISK' : 'CLEAR');
  const level = !value ? 0 : a.score < 35 ? 1 : a.score < 60 ? 2 : a.score < 80 ? 3 : 4;
  const names = ['Waiting for input','Weak','Fair','Strong','Excellent'];
  bars.forEach((bar,i) => bar.classList.toggle('on', i < level));
  meter.className = `meter level-${level}`; label.textContent = names[level]; scoreText.textContent = `${a.score} / 100`;
  const times = ['—','seconds','a few hours','several years','centuries'];
  crackTime.textContent = times[level];
  crackDetail.textContent = !value ? 'Enter a password to estimate.' : level < 2 ? 'Easily guessed with common attack tools.' : level < 3 ? 'Improving, but predictable patterns lower protection.' : level < 4 ? 'A solid defense against typical attacks.' : 'Excellent variety and length make this resilient.';
  if (!value) advice.textContent = 'Start by entering a password above. We’ll point out the highest-impact improvements.';
  else if (a.common) advice.textContent = 'Avoid common words, sequences, and repeated characters. They are tried first in password attacks.';
  else if (value.length < 12) advice.textContent = `Add ${12-value.length} or more characters. Longer passwords are dramatically harder to guess.`;
  else if (!a.hasLower || !a.hasUpper) advice.textContent = 'Mix uppercase and lowercase letters to expand the possible combinations.';
  else if (!a.hasNumber || !a.hasSymbol) advice.textContent = 'Add a number and a symbol in an unexpected position to increase complexity.';
  else advice.textContent = 'Looking good. Save this password in a trusted password manager and avoid reusing it anywhere.';
}
function makePassword(){
  const words=['orbit','copper','meadow','velvet','harbor','lantern','comet','cactus'];
  const random = new Uint32Array(4); crypto.getRandomValues(random);
  return `${words[random[0]%words.length]}${words[random[1]%words.length].replace(/^./,c=>c.toUpperCase())}${random[2]%90+10}!${['#','%','&','@'][random[3]%4]}`;
}
toggle.addEventListener('click',()=>{const shown=password.type==='text';password.type=shown?'password':'text';toggle.textContent=shown?'SHOW':'HIDE';toggle.setAttribute('aria-label',shown?'Show password':'Hide password')});
password.addEventListener('input',update);
document.querySelector('#generate').addEventListener('click',()=>{const generated=makePassword();document.querySelector('#generatedPassword').textContent=generated;document.querySelector('#generatedBox').hidden=false});
document.querySelector('#copyPassword').addEventListener('click', async e=>{const value=document.querySelector('#generatedPassword').textContent;try{await navigator.clipboard.writeText(value);e.target.textContent='COPIED'}catch{e.target.textContent='SELECT TO COPY'}setTimeout(()=>e.target.textContent='COPY',1400)});
update();
