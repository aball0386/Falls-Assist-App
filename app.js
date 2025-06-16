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

function createLabel(text, element, description = "") {
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

function toggleSection(id) {
  document.querySelectorAll("section").forEach(s => {
    if (s.id === id) s.classList.toggle("hidden");
    else s.classList.add("hidden");
  });
}

function resetForm() {
  document.querySelectorAll("input, select").forEach(el => {
    if (el.type === "checkbox" || el.type === "radio") el.checked = false;
    else el.value = "";
  });
  document.getElementById("summary-content").innerHTML = "";
}

// === Theme & Settings ===
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("theme-selector").addEventListener("change", e => {
    document.body.className = e.target.value;
  });

  document.getElementById("font-selector").addEventListener("change", e => {
    document.body.style.fontFamily = {
      standard: "Arial, sans-serif",
      bionic: "'Atkinson Hyperlegible', Arial",
      sans: "Helvetica, sans-serif",
      mono: "Courier New, monospace"
    }[e.target.value];
  });

  document.getElementById("dark-mode-toggle").addEventListener("change", e => {
    document.body.classList.toggle("dark", e.target.checked);
  });

  document.getElementById("reset-permissions").addEventListener("click", () => {
    resetForm();
    alert("All data and permissions cleared.");
  });

  buildAllSections(); // main init
});

// === ISTUMBLE Setup ===
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
    const wrapper = document.createElement("div");
    const select = createSelect(q.id, [
      { value: "Yes", text: "Yes" },
      { value: "No", text: "No" },
      { value: "Unknown", text: "Unknown" }
    ]);
    const comment = document.createElement("input");
    comment.type = "text";
    comment.placeholder = `Details for ${q.text}`;
    comment.id = `${q.id}-comment`;
    comment.classList.add("hidden");
    select.addEventListener("change", () => {
      comment.classList.toggle("hidden", select.value === "No" || select.value === "");
    });
    wrapper.appendChild(createLabel(q.text, select, q.desc));
    wrapper.appendChild(comment);
    container.appendChild(wrapper);
  });
}

function evaluateIstumble() {
  let redFlag = false;
  istumbleQuestions.forEach(q => {
    const val = document.getElementById(q.id).value;
    if (val === "Yes") redFlag = true;
  });
  const result = document.getElementById("istumble-result");
  result.textContent = redFlag
    ? "⚠️ Lift Not Authorised – Red Flag Detected: Escalate via Response Desk"
    : "✅ Lift Authorised – No Red Flags";
  result.className = redFlag ? "risk-result high-risk" : "risk-result low-risk";
}

// === FAST Test ===
function buildFAST() {
  ["fast-face", "fast-arm", "fast-speech"].forEach(id => {
    document.getElementById(id).addEventListener("change", evaluateFAST);
  });
}

function evaluateFAST() {
  const face = document.getElementById("fast-face").value;
  const arm = document.getElementById("fast-arm").value;
  const speech = document.getElementById("fast-speech").value;
  const alertBox = document.getElementById("fast-alert");

  if (face === "Yes" || arm === "Yes" || speech === "Yes") {
    alertBox.textContent = "⚠️ Suspected Stroke. Initiate Stroke Pathway and Update on NMA Message";
    alertBox.className = "risk-result high-risk";
  } else {
    alertBox.textContent = "";
    alertBox.className = "";
  }
}

// === OBS / NEWS2 (placeholder function - full scoring logic to be inserted)
function buildOBS() {
  const obsFields = [
    { id: "resp", label: "Respiratory Rate" },
    { id: "spo2", label: "Oxygen Saturation" },
    { id: "temp", label: "Temperature" },
    { id: "bp", label: "Blood Pressure" },
    { id: "hr", label: "Heart Rate" },
    { id: "bm", label: "BM (Blood Glucose)" },
    { id: "conscious", label: "Consciousness (AVPU)" }
  ];
  const container = document.getElementById("obs-inputs");
  obsFields.forEach(f => {
    const input = document.createElement("input");
    input.id = f.id;
    input.placeholder = f.label;
    input.addEventListener("change", () => colourCodeInput(input));
    container.appendChild(createLabel(f.label, input));
  });
}

function colourCodeInput(input) {
  const val = parseFloat(input.value);
  if (isNaN(val)) return input.style.backgroundColor = "";

  // Dummy ranges
  if (val < 3 || val > 15) input.style.backgroundColor = "#ffcccc";
  else if (val >= 11) input.style.backgroundColor = "#ffeeba";
  else input.style.backgroundColor = "#d4edda";
}

const fratQuestions = [
  { id: "recent-fall", text: "Previous falls in last 12 months", values: ["None", "1 fall", "2 or more"], scores: [0, 5, 10] },
  { id: "function-change", text: "Change in functioning in last 3 months?", values: ["No", "Yes", "Unknown"], scores: [0, 5, 5], comment: true },
  { id: "meds", text: "Takes 4 or more meds?", values: ["Yes", "No"], scores: [5, 0] },
  { id: "cognitive", text: "Cognitive impairment?", values: ["Yes", "No", "Unknown"], scores: [5, 0, 5] }
];

function buildFRAT() {
  const container = document.getElementById("frat-content");
  fratQuestions.forEach(q => {
    const select = createSelect(q.id, q.values.map((v, i) => ({ value: v, text: v })));
    const label = createLabel(q.text, select);
    container.appendChild(label);

    if (q.comment) {
      const commentBox = document.createElement("input");
      commentBox.type = "text";
      commentBox.placeholder = `Comment for ${q.text}`;
      commentBox.id = `${q.id}-comment`;
      commentBox.classList.add("hidden");
      container.appendChild(commentBox);
      select.addEventListener("change", () => {
        const show = select.value === "Yes" || select.value === "Unknown";
        commentBox.classList.toggle("hidden", !show);
      });
    }

    if (q.id === "recent-fall") {
      const dateInput = document.createElement("input");
      dateInput.type = "date";
      dateInput.id = `${q.id}-date`;
      container.appendChild(dateInput);
    }

    select.addEventListener("change", calculateFRAT);
  });
}

function calculateFRAT() {
  let score = 0;
  fratQuestions.forEach(q => {
    const val = document.getElementById(q.id).value;
    const index = q.values.indexOf(val);
    if (index >= 0) score += q.scores[index];
  });

  const result = document.getElementById("frat-result");
  let level = "Low";
  let cls = "low-risk";
  if (score >= 16) [level, cls] = ["High", "high-risk"];
  else if (score >= 12) [level, cls] = ["Medium", "medium-risk"];

  result.textContent = `FRAT Score: ${score} – ${level} Risk`;
  result.className = `risk-result ${cls}`;
}

// === Summary / PDF Export ===
document.getElementById("summaryBtn").addEventListener("click", () => {
  const content = document.getElementById("summary-content");
  content.innerHTML = `
    <strong>Call Sign:</strong> ${document.getElementById("cfr-sign").value}<br/>
    <strong>ESR:</strong> ${document.getElementById("esr-number").value}<br/>
    <strong>INC:</strong> ${document.getElementById("incident-number").value}<br/>
    <strong>Date:</strong> ${document.getElementById("assessment-date").value}<br/>
    <strong>Time:</strong> ${document.getElementById("assessment-time").value}<br/>
    <strong>Sex:</strong> ${document.getElementById("patient-sex").value}<br/>
    <strong>Age:</strong> ${document.getElementById("patient-age").value}<br/>
    <strong>NEWS2:</strong> ${document.getElementById("news2-score").textContent}<br/>
    <strong>FRAT:</strong> ${document.getElementById("frat-result").textContent}<br/>
    <strong>FAST:</strong> ${document.getElementById("fast-alert").textContent}<br/>
  `;

  const win = window.open('', '_blank');
  win.document.write('<html><head><title>PDF Export</title></head><body>');
  win.document.write(content.innerHTML);
  win.document.write('</body></html>');
  win.print();

  const mailLink = `mailto:?subject=Falls Assessment Report&body=Attached is the patient's falls assessment summary.`;
  window.location.href = mailLink;
});

// === Blood Thinners ===
const bloodThinners = [
  "Warfarin", "Apixaban (Eliquis)", "Rivaroxaban (Xarelto)", "Dabigatran (Pradaxa)", "Edoxaban (Lixiana)",
  "Aspirin", "Clopidogrel (Plavix)", "Ticagrelor (Brilique)", "Prasugrel", "Dipyridamole", "Heparin", "LMWH"
];

function buildMedList() {
  const list = document.getElementById("blood-thinners-list");
  bloodThinners.forEach(med => {
    const li = document.createElement("li");
    li.textContent = med;
    list.appendChild(li);
  });
}

// === Help Tooltips ===
function showHelp(section) {
  const help = {
    istumble: "Use ISTUMBLE to check for lift safety. Yes = red flag. Comment if Yes or Unknown.",
    fast: "FAST helps detect stroke. Positive = immediate pathway initiation.",
    obs: "Record vital signs for NEWS2 calculation. Colour coded by severity.",
    frat: "FRAT = Falls Risk Assessment Tool. Higher scores mean higher fall risk."
  };
  document.getElementById("help-content").textContent = help[section];
  document.getElementById("help-box").classList.remove("hidden");
}
function closeHelp() {
  document.getElementById("help-box").classList.add("hidden");
}

// === Full Init ===
function buildAllSections() {
  buildIstumble();
  buildFAST();
  buildOBS();
  buildFRAT();
  buildMedList();
}

