// =========================================================
//  VOICE INCH CALCULATOR – CORE
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  // --------- Seletores principais ---------
  const form = document.getElementById("inchCalcForm");
  const value1Input = document.getElementById("value1");
  const value2Input = document.getElementById("value2");
  const opSelect = document.getElementById("operation");
  const resultDecimal = document.getElementById("resultDecimal");
  const resultFraction = document.getElementById("resultFraction");
  const voiceLangSelect = document.getElementById("voiceLanguage");
  const calculateBtn = document.getElementById("calculateBtn");

  function setText(el, value) {
    if (el) el.textContent = value;
  }

  // --------- Util: converte texto tipo "5 3/8" em número ----------
  function parseInchString(str) {
    if (!str) return NaN;
    str = String(str).trim();

    // troca vírgula por ponto pra PT/ES
    str = str.replace(",", ".");

    const parts = str.split(/\s+/);
    let total = 0;

    for (const part of parts) {
      if (part.includes("/")) {
        const [num, den] = part.split("/").map(Number);
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
          total += num / den;
        }
      } else {
        const n = Number(part);
        if (!isNaN(n)) {
          total += n;
        }
      }
    }
    return total;
  }

  // --------- Util: transforma decimal em fração mista (1/16) ----------
  function toMixedFraction(x) {
    if (!isFinite(x)) return "--";
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const whole = Math.floor(x);
    const frac = x - whole;

    const den = 16;
    let num = Math.round(frac * den);

    if (num === 0) return String(sign * whole || 0);
    if (num === den) {
      return String(sign * (whole + 1));
    }

    function gcd(a, b) {
      return b === 0 ? a : gcd(b, a % b);
    }
    const g = gcd(num, den);
    num /= g;
    const sd = den / g;

    const prefix = sign * (whole || 0);
    if (whole === 0) {
      return `${sign < 0 ? "-" : ""}${num}/${sd}`;
    }
    return `${prefix} ${num}/${sd}`;
  }

  // --------- Cálculo principal ----------
  function calculateInches(e) {
    if (e) e.preventDefault();

    if (!value1Input || !value2Input || !opSelect) {
      console.warn("Algum input/select não foi encontrado pelo JS.");
      return;
    }

    const v1 = parseInchString(value1Input.value);
    const v2 = parseInchString(value2Input.value);

    if (isNaN(v1) || isNaN(v2)) {
      setText(resultDecimal, "Invalid value");
      setText(resultFraction, "--");
      return;
    }

    let out;
    switch (opSelect.value) {
      case "add":
        out = v1 + v2;
        break;
      case "sub":
        out = v1 - v2;
        break;
      case "mul":
        out = v1 * v2;
        break;
      case "div":
        out = v2 === 0 ? NaN : v1 / v2;
        break;
      default:
        out = NaN;
    }

    if (!isFinite(out)) {
      setText(resultDecimal, "Error");
      setText(resultFraction, "--");
      return;
    }

    const dec = out.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
    setText(resultDecimal, dec);
    setText(resultFraction, toMixedFraction(out));
  }

  if (form) {
    form.addEventListener("submit", calculateInches);
  }
  // Se por algum motivo o botão não estiver dentro do form,
  // ainda assim forçamos o cálculo ao clicar nele.
  if (calculateBtn) {
    calculateBtn.addEventListener("click", calculateInches);
  }

  // =========================================================
  //  VOZ – Web Speech API
  // =========================================================

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition = null;
  let activeInput = null;

  function getSelectedLangCode() {
    if (!voiceLangSelect) return "en-US";
    const v = voiceLangSelect.value;
    switch (v) {
      case "en":
        return "en-US";
      case "pt":
        return "pt-BR";
      case "es":
        return "es-ES";
      default:
        return "en-US";
    }
  }

  function initRecognition() {
    if (!SpeechRecognition) {
      console.warn("Web Speech API não disponível neste navegador.");
      document.querySelectorAll(".voice-btn").forEach((btn) => {
        btn.style.display = "none";
      });
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.addEventListener("result", (event) => {
      if (!activeInput) return;

      const transcript = event.results[0][0].transcript.trim();
      console.log("Transcript bruto:", transcript);
      activeInput.value = transcript;

      if (value1Input.value && value2Input.value) {
        calculateInches();
      }
    });

    recognition.addEventListener("error", (event) => {
      console.error("SpeechRecognition error:", event.error);
    });

    recognition.addEventListener("end", () => {
      activeInput = null;
    });
  }

  initRecognition();

  const voiceButtons = document.querySelectorAll(".voice-btn");

  voiceButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!recognition) return;

      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (!input) return;

      activeInput = input;
      recognition.lang = getSelectedLangCode();

      try {
        recognition.start();
      } catch (err) {
        console.error("Não foi possível iniciar reconhecimento:", err);
      }
    });
  });
});
