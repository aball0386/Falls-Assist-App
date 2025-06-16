// === Utility Functions ===
function createOption(value, text, selected = false) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  if (selected) option.selected = true;
  return option;
}

function createSelect(id, options, defaultText = "Please Select") {
  const select = document.createElement("select");
  select.id = id;
  select.appendChild(createOption("", defaultText, true));
  options.forEach(opt => select.appendChild(createOption(opt.value, opt.text)));
  return select;
}

function createLabel(text, element, description) {
  const label = document.createElement("label");
  label.textContent = text;
  label.appendChild(document.createElement("br"));
  label.appendChild(element);
  if (description) {
    const small = document.createElement("small");
    small.textContent = description;
    label.appendChild(document.createElement("br"));
    label.appendChild(small);
  }
  return label;
}

// === Settings Panel Functions ===
function applyTheme(theme) {
  document.body.classList.remove("theme-green", "theme-red");
  document.body.classList.add(`theme-${theme}`);
  localStorage.setItem("theme", theme);
}

function applyDarkMode(enabled) {
  document.body.classList.toggle("dark-mode", enabled);
  localStorage.setItem("darkMode", enabled ? "true" : "false");
}

function applyFont(font) {
  document.body.dataset.font = font;
  localStorage.setItem("font", font);
}

function applySettingsFromStorage() {
  const theme = localStorage.getItem("theme") || "green";
  const darkMode = localStorage.getItem("darkMode") === "true";
  const font = localStorage.getItem("font") || "default";

  applyTheme(theme);
  applyDarkMode(darkMode);
  applyFont(font);

  document.getElementById("theme-toggle").value = theme;
  document.getElementById("dark-mode").checked = darkMode;
  document.getElementById("font-select").value = font;
}

const istumbleQuestions = [
  { id: "pain", text: "Intense Pain?", desc: "e.g. verbal or visible pain on movement" },
  { id: "spine", text: "Spine Pain or Tenderness?", desc: "e.g. tenderness to neck/back or visible injury" },
  { id: "tingling", text: "Tingling or Numbness?", desc: "e.g. altered sensation in arms or legs" },
  { id: "unconscious", text: "Unconscious or Altered Mental State?", desc: "e.g. GCS < 15 or confused" },
  { id: "mobility", text: "Mobility Issues?", desc: "e.g. cannot walk or stand unaided" },
  { id: "bleed", text: "Bleeding or Clot Risk?", desc: "e.g. head injury + anticoagulants" },
  { id: "unwell", text: "Looked Unwell or Deteriorating?", desc: "e.g. pale, clammy, worsening symptoms" },
  { id: "trauma", text: "Evidence of Trauma?", desc: "e.g. bruising, wounds, deformity" }
];

function buildIstumble() {
  const container = document.getElementById("istumble-content");
  istumbleQuestions.forEach(q => {
    const select = createSelect(q.id, [
      { value: "Yes", text: "Yes" },
      { value: "No", text: "No" },
      { value: "Unknown", text: "Unknown" }
    ]);
    container.appendChild(createLabel(q.text, select, q.desc));
  });
}

function evaluateIstumble() {
  let redFlag = false;
  istumbleQuestions.forEach(q => {
    const val = document.getElementById(q.id).value;
    if (val === "Yes") redFlag = true;
  });
  const resultDiv = document.getElementById("istumble-result");
  if (redFlag) {
    resultDiv.textContent = "⚠️ Lift Not Authorised - Red Flag Detected: Escalate via Response Desk";
    resultDiv.className = "risk-result high-risk";
  } else {
    resultDiv.textContent = "✅ Lift Authorised - No Red Flags Detected";
    resultDiv.className = "risk-result low-risk";
  }
}

const fratQuestions = [
  {
    id: "falls",
    text: "Previous falls in the last 12 months?",
    desc: "e.g. confirmed by patient or carer",
    options: [
      { value: "0", text: "None" },
      { value: "2", text: "One fall" },
      { value: "4", text: "Two or more falls" }
    ]
  },
  {
    id: "meds",
    text: "Number of medications taken daily?",
    desc: "0-3 = 0, 4-6 = 1, 7+ = 2",
    options: [
      { value: "0", text: "0–3" },
      { value: "1", text: "4–6" },
      { value: "2", text: "7+" }
    ]
  },
  {
    id: "psych",
    text: "Psychological status (e.g. agitation, anxiety)",
    desc: "None = 0, Mild = 1, Severe = 2",
    options: [
      { value: "0", text: "None" },
      { value: "1", text: "Mild" },
      { value: "2", text: "Severe" }
    ]
  },
  {
    id: "cog",
    text: "Cognitive function (AMTS)",
    desc: "AMTS 9–10 = 0, 5–8 = 2, ≤4 = 4",
    options: [
      { value: "0", text: "9–10" },
      { value: "2", text: "5–8" },
      { value: "4", text: "≤4" }
    ]
  },
  {
    id: "function",
    text: "Change in function in last 3 months?",
    desc: "Any decline in mobility or self-care",
    options: [
      { value: "0", text: "No" },
      { value: "2", text: "Yes" }
    ]
  },
  {
    id: "postural",
    text: "Postural hypotension symptoms?",
    desc: "Dizziness, light-headedness, etc.",
    options: [
      { value: "0", text: "No" },
      { value: "2", text: "Yes" }
    ]
  }
];

function buildFrat() {
  const container = document.getElementById("frat-content");
  fratQuestions.forEach(q => {
    const select = createSelect(q.id, q.options);
    const label = createLabel(q.text, select, q.desc);
    if (q.id === "cog") {
      const infoBtn = document.createElement("button");
      infoBtn.type = "button";
      infoBtn.textContent = "ℹ️ AMTS";
      infoBtn.onclick = () => document.getElementById("amts-modal").style.display = "block";
      label.appendChild(infoBtn);
    }
    container.appendChild(label);
  });
}

function calculateFrat() {
  let score = 0;
  fratQuestions.forEach(q => {
    const val = document.getElementById(q.id).value;
    if (val) score += parseInt(val, 10);
  });

  let risk = "Minimal Risk";
  if (score >= 16) risk = "High Risk";
  else if (score >= 12) risk = "Medium Risk";
  else if (score >= 5) risk = "Low Risk";

  const resultDiv = document.getElementById("frat-result");
  resultDiv.innerHTML = `<strong>FRAT Score: ${score} / 20 (${risk})</strong>`;
  resultDiv.className = risk === "High Risk"
    ? "risk-result high-risk"
    : risk === "Medium Risk"
    ? "risk-result medium-risk"
    : "risk-result low-risk";
}

const fratChecklist = [
  "Vision",
  "Mobility",
  "Transfers",
  "Behaviours",
  "Instructions / Compliance",
  "ADLs (Risk-taking)",
  "Equipment Use",
  "Environment",
  "Nutrition",
  "Continence"
];

function buildFratChecklist() {
  const container = document.getElementById("frat-checklist");
  fratChecklist.forEach((item, index) => {
    const select = createSelect(`frat-check-${index}`, [
      { value: "Yes", text: "Yes" },
      { value: "No", text: "No" },
      { value: "Unknown", text: "Unknown" }
    ]);
    container.appendChild(createLabel(item, select));
  });
}

document.getElementById("toggle-frat-part2").addEventListener("click", () => {
  const panel = document.getElementById("frat-part2");
  panel.style.display = panel.style.display === "none" ? "block" : "none";
});

const obsFields = [
  { id: "rr", text: "Respiratory Rate (breaths/min)", min: 8, max: 30 },
  { id: "spo2", text: "Oxygen Saturation (%)", min: 75, max: 100 },
  { id: "o2supp", text: "Oxygen Supplementation?", options: ["No", "Yes"] },
  { id: "temp", text: "Temperature (°C)", min: 32.0, max: 42.0 },
  { id: "sbp", text: "Blood Pressure (Systolic mmHg)", min: 65, max: 250 },
  { id: "hr", text: "Heart Rate (bpm)", min: 30, max: 200 },
  { id: "avpu", text: "Level of Consciousness (AVPU)", options: ["Alert", "Voice", "Pain", "Unresponsive"] },
  { id: "bm", text: "BM (Blood Glucose) mmol/L", min: 1.0, max: 40.0 }
];

function buildObs() {
  const container = document.getElementById("obs-content");
  obsFields.forEach(f => {
    let input;
    if (f.options) {
      input = createSelect(f.id, f.options.map(opt => ({ value: opt, text: opt })));
    } else {
      input = document.createElement("input");
      input.type = "number";
      input.id = f.id;
      input.min = f.min;
      input.max = f.max;
      input.placeholder = f.text;
    }
    container.appendChild(createLabel(f.text, input));
  });

  // Post-lift SBP already present in index.html
}

function scoreNews2() {
  const rr = +document.getElementById("rr").value;
  const spo2 = +document.getElementById("spo2").value;
  const o2supp = document.getElementById("o2supp").value;
  const temp = +document.getElementById("temp").value;
  const sbp = +document.getElementById("sbp").value;
  const hr = +document.getElementById("hr").value;
  const avpu = document.getElementById("avpu").value;
  const bm = +document.getElementById("bm").value;

  function score(field, scoreRanges) {
    for (const [range, score] of scoreRanges) {
      if (range(rr, spo2, temp, sbp, hr, bm)) return score;
    }
    return 0;
  }

  const total = (
    (rr <= 8 || rr >= 25 ? 3 : rr <= 11 || rr >= 21 ? 1 : 0) +
    (spo2 <= 91 ? 3 : spo2 <= 93 ? 2 : spo2 <= 95 ? 1 : 0) +
    (temp <= 35 ? 3 : temp >= 39.1 ? 2 : temp >= 38.1 ? 1 : 0) +
    (sbp <= 90 ? 3 : sbp <= 100 ? 2 : sbp <= 110 ? 1 : 0) +
    (hr <= 40 ? 3 : hr <= 50 || hr >= 131 ? 1 : hr >= 111 ? 2 : hr >= 91 ? 1 : 0) +
    (avpu === "Alert" ? 0 : 3)
  );

  let risk = "Low Risk";
  let band = "low-risk";
  if (total >= 7) { risk = "High Risk"; band = "high-risk"; }
  else if (total >= 5) { risk = "Medium Risk"; band = "medium-risk"; }

  const result = document.getElementById("news2-result");
  result.textContent = `NEWS2 Score: ${total} (${risk})`;
  result.className = `risk-result ${band}`;

  // BM Alerts
  const bmInput = document.getElementById("bm");
  if (!isNaN(bm)) {
    bmInput.classList.remove("high-risk", "low-risk", "medium-risk");
    if (bm < 4.0) bmInput.classList.add("high-risk");
    else if (bm > 11.0) bmInput.classList.add("medium-risk");
    else bmInput.classList.add("low-risk");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applySettingsFromStorage();
  buildIstumble();
  buildFrat();
  buildFratChecklist();
  buildObs();

  document.getElementById("istumble-evaluate").addEventListener("click", evaluateIstumble);
  document.getElementById("frat-calculate").addEventListener("click", calculateFrat);
  document.getElementById("close-amts").addEventListener("click", () => {
    document.getElementById("amts-modal").style.display = "none";
  });

  // Live scoring
  ["rr", "spo2", "o2supp", "temp", "sbp", "hr", "avpu", "bm"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", scoreNews2);
      el.addEventListener("change", scoreNews2);
    }
  });

  // Toggle settings
  document.getElementById("menu-toggle").addEventListener("click", () => {
    const panel = document.getElementById("settingsPanel");
    panel.style.display = panel.style.display === "block" ? "none" : "block";
  });

  document.getElementById("theme-toggle").addEventListener("change", e => applyTheme(e.target.value));
  document.getElementById("dark-mode").addEventListener("change", e => applyDarkMode(e.target.checked));
  document.getElementById("font-select").addEventListener("change", e => applyFont(e.target.value));
  document.getElementById("reset-app").addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  // Meds Modal
  document.getElementById("meds-toggle").addEventListener("click", () => {
    document.getElementById("meds-modal").style.display = "block";
  });
  document.getElementById("close-meds").addEventListener("click", () => {
    document.getElementById("meds-modal").style.display = "none";
  });

  // PDF Summary
  document.getElementById("generate-summary").addEventListener("click", () => {
    const summaryWindow = window.open("", "_blank");
    const fields = [
      ["Call Sign", "callsign"],
      ["ESR", "esr"],
      ["Date", "date"],
      ["Time", "time"],
      ["INC#", "inc"],
      ["Patient Age", "age"],
      ["Sex", "sex"]
    ];
    let html = `<h2>SECamb Falls Assessment Summary</h2><table>`;
    fields.forEach(([label, id]) => {
      const val = document.getElementById(id).value || "Not Provided";
      html += `<tr><td><strong>${label}:</strong></td><td>${val}</td></tr>`;
    });

    html += `</table><hr><h3>ISTUMBLE</h3><ul>`;
    istumbleQuestions.forEach(q => {
      const val = document.getElementById(q.id).value || "Not answered";
      html += `<li>${q.text}: ${val}</li>`;
    });

    html += `</ul><h3>FRAT</h3><ul>`;
    fratQuestions.forEach(q => {
      const val = document.getElementById(q.id).value || "Not answered";
      html += `<li>${q.text}: ${val}</li>`;
    });

    html += `<h3>Part 2 Risk Factors</h3><ul>`;
    fratChecklist.forEach((item, index) => {
      const val = document.getElementById(`frat-check-${index}`).value || "Not answered";
      html += `<li>${item}: ${val}</li>`;
    });

    html += `</ul><h3>OBS</h3><ul>`;
    obsFields.forEach(f => {
      const val = document.getElementById(f.id).value || "Not entered";
      html += `<li>${f.text}: ${val}</li>`;
    });

    html += `</ul><h3>Post-Lift SBP</h3><ul>`;
    html += `<li>SBP: ${document.getElementById("postlift-sbp").value || "Not entered"}</li>`;
    html += `<li>Time Taken: ${document.getElementById("postlift-time").value || "Not entered"}</li>`;
    html += `</ul><h3>NEWS2</h3>`;
    html += `<p>${document.getElementById("news2-result").textContent || "Not calculated"}</p>`;

    html += `<footer><p>Generated ${new Date().toLocaleString()}</p></footer>`;
    summaryWindow.document.write(`<html><head><title>Summary</title></head><body>${html}</body></html>`);
    summaryWindow.document.close();
    summaryWindow.print();
  });
});
