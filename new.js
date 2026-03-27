const $ = id => document.getElementById(id);
console.log('new.js loaded');

// === PLAYER & STATS ===
let player = {
  name: "",
  city: "",
  college: false,
  job: "",
  jobTrack: "",
  lifestyle: "roommate",
  dailyPay: 0,
  promoted: false,
  infected: false
};

let stats = {
  money: 300,
  savings: 0,
  debt: 1000,
  creditScore: 580,
  stress: 60,
  mental: 50,
  physical: 50,
  social: 30,
  totalBills: 0,
  mood: "😞 Low"
};

let week = 1;
let questionCount = 0;
let achievements = {
  bigWallet: false,
  luckyDucky: false,
  socialButterfly: false,
  highRoller: false
};

  let tooltipShown = {
  stress: false,
  mental: false,
  money: false
};

// === THEMES ===
const themeCycle = ["rain", "fog", "sunset"];
const themes = {
  rain: { image: "rain.gif", audio: "rain.mp3" },
  fog: { image: "fog.gif", audio: "fog.mp3" },
  sunset: { image: "sunset.png", audio: "birds.mp3" }
};

function switchTheme(themeName) {
  const theme = themes[themeName];
  const body = document.getElementById("theme-background");
  const audio = document.getElementById("ambient-audio");

  if (!theme) return;

  if (body && theme.image) {
    try {
      body.style.backgroundImage = `url(${theme.image})`;
    } catch (e) {}
  }

  if (audio && theme.audio) {
    try {
      audio.src = theme.audio;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
    } catch (e) {}
  }
}

const weeklyGoals = {
  1: [
    { desc: "Stress below 80", check: () => stats.stress < 80 },
    { desc: "Mental above 40", check: () => stats.mental > 40 },
    { desc: "Physical above 40", check: () => stats.physical > 40 },
    { desc: "Social above 20", check: () => stats.social > 20 },
    { desc: "Money at least $200", check: () => stats.money >= 200 },
    { desc: "Credit Score at least 550", check: () => stats.creditScore >= 550 }
  ],
  2: [
    { desc: "Stress below 75", check: () => stats.stress < 75 },
    { desc: "Mental above 45", check: () => stats.mental > 45 },
    { desc: "Physical above 45", check: () => stats.physical > 45 },
    { desc: "Social above 25", check: () => stats.social > 25 },
    { desc: "Money at least $300", check: () => stats.money >= 300 },
    { desc: "Savings at least $50", check: () => stats.savings >= 50 }
  ],
  3: [
    { desc: "Stress below 70", check: () => stats.stress < 70 },
    { desc: "Mental above 50", check: () => stats.mental > 50 },
    { desc: "Physical above 50", check: () => stats.physical > 50 },
    { desc: "Social above 30", check: () => stats.social > 30 },
    { desc: "Money at least $400", check: () => stats.money >= 400 },
    { desc: "Savings at least $100", check: () => stats.savings >= 100 },
    { desc: "Debt below $1200", check: () => stats.debt <= 1200 }
  ]
};

const lifeQuestions = [
  // 🔥 Pivotal 1: Housing Crisis
  {
    prompt: "Your landlord just raised your rent by 40%. You can’t afford to stay unless you make a drastic change.",
    important: true,
    options: [
      { text: "Take a second job", effects: { stress: 20, physical: -10 } },
      { text: "Move in with family", effects: { stress: -10, social: -10, mental: 5 } },
      { text: "Apply for emergency housing aid", effects: { money: 300, debt: 500, creditScore: -20 } }
    ]
  },
  // 🔥 Pivotal 2: COVID Outbreak
  {
    prompt: "A COVID outbreak hits your city. Your boss offers double pay if you keep coming in.",
    important: true,
    options: [
      {
        text: "Go to work — I need the money",
        effects: { money: 300, stress: 10 },
        risk: {
          chance: 0.75,
          consequence: () => {
            player.infected = true;
            showNotification("You got infected. -20 physical each week.");
          }
        }
      },
      { text: "Refuse and stay home", effects: { money: -100, stress: -10, mental: 10 } },
      { text: "Negotiate remote work", effects: { money: 100, stress: -5, creditScore: 5 } }
    ]
  },
  // 🔥 Pivotal 3: Mental Health Crisis
  {
    prompt: "You’ve been exhausted, anxious, and numb. It’s affecting your job and relationships.",
    important: true,
    options: [
      { text: "Seek therapy and take time off", effects: { money: -200, mental: 25, stress: -20 } },
      { text: "Push through and keep working", effects: { money: 150, stress: 25, mental: -20, physical: -10 } },
      { text: "Open up to friends", effects: { social: 15, mental: 10, stress: -10 } }
    ]
  },
  // 🔥 Pivotal 4: Tech Layoff
  {
    prompt: "You’ve just been laid off in a wave of cuts. Severance is small and rent is due soon.",
    important: true,
    options: [
      { text: "Grab any lower-paying job", effects: { money: 100, stress: 10, mental: -5 } },
      { text: "Try freelancing and gig work", effects: { money: 50, stress: 15, mental: 5, social: 5 } },
      { text: "Move back home and retrain", effects: { money: -100, stress: -10, mental: 10, social: -5 } }
    ]
  },
  {
    prompt: "Your paycheck is delayed due to a banking error. Rent is due tomorrow.",
    options: [
      { text: "Take out a payday loan", effects: { money: 300, debt: 400, stress: 15, creditScore: -15 } },
      { text: "Borrow from a friend", effects: { money: 200, social: -10, stress: 10 } },
      { text: "Miss rent", effects: { stress: 25, creditScore: -30 } }
    ]
  },
  {
    prompt: "Your car breaks down on the way to work.",
    options: [
      { text: "Pay $500 to fix it", effects: { money: -500, stress: -5 } },
      { text: "Take the bus for now", effects: { stress: 10, physical: -5 } },
      { text: "Call out of work", effects: { money: -100, creditScore: -10 } }
    ]
  },
  {
    prompt: "You’re offered overtime this weekend.",
    options: [
      { text: "Take it", effects: { money: 150, stress: 15, physical: -10 } },
      { text: "Take half the hours", effects: { money: 75, stress: 5 } },
      { text: "Decline", effects: { mental: 10, stress: -5 } }
    ]
  },
  {
    prompt: "You’re behind on your credit card payments.",
    options: [
      { text: "Pay minimum ($100)", effects: { money: -100, creditScore: 5 } },
      { text: "Ignore it", effects: { creditScore: -20, stress: 10 } },
      { text: "Call and negotiate", effects: { stress: -5, creditScore: -5 } }
    ]
  },
  {
    prompt: "You’re invited to a friend’s birthday dinner.",
    options: [
      { text: "Go and spend $40", effects: { money: -40, social: 15, mental: 5 } },
      { text: "Call instead", effects: { social: 5, mental: 5 } },
      { text: "Skip it", effects: { social: -10, stress: 5 } }
    ]
  },
  {
    prompt: "You’re offered a high-interest credit card.",
    options: [
      { text: "Accept and use it", effects: { debt: 500, creditScore: 10, stress: 10 } },
      { text: "Decline", effects: {} },
      { text: "Accept but don’t use it", effects: { creditScore: 5 } }
    ]
  },
  {
    prompt: "You’re feeling physically drained.",
    options: [
      { text: "Take a fitness class", effects: { money: -30, physical: 15 } },
      { text: "Sleep in all weekend", effects: { physical: 10, stress: -10 } },
      { text: "Ignore it", effects: { physical: -10, stress: 10 } }
    ]
  },
  {
    prompt: "You’re offered a freelance gig with tight deadlines.",
    options: [
      { text: "Take it", effects: { money: 200, stress: 20, mental: -5 } },
      { text: "Negotiate timeline", effects: { money: 100, stress: 5 } },
      { text: "Decline", effects: { mental: 10, stress: -5 } }
    ]
  },
  {
    prompt: "You’re considering going back to school.",
    options: [
      { text: "Enroll part-time", effects: { money: -200, mental: 15, stress: 10 } },
      { text: "Wait and save more", effects: { money: 50, stress: -5 } },
      { text: "Take free online courses", effects: { mental: 10 } }
    ]
  },
  {
    prompt: "You’re invited to a protest for a cause you care about.",
    options: [
      { text: "Attend", effects: { mental: 10, social: 10, stress: 5 } },
      { text: "Donate instead", effects: { money: -50, mental: 5 } },
      { text: "Stay out of it", effects: {} }
    ]
  },
  {
    prompt: "You’re offered a promotion with longer hours.",
    options: [
      { text: "Accept it", effects: { dailyPay: 50, stress: 15, physical: -10 } },
      { text: "Decline it", effects: { mental: 10, stress: -5 } },
      { text: "Negotiate for flexibility", effects: { dailyPay: 20, stress: 5, social: 5 } }
    ]
  },
  {
    prompt: "You’re behind on utility bills.",
    options: [
      { text: "Pay full amount", effects: { money: -200, creditScore: 10 } },
      { text: "Pay half", effects: { money: -100, creditScore: -5 } },
      { text: "Ignore it", effects: { creditScore: -20, stress: 10 } }
    ]
  },
  {
    prompt: "You’re feeling isolated.",
    options: [
      { text: "Host a dinner", effects: { money: -40, social: 20, mental: 5 } },
      { text: "Call a friend", effects: { social: 10, mental: 5 } },
      { text: "Do nothing", effects: { stress: 10, mental: -5 } }
    ]
  },
  {
  prompt: "You’re offered a risky crypto investment.",
  options: [
    {
      text: "Invest $100",
      effects: { money: -100 },
      risk: {
        chance: 0.5,
        consequence: () => {
          stats.money += 200;
          showNotification("Your crypto doubled! You gained $200.");
        }
      }
    },
    { text: "Wait and research", effects: { mental: 5, stress: -5 } },
    { text: "Ignore it", effects: {} }
  ]
},
{
  prompt: "You’re feeling overwhelmed by everything.",
  options: [
    { text: "Take a mental health day", effects: { mental: 15, stress: -15, money: -50 } },
    { text: "Push through", effects: { stress: 10, physical: -10 } },
    { text: "Talk to your boss", effects: { stress: -5, social: 5 } }
  ]
},
{
  prompt: "You’re offered a side hustle opportunity.",
  options: [
    { text: "Take it", effects: { money: 150, stress: 10, physical: -5 } },
    { text: "Decline", effects: { mental: 5, stress: -5 } },
    { text: "Try it for a week", effects: { money: 75, stress: 5 } }
  ]
},
{
  prompt: "You’re invited to a networking event.",
  options: [
    { text: "Attend", effects: { social: 15, stress: 5 } },
    { text: "Skip it", effects: { mental: 5, social: -5 } },
    { text: "Volunteer to help", effects: { social: 10, stress: 10, mental: 5 } }
  ]
},
{
  prompt: "You’re offered a loan to consolidate your debt.",
  options: [
    { text: "Take it", effects: { debt: -300, creditScore: 20, stress: -10 } },
    { text: "Decline", effects: {} },
    { text: "Take it and spend some", effects: { debt: -100, money: 200, creditScore: 5 } }
  ]
}
];
// Define your full list of life questions


// Create a shuffled copy of the questions
let shuffledQuestions = [];

// Shuffle function
function shuffleQuestions(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function withdrawMoney(amount) {
  if (stats.savings >= amount) {
    stats.savings -= amount;
    stats.money += amount;
    showNotification(`Withdrew $${amount} from savings.`);
  } else {
    showNotification("Not enough savings to withdraw.");
  }
  updateStats();
}

function gamble(amount) {
  if (stats.money < amount) {
    showNotification("Not enough money to gamble.");
    return;
  if (stats.money > amount) {
    renderGambleTab();
  }
  }

  stats.money -= amount;

  // 40% chance to win
  const winChance = Math.random();                                                  
  if (winChance < 0.3) {
    const winnings = amount * 2;
    stats.money += winnings;
    stats.stress -= 5;
    stats.mental += 5;
    showNotification(`🎉 You won the gamble! +$${winnings}, -Stress, +Mental`);
  } else {
    stats.stress += 10;
    stats.mental -= 5;
    showNotification(" You lost the gamble. -Money, +Stress, -Mental");
  }

  updateStats();
}


shuffledQuestions = shuffleQuestions(lifeQuestions);

function applyLifeChoice(index) {
  const q = shuffledQuestions[questionCount];
  const choice = q.options[index];
  const effects = choice.effects || {};

  // Apply effects to stats
  for (let key in effects) {
    if (key === "dailyPay") {
      player.dailyPay += effects[key];
    } else if (stats.hasOwnProperty(key)) {
      stats[key] += effects[key];
    }
  }

  // Handle risk-based consequences
  if (choice.risk && Math.random() < choice.risk.chance) {
    choice.risk.consequence();
  }

  questionCount++;

  // Rotate theme
  const themeIndex = questionCount % themeCycle.length;
  switchTheme(themeCycle[themeIndex]);

  // Weekly wrap-up every 7 questions
  if (questionCount % 7 === 0) {
    week++;

    // Check weekly goals
const goals = weeklyGoals[week - 1]; // check the week that just ended

for (let g of goals) {
  if (!g.check()) {
    $("game-ui").innerHTML = `
      <div class="game-over">
        <h2>💀 You failed a weekly goal</h2>
        <p>Failed Goal: ${g.desc}</p>
        <button onclick="location.reload()">🔁 Try Again</button>
      </div>
    `;
    $("ambient-audio").pause();
    return;
  }
}

// If all goals passed, show success
showNotification(`🎉 All Week ${week - 1} goals completed!`);
//

    // Paycheck
    const paycheck = player.dailyPay * 5;
    stats.money += paycheck;
    showNotification(`Week ${week - 1} ended. +$${paycheck} paycheck.`);

    // Bills
    let baseBills = 900;
    if (player.lifestyle === "roommate") baseBills = 600;
    if (player.lifestyle === "loft") baseBills = 1400;
    stats.totalBills += baseBills;
    stats.money -= baseBills;
    showNotification(`$${baseBills} in bills paid.`);

    // Promotion logic
    if (!player.promoted && stats.mental > 70 && stats.stress < 40) {
      player.promoted = true;
      player.dailyPay += 50;
      showNotification(` Promotion! Your new role pays $${player.dailyPay}/day.`);
    }

    maybeShowMonologue();
  }

  // Ongoing COVID penalty
  if (player.infected) {
    stats.physical -= 20;
    showNotification("You're still recovering from COVID. -20 Physical Health.");
  }

  // Unlock summary tab at end
  if (questionCount >= 21) {
    $("summary-tab-button").style.display = "inline-block";
    showNotification(" You've completed 3 weeks. Summary unlocked.");
  }

  updstats();
  renderLifeTab();
}

function calculateMood() {
  const score = stats.mental + stats.social + stats.physical - stats.stress;
  if (score >= 250) return "😄 Uplifted";
  if (score >= 180) return "🙂 Good";
  if (score >= 120) return "😐 Stable";
  if (score >= 60) return "😞 Low";
  return "💀 Burned Out";
}
function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  $(tabId).classList.add("active");
}

// === LIFE TAB ===
function renderLifeTab() {
  showTab("life-tab");

  if (questionCount >= 21) {
    $("life-tab").innerHTML = `
      <h3>🏁 Three Weeks Complete</h3>
      <p>You’ve reached the end of your 3-week journey.</p>
      <p>Head to the <strong>Summary</strong> tab to see how your life turned out.</p>
    `;
    return;
  }

  const q = shuffledQuestions[questionCount];
  $("life-tab").innerHTML = `
    <h3>🧠 Life Choice</h3>
    <p><strong>Week ${week}</strong> • Question ${questionCount + 1} of 21</p>
    <p>${q.prompt}</p>
    <div class="button-group">
      ${q.options.map((opt, i) => `<button onclick="applyLifeChoice(${i})">${opt.text}</button>`).join("")}
    </div>
  `;
}

// === CAREER TAB ===
function renderCareerTab() {
  showTab("career-tab");
  $("career-tab").innerHTML = `
    <h3>💼 Career</h3>
    <p><strong>Job:</strong> ${player.job}</p>
    <p><strong>Daily Pay:</strong> $${player.dailyPay}</p>
    <div class="button-group">
      <button onclick="careerBoost()">Take a course (-$200, +Pay)</button>
      <button onclick="network()">Network (+Social)</button>
    </div>
  `;
}

// === HEALTH TAB ===
function renderHealthTab() {
  showTab("health-tab");
  $("health-tab").innerHTML = `
    <h3>💪 Health</h3>
    <p>Take care of your body and mind.</p>
    <div class="button-group">
      <button onclick="improveHealth('mental')">Meditate (+Mental, -$20)</button>
      <button onclick="improveHealth('physical')">Workout (+Physical)</button>
      <button onclick="improveHealth('rest')">Rest (-Stress)</button>
    </div>
  `;
}

// === SOCIAL TAB ===
function renderSocialTab() {
  showTab("social-tab");
  $("social-tab").innerHTML = `
    <h3>💛 Social</h3>
    <p><strong>Social Capital:</strong> ${stats.social}</p>
    <div class="button-group">
      <button onclick="socialize('hangout')">Hang out (-$30, +Social)</button>
      <button onclick="socialize('call')">Call a friend (+Social)</button>
      <button onclick="socialize('skip')">Skip</button>
    </div>
  `;
}

// === SAVE TAB ===
function renderSaveTab() {
  showTab("save-tab");
  $("save-tab").innerHTML = `
    <h3>💾 Save & Withdraw</h3>
    <div class="button-group">
      <button onclick="saveMoney(50)">Save $50</button>
      <button onclick="saveMoney(100)">Save $100</button>
      <button onclick="saveMoney(200)">Save $200</button>
    </div>
    <h4>Withdraw from Savings</h4>
    <div class="button-group">
      <button onclick="withdrawMoney(50)">Withdraw $50</button>
      <button onclick="withdrawMoney(100)">Withdraw $100</button>
      <button onclick="withdrawMoney(200)">Withdraw $200</button>
    </div>
  `;
}

// === INVEST TAB ===
function renderInvestTab() {
  showTab("invest-tab");
  $("invest-tab").innerHTML = `
    <h3> Invest</h3>
    <p>Choose an investment:</p>
    <div class="button-group">
      <button onclick="invest('stocks')">Buy Stocks ($200)</button>
      <button onclick="invest('crypto')">Buy Crypto ($100)</button>
      <button onclick="invest('skip')">Skip</button>
    </div>
  `;
}

// === BILLS TAB ===
function renderBillsTab() {
  showTab("bills-tab");
  $("bills-tab").innerHTML = `
    <h3> Bills</h3>
    <p><strong>Total Bills:</strong> $${stats.totalBills}</p>
    <p>Paying bills on time helps your credit score.</p>
    <div class="button-group">
      <button onclick="payBills()">Pay $${stats.totalBills}</button>
    </div>
  `;
}

// === DEBT TAB ===
function renderDebtTab() {
  showTab("debt-tab");
  $("debt-tab").innerHTML = `
    <h3> Debt</h3>
    <p><strong>Current Debt:</strong> $${stats.debt}</p>
    <p>Paying off debt improves your credit score.</p>
    <div class="button-group">
      <button onclick="payDebt(100)">Pay $100</button>
      <button onclick="payDebt(300)">Pay $300</button>
      <button onclick="payDebt(500)">Pay $500</button>
    </div>
  `;
}


// === GAMBLE TAB ===
function renderGambleTab() {
  showTab("gamble-tab");
  $("gamble-tab").innerHTML = `
    <h3> Gamble</h3>
    <p>You visit a local casino. Feeling lucky?</p>
    <div class="button-group">
      <button onclick="gamble(50)">Bet $50</button>
      <button onclick="gamble(100)">Bet $100</button>
      <button onclick="gamble(200)">Bet $200</button>
    </div>
  `;


  // Attach event listeners so clicks call the current `gamble` implementation
  const buttons = $("gamble-tab").querySelectorAll('button[data-bet]');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const amt = Number(btn.getAttribute('data-bet')) || 0;
      try {
        gamble(amt);
      } catch (err) {
        console.error('gamble handler error', err);
        // fallback: queue if gamble not ready
        window._pendingGambles = window._pendingGambles || [];
        window._pendingGambles.push(amt);
      }
    });
  });
}

// === SUMMARY TAB ===
function getArchetype() {
  const { money, stress, mental, physical, social, savings, debt } = stats;

  if (savings > 1000 && debt === 0 && mental > 70) return "The Strategist";
  if (money > 1500 && stress > 70) return "The Hustler";
  if (social > 80 && money < 300) return "The Connector";
  if (stress > 90 || mental < 20) return "The Burnout";
  if (savings < 100 && debt > 1500) return "The Survivor";
  if (physical > 80 && mental > 80) return "The Zen Master";

  return "The Wanderer";
}
function takeLoan(amount, interestRate) {
  const interest = Math.floor(amount * interestRate);
  const totalOwed = amount + interest;

  stats.money += amount;
  stats.debt += totalOwed;
  stats.creditScore -= 10; // taking loans hurts credit slightly
  stats.stress += 5;

  showNotification(`You took a $${amount} loan. You owe $${totalOwed} total.`);
  updstats();
  renderLoanTab();
}
function renderAchievementsTab() {
  showTab("achievements-tab");

  const c = document.getElementById("achievements-list");
  c.innerHTML = "";

  function row(name, unlocked) {
    const d = document.createElement("div");
    d.className = "ach-row" + (unlocked ? " unlocked" : " locked");
    d.textContent = name + (unlocked ? " ✓" : " ✗");
    c.appendChild(d);
  }

  row("Big Wallet", achievements.bigWallet);
  row("Lucky Ducky", achievements.luckyDucky);
  row("Social Butterfly", achievements.socialButterfly);
  row("High Roller", achievements.highRoller);

}
function renderLoanTab() {
  showTab("loan-tab");

  const cs = stats.creditScore;
  let plans = [];

  if (cs >= 700) {
    plans = [
      { amount: 500, rate: 0.10 },
      { amount: 1000, rate: 0.10 },
      { amount: 2000, rate: 0.10 }
    ];
  } else if (cs >= 600) {
    plans = [
      { amount: 300, rate: 0.20 },
      { amount: 600, rate: 0.20 },
      { amount: 1000, rate: 0.20 }
    ];
  } else {
    plans = [
      { amount: 100, rate: 0.35 },
      { amount: 200, rate: 0.35 },
      { amount: 300, rate: 0.35 }
    ];
  }

  $("loan-tab").innerHTML = `
    <h3>🏦 Loan Options</h3>
    <p><strong>Your Credit Score:</strong> ${stats.creditScore}</p>
    <p>Select a loan plan:</p>
    <div class="button-group">
      ${plans.map(p => `
        <button onclick="takeLoan(${p.amount}, ${p.rate})">
          Borrow $${p.amount} (Interest: ${p.rate * 100}%)
        </button>
      `).join("")}
    </div>
  `;
}
function renderSummaryTab() {
  showTab("summary-tab");

  if (questionCount < 21) {
    $("summary-tab").innerHTML = `<p>Summary unlocks after 3 weeks of choices.</p>`;
    return;
  }

  const net = stats.money - stats.totalBills;
  const score = stats.money + stats.savings + stats.creditScore + stats.mental + stats.physical + stats.social - (stats.stress * 5);
  const archetype = getArchetype();

  $("summary-tab").innerHTML = `
    <h3> Life Summary</h3>
    <p><strong>Money:</strong> $${stats.money}</p>
    <p><strong>Savings:</strong> $${stats.savings}</p>
    <p><strong>Debt:</strong> $${stats.debt}</p>
    <p><strong>Credit Score:</strong> ${stats.creditScore}</p>
    <p><strong>Stress:</strong> ${stats.stregiss}</p>
    <p><strong>Mental Health:</strong> ${stats.mental}</p>
    <p><strong>Physical Health:</strong> ${stats.physical}</p>
    <p><strong>Social Capital:</strong> ${stats.social}</p>
    <p><strong>Final Mood:</strong> ${stats.mood}</p>
    <p><strong>Job:</strong> ${player.job || "Unemployed"} @ $${player.dailyPay}/day</p>
    <p><strong>Weeks Survived:</strong> ${week}</p>
    <p><strong>College Graduate:</strong> ${player.college ? "Yes" : "No"}</p>
    <p><strong>City:</strong> ${player.city || "Unknown"}</p>
    <p><strong>Name:</strong> ${player.name || "Anonymous"}</p>
    <p><strong>Life Archetype:</strong> ${archetype}</p>
  `; // test change
}

function updateStats() {
  stats.stress = Math.max(0, Math.min(stats.stress, 100));// stress stays between 0 and 100
  stats.mental = Math.max(0, Math.min(stats.mental, 100));// mental health stays between 0 and 100
  stats.physical = Math.max(0, Math.min(stats.physical, 100)); // health stats stay between 0 and 100
  stats.social = Math.max(0, Math.min(stats.social, 100));//  credit score stays between 300 and 850
  stats.creditScore = Math.max(300, Math.min(stats.creditScore, 850)); 
  stats.money = Math.max(0, stats.money); // money can’t go negative
  if (stats.money >= 2000 && !achievements.bigWallet) {
    achievements.bigWallet = true;
    showNotification("🏆 Achievement unlocked: Big Wallet");
  }
  if (stats.money <= 0) {
    showNotification("💸 You ran out of money!");
    checkGameOver
  }{
  stats.mood = calculateMood();


if (stats.stress >= 80 && !tooltipShown.stress) {
  showTooltip("Your stress is high. The Health tab can help reduce it.");
  tooltipShown.stress = true;
}


if (stats.mental <= 30 && !tooltipShown.mental) {
  showTooltip("Your mental health is low. Meditation or rest can help.");
  tooltipShown.mental = true;
}


if (stats.money <= 100 && !tooltipShown.money) {
  showTooltip("You're low on money. Consider working overtime or taking a loan.");
  tooltipShown.money = true;
}


  $("money").textContent = `$${stats.money}`;
  $("stress").textContent = stats.stress;
  $("mental-health").textContent = stats.mental;
  $("physical-health").textContent = stats.physical;
  $("social-capital").textContent = stats.social;
  $("credit-score").textContent = stats.creditScore;
  $("week-number").textContent = week;
  $("mood-indicator").textContent = stats.mood;

  if (stats.social >= 80 && !achievements.socialButterfly) {
  achievements.socialButterfly = true;
  showNotification("🏆 Achievement unlocked: Social Butterfly");
}

  checkGameOver();
}
}
function updstats() { updateStats(); }

function checkGameOver() {
  const lost = stats.money <= 0 || stats.mental <= 0 || stats.physical <= 0 || stats.social <= 0 || stats.stress >= 100;
  if (lost) {
    $("game-ui").innerHTML = `
      <div class="game-over">
        <h2>💀 You washed out</h2>
        <p>But so did thousands of Americans this year.</p>
        <button onclick="location.reload()">🔁 Play Again?</button>
      </div>
    `;
    $("ambient-audio").pause();
  }
}
$("achievements-floating-btn").addEventListener("click", () => {
  renderAchievementsTab();
});
function showNotification(message) {
  const container = $("notification-banner");

  const note = document.createElement("div");
  note.className = "note-item";
  note.textContent = message;

  container.appendChild(note);

  setTimeout(() => {
    note.style.opacity = "0";
    setTimeout(() => note.remove(), 400);
  }, 3500);
  
}

function showTooltip(message) {
  const tip = $("tooltip-helper");
  tip.textContent = message;
  tip.style.display = "block";

  setTimeout(() => {
    tip.style.display = "none";
  }, 4000);
}




function maybeShowMonologue() {
  const thoughts = [
    { condition: stats.stress > 80, text: "Everything feels heavy lately..." },
    { condition: stats.social < 30, text: "I haven’t talked to anyone in days." },
    { condition: stats.mental < 40, text: "I’m not sure I can keep this up." },
    { condition: stats.money < 200, text: "I’m running out of cash again." },
    { condition: stats.mood === "😄 Uplifted", text: "I think I’m finally getting the hang of this." }
  ];
  const thought = thoughts.find(t => t.condition);
  if (thought) showNotification(thought.text);
}

// === CHARACTER SETUP ===
const collegeJobs = [
  { title: "Data Analyst", dailyPay: 160 },
  { title: "Marketing Associate", dailyPay: 140 },
  { title: "Junior Developer", dailyPay: 180 }
];

const nonCollegeJobs = [
  { title: "Retail Worker", dailyPay: 100 },
  { title: "Warehouse Picker", dailyPay: 110 },
  { title: "Delivery Driver", dailyPay: 120 }
];

function setCollege(went) {
  player.college = went;
  const jobList = went ? collegeJobs : nonCollegeJobs;
  const jobOptions = jobList.map(job =>
    `<button onclick="selectJob('${job.title}', ${job.dailyPay})">${job.title} ($${job.dailyPay}/day)</button>`
  ).join("");
  $("job-options").innerHTML = jobOptions;
  $("job-selection").style.display = "block";
}

function selectJob(title, pay) {
  player.job = title;
  player.dailyPay = pay;
  player.name = $("input-name").value || "Player";
  player.city = $("input-city").value || "Somewhere";
  $("character-setup").style.display = "none";
  $("game-ui").style.display = "block";
  switchTheme("rain");
  updstats();
  renderLifeTab();
}
function payDebt(amount) {
  if (stats.money >= amount) {
    stats.money -= amount;
    stats.debt -= amount;
    console.log('payDebt: new debt', stats.debt); 
    stats.creditScore += 5;
    showNotification(`Paid $${amount} toward debt.`);
  } else {
    showNotification("Not enough money to pay debt.");
  }
  renderDebtTab()
  updstats();
}

function payBills() {
  if (stats.money >= stats.totalBills) {
    stats.money -= stats.totalBills;
    stats.creditScore += 10;
    showNotification(`Paid $${stats.totalBills} in bills.`);
    stats.totalBills = 0;
  } else {
    showNotification("Not enough money to pay bills.");
  }
  updstats();
}

function invest(type) {
  if (type === "skip") return showNotification("You skipped investing.");

  const cost = type === "stocks" ? 200 : 100;
  if (stats.money < cost) return showNotification("Not enough money to invest.");

  stats.money -= cost;
  const win = Math.random() > 0.3; // 70% chance to win on stocks, 50% on crypto
  if (win) {
    const gain = type === "stocks" ? 400 : 200;
    stats.money += gain;
    showNotification(`Your ${type} investment paid off! +$${gain}`);
  } else {
    showNotification(`Your ${type} investment lost value.`);
  }
  updstats();
}

function saveMoney(amount) {
  if (stats.money >= amount) {
    stats.money -= amount;
    stats.savings += amount;
    showNotification(`Saved $${amount}.`);
  } else {
    showNotification("Not enough money to save.");
  }
  updstats();
}

function socialize(type) {
  if (type === "hangout") {
    if (stats.money >= 30) {
      stats.money -= 30;
      stats.social += 15;
      stats.mental += 5;
      showNotification("You hung out with friends.");
    } else {
      showNotification("Not enough money to hang out.");
    }
  } else if (type === "call") {
    stats.social += 10;
    stats.mental += 5;
    showNotification("You called a friend.");
  } else {
    showNotification("You stayed in.");
  }
  updstats();
}

function improveHealth(type) {
  if (type === "mental") {
    if (stats.money >= 20) {
      stats.money -= 20;
      stats.mental += 15;
      stats.stress -= 10;
      showNotification("You meditated.");
    } else {
      showNotification("Not enough money to meditate.");
    }
  } else if (type === "physical") {
    stats.physical += 15;
    stats.stress -= 5;
    showNotification("You worked out.");
  } else if (type === "rest") {
    stats.stress -= 15;
    stats.mental += 5;
    showNotification("You rested.");
  }
  updstats();
}

function careerBoost() {
  if (stats.money >= 200) {
    stats.money -= 200;
    player.dailyPay += 20;
    stats.mental += 5;
    showNotification("You completed a course. +$20/day pay.");
  } else {
    showNotification("Not enough money for a course.");
  }
  updateStats();
}
function renderGoalsTab() {
  showTab("goals-tab");

  const goals = weeklyGoals[week];

  $("goals-tab").innerHTML = `
    <h3>📅 Week ${week} Goals</h3>
    <ul>
      ${goals.map(g => `<li>${g.desc}</li>`).join("")}
    </ul>
  `;
}



function network() {
  stats.social += 10;
  stats.mental += 5;
  showNotification("You made new connections.");
  updateStats();
}
const ambientAudio = document.getElementById("ambient-audio");
const muteBtn = document.getElementById("mute-btn");
const fullscreenBtn = document.getElementById("fullscreen-btn");

muteBtn.addEventListener("click", () => {
  if (ambientAudio.muted) {
    ambientAudio.muted = false;
    muteBtn.textContent = "🔊";
  } else {
    ambientAudio.muted = true;
    muteBtn.textContent = "🔇";
  }
});


fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fullscreenBtn.textContent = "🡽"; // exit icon
  } else {
    document.exitFullscreen();
    fullscreenBtn.textContent = "⛶"; // enter icon
  }
});


fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fullscreenBtn.textContent = "🡽"; // exit icon
  } else {
    document.exitFullscreen();
    fullscreenBtn.textContent = "⛶"; // enter icon
  }
});
document.addEventListener("DOMContentLoaded", () => {
  $("life-tab-button").addEventListener("click", renderLifeTab);
  $("career-tab-button").addEventListener("click", renderCareerTab);
  $("health-tab-button").addEventListener("click", renderHealthTab);
  $("social-tab-button").addEventListener("click", renderSocialTab);
  $("save-tab-button").addEventListener("click", renderSaveTab);
  $("invest-tab-button").addEventListener("click", renderInvestTab);
  $("bills-tab-button").addEventListener("click", renderBillsTab);
  $("debt-tab-button").addEventListener("click", renderDebtTab);
  $("gamble-tab-button").addEventListener("click", renderGambleTab);
  $("summary-tab-button").addEventListener("click", renderSummaryTab);
  $("loan-tab-button").addEventListener("click", renderLoanTab);
  $("goals-tab-button").addEventListener("click", renderGoalsTab);
});

// Expose commonly-used functions to global scope for inline HTML handlers
window.setCollege = setCollege;
window.selectJob = selectJob;
window.withdrawMoney = withdrawMoney;
window.gamble = gamble;
window.applyLifeChoice = applyLifeChoice;
window.saveMoney = saveMoney;
window.socialize = socialize;
window.improveHealth = improveHealth;
window.careerBoost = careerBoost;
window.network = network;
window.invest = invest;
window.payBills = payBills;
window.payDebt = payDebt;
window.updateStats = updateStats;
window.updstats = typeof updstats === 'function' ? updstats : updateStats;
console.log('new.js globals exported — gamble:', typeof window.gamble);
// If any gamble calls happened before the script loaded, process them now.
if (window._pendingGambles && Array.isArray(window._pendingGambles) && window._pendingGambles.length) {
  console.log('processing', window._pendingGambles.length, 'queued gamble calls');
  const q = window._pendingGambles.slice();
  window._pendingGambles.length = 0;
  q.forEach(a => {
    try { gamble(a); } catch (e) { console.error('queued gamble error', e); }
  });
}