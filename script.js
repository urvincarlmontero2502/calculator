const display = document.querySelector(".display");
const buttons = document.querySelectorAll(".btn");
const paywallModal = document.querySelector(".paywall-modal");
const usesLeftSpan = document.getElementById("uses-left");
const usageBadge = document.querySelector(".usage-badge");
const planCards = document.querySelectorAll(".plan-card");
const modalExitBtn = document.getElementById("modal-exit");
const historyList = document.getElementById("history-list");
const historyLock = document.getElementById("history-lock");
const openModalBtn = document.getElementById("open-modal-btn");

let currentInput = "0";
let previousInput = "";
let operation = null;
let shouldResetScreen = false;

// SaaS tracking variables
let calcCount = 0;
const maxFreeUses = 3;
let currentPlan = null; // null = trial phase, 'free' = addition only + locked history, 'paid' = full access

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const text = button.textContent;

    if (!isNaN(text) || text === ".") {
      handleNumber(text);
    } else if (text === "C") {
      clearCalculator();
    } else if (text === "=") {
      evaluate();
    } else {
      handleOperator(text);
    }
  });
});

function handleNumber(number) {
  if (currentInput === "0" || shouldResetScreen) {
    if (number === "." && shouldResetScreen) {
      currentInput = "0.";
    } else {
      currentInput = number === "." ? "0." : number;
    }
    shouldResetScreen = false;
  } else {
    if (number === "." && currentInput.includes(".")) return;
    currentInput += number;
  }
  display.textContent = currentInput;
}

function handleOperator(op) {
  if (currentPlan === null && calcCount >= maxFreeUses) {
    paywallModal.classList.remove("hidden");
    return;
  }

  if (currentPlan === "free" && op !== "+") {
    paywallModal.classList.remove("hidden");
    alert(
      "🔒 Feature Locked: The Free Pack only supports Addition (+). Upgrade to unlock all operators!",
    );
    return;
  }

  if (operation !== null && !shouldResetScreen) {
    evaluateSilent();
  }
  previousInput = currentInput;
  operation = op;
  shouldResetScreen = true;
}

function evaluate() {
  if (currentPlan === null && calcCount >= maxFreeUses) {
    paywallModal.classList.remove("hidden");
    return;
  }

  if (operation === null || shouldResetScreen) return;

  if (currentPlan === "free" && operation !== "+") {
    paywallModal.classList.remove("hidden");
    alert("🔒 Feature Locked: The Free Pack only supports Addition (+).");
    return;
  }

  let result;
  const prev = parseFloat(previousInput);
  const curr = parseFloat(currentInput);

  if (isNaN(prev) || isNaN(curr)) return;

  let opSymbol = operation;
  switch (operation) {
    case "+":
      result = prev + curr;
      break;
    case "−":
    case "-":
      result = prev - curr;
      opSymbol = "−";
      break;
    case "×":
    case "*":
      result = prev * curr;
      opSymbol = "×";
      break;
    case "÷":
    case "/":
      if (curr === 0) {
        alert("Cannot divide by zero!");
        clearCalculator();
        return;
      }
      result = prev / curr;
      opSymbol = "÷";
      break;
    default:
      return;
  }

  const calculationString = `${prev} ${opSymbol} ${curr} = ${parseFloat(result.toFixed(8))}`;

  currentInput = parseFloat(result.toFixed(8)).toString();
  display.textContent = currentInput;

  // Add to history list UI
  addToHistory(calculationString);

  operation = null;
  shouldResetScreen = true;

  if (currentPlan === null) {
    calcCount++;
    const remaining = Math.max(0, maxFreeUses - calcCount);
    usesLeftSpan.textContent = remaining;
  }
}

function evaluateSilent() {
  let result;
  const prev = parseFloat(previousInput);
  const curr = parseFloat(currentInput);

  if (isNaN(prev) || isNaN(curr)) return;

  switch (operation) {
    case "+":
      result = prev + curr;
      break;
    case "−":
    case "-":
      result = prev - curr;
      break;
    case "×":
    case "*":
      result = prev * curr;
      break;
    case "÷":
    case "/":
      if (curr === 0) return;
      result = prev / curr;
      break;
    default:
      return;
  }
  currentInput = parseFloat(result.toFixed(8)).toString();
  display.textContent = currentInput;
}

function addToHistory(itemText) {
  const noHistoryMsg = historyList.querySelector(".no-history");
  if (noHistoryMsg) {
    noHistoryMsg.remove();
  }

  const historyItem = document.createElement("div");
  historyItem.className = "history-item";
  historyItem.textContent = itemText;
  historyList.prepend(historyItem);
}

function clearCalculator() {
  currentInput = "0";
  previousInput = "";
  operation = null;
  shouldResetScreen = false;
  display.textContent = currentInput;
}

// Plan selection event listener
planCards.forEach((card) => {
  card.addEventListener("click", () => {
    const planType = card.getAttribute("data-plan");
    const packName = card.querySelector(".pack-name").textContent;

    if (planType === "free") {
      currentPlan = "free";
      usageBadge.innerHTML = `Plan: <span style="color:#f59e0b;">Free Pack (Addition Only)</span>`;
      historyLock.classList.remove("hidden"); // Blur and show subscribe button on history
      alert(
        "Free Pack activated! Addition (+) is enabled, but other operators and history are locked.",
      );
    } else {
      currentPlan = "paid";
      usageBadge.innerHTML = `Plan: <span style="color:#38ef7d;">${packName} (Unlimited)</span>`;
      historyLock.classList.add("hidden"); // Unblur history box
      alert(
        `Success! You have selected the ${packName}. Full history and calculator access unlocked.`,
      );
    }

    paywallModal.classList.add("hidden");
  });
});

// Exit button logic: Automatically sets the plan to 'free' and closes modal
modalExitBtn.addEventListener("click", () => {
  currentPlan = "free";
  usageBadge.innerHTML = `Plan: <span style="color:#f59e0b;">Free Pack (Addition Only)</span>`;
  historyLock.classList.remove("hidden"); // Blur history box
  paywallModal.classList.add("hidden");
  alert("Free Pack selected by default. History is locked.");
});

// Clicking "Subscribe" from inside the blurred history box opens the modal
openModalBtn.addEventListener("click", () => {
  paywallModal.classList.remove("hidden");
});
