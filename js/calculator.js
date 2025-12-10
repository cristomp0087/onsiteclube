// ---- CALCULADORA ----
const inchAInput  = document.getElementById("inchAInput");
const inchBInput  = document.getElementById("inchBInput");
const buttons     = document.querySelectorAll(".inch-ops button[data-op]");
const errorMsg    = document.getElementById("inchErrorMsg");
const resDecimal  = document.getElementById("inchResDecimal");
const resFraction = document.getElementById("inchResFraction");

function parseInches(str) {
  if (!str) return NaN;
  str = str.replace(/"/g, "").trim();
  if (!str) return NaN;

  const parts = str.split(/\s+/);
  let total = 0;

  if (parts.length === 1) {
    total = parseFractionOrNumber(parts[0]);
  } else if (parts.length === 2) {
    const whole = parseFloat(parts[0]);
    const frac  = parseFractionOrNumber(parts[1]);
    if (isNaN(whole) || isNaN(frac)) return NaN;
    total = whole + frac;
  } else {
    return NaN;
  }
  return total;
}

function parseFractionOrNumber(token) {
  if (token.includes("/")) {
    const [num, den] = token.split("/");
    const n = parseFloat(num);
    const d = parseFloat(den);
    if (!isFinite(n) || !isFinite(d) || d === 0) return NaN;
    return n / d;
  } else {
    const v = parseFloat(token);
    return isFinite(v) ? v : NaN;
  }
}

function formatInchesFraction(value) {
  if (!isFinite(value)) return "–";

  const sign = value < 0 ? "-" : "";
  value = Math.abs(value);

  const whole = Math.floor(value);
  const frac  = value - whole;

  const denom = 16;
  let num = Math.round(frac * denom);

  let w = whole;
  if (num === denom) {
    w += 1;
    num = 0;
  }

  function gcd(a, b) {
    while (b !== 0) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  if (num === 0) {
    return sign + w + '"';
  } else {
    const g = gcd(num, denom);
    const simpleNum = num / g;
    const simpleDen = denom / g;

    if (w === 0) {
      return sign + simpleNum + "/" + simpleDen + '"';
    } else {
      return sign + w + " " + simpleNum + "/" + simpleDen + '"';
    }
  }
}

function calculate(op) {
  errorMsg.textContent = "";

  const a = parseInches(inchAInput.value);
  const b = parseInches(inchBInput.value);

  if (isNaN(a) || isNaN(b)) {
    errorMsg.textContent = "Verifique os valores. Use por ex.: 3 1/4, 1/2 ou 3.75";
    resDecimal.textContent  = "–";
    resFraction.textContent = "–";
    return;
  }

  let result;
  switch (op) {
    case "+": result = a + b; break;
    case "-": result = a - b; break;
    case "*": result = a * b; break;
    case "/":
      if (b === 0) {
        errorMsg.textContent = "Não é possível dividir por zero.";
        resDecimal.textContent  = "–";
        resFraction.textContent = "–";
        return;
      }
      result = a / b;
      break;
    default:
      return;
  }

  resDecimal.textContent  = result.toFixed(4) + '"';
  resFraction.textContent = formatInchesFraction(result);
}

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const op = btn.getAttribute("data-op");
    calculate(op);
  });
});
