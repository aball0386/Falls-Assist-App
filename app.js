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

function getVal(id) {
  return document.getElementById(id)?.value || "";
}

function setInputColorByValue(input, value, thresholds) {
  input.classList.remove("red", "orange", "green");
  if (value === "") return;

  let v = parseFloat(value);
  if (isNaN(v)) return;

  if (thresholds.red(v)) input.classList.add("red");
  else if (thresholds.orange(v)) input.classList.add("orange");
  else input.classList.add("green");
}

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
    const select = createSelect(q.id, [
      { value: "Yes", text: "Yes" },
      { value: "No", text: "No" },
      { value: "Unknown", text: "Unknown" }
    ]);
    select.addEventListener("change", () => handleIstumbleInput(q.id, select.value));
    container.appendChild(createLabel(q.text, select, q.desc));

    const detailBox = document.createElement("input");
    detailBox.id = `${q.id}-details`;
    detailBox.placeholder = "Add detail...";
    detailBox.classList.add("hidden");
    container.appendChild(detailBox);
  });
}

function handleIstumbleInput(id, value) {
  const detailInput = document.getElementById(`${id}-details`);
  if (value === "Yes" || value === "Unknown") {
    detailInput.classList.remove("hidden");
  } else {
    detailInput.classList.add("hidden");
    detailInput.value = "";
  }
}

function evaluateIstumble() {
  const resultDiv = document.getElementById("istumble-result");
  const trauma = getVal("trauma");
  const bleed = getVal("bleed");
  const thinners = getSelectedThinners();

  const traumaAlert = (trauma === "Yes" || trauma === "Unknown");
  const bleedAlert = (bleed === "Yes" || bleed === "Unknown");
  const hasThinners = thinners.length > 0;

  if (hasThinners && traumaAlert) {
    resultDiv.textContent = "⚠️ Anticoagulant Use with Suspected or Unknown Trauma – Lift Not Authorised. Escalate via PP Hub and follow in-scope trauma pathway.";
    resultDiv.className = "risk-result high-risk";
    return;
  }

  if (hasThinners || bleedAlert) {
    resultDiv.textContent = "⚠️ Anticoagulant Use Detected – Seek Advice from PP Hub. Escalate via Response Desk per ISTUMBLE policy.";
    resultDiv.className = "risk-result medium-risk";
    return;
  }

  const redFlag = istumbleQuestions.some(q => getVal(q.id) === "Yes");
  if (redFlag) {
    resultDiv.textContent = "⚠️ Lift Not Authorised – Red Flag Detected. Escalate via Response Desk.";
    resultDiv.className = "risk-result high-risk";
  } else {
    resultDiv.textContent = "✅ Lift Authorised – No Red Flags Detected";
    resultDiv.className = "risk-result low-risk";
  }
}

function getSelectedThinners() {
  const select = document.getElementById("blood-thinners");
  return Array.from(select.selectedOptions).map(o => o.value).filter(v => v);
}

function buildFastTest() {
  const container = document.getElementById("fast-test");
  const fastItems = [
    { id: "fast-face", text: "Face Droop" },
    { id: "fast-arm", text: "Arm Weakness" },
    { id: "fast-speech", text: "Speech Issues" }
  ];

  fastItems.forEach(item => {
    const select = createSelect(item.id, [
      { value: "Yes", text: "Yes" },
      { value: "No", text: "No" },
      { value: "Unknown", text: "Unknown" }
    ]);
    container.appendChild(createLabel(item.text, select));
  });

  const alertBox = document.createElement("div");
  alertBox.id = "fast-result";
  container.appendChild(alertBox);
}

function evaluateFast() {
  const f = getVal("fast-face");
  const a = getVal("fast-arm");
  const s = getVal("fast-speech");

  const fastAlert = [f, a, s].includes("Yes");
  const result = document.getElementById("fast-result");
  if (fastAlert) {
    result.textContent = "⚠️ Suspected Stroke. Initiate Stroke Pathway and Update on NMA Message.";
    result.className = "risk-result high-risk";
  } else {
    result.textContent = "✅ No FAST indicators present.";
    result.className = "risk-result low-risk";
  }
}

function buildObsSection() {
  const obsItems = [
    { id: "resp-rate", label: "Respiratory Rate", thresholds: { red: v => v < 8 || v > 25, orange: v => v >= 21 && v <= 24 } },
    { id: "spo2", label: "SpO2", thresholds: { red: v => v < 90, orange: v => v < 94 } },
    { id: "heart-rate", label: "Heart Rate", thresholds: { red: v => v < 40 || v > 130, orange: v => v >= 111 && v <= 129 } },
    { id: "temp", label: "Temperature", thresholds: { red: v => v < 35.0 || v >= 39.1, orange: v => v >= 38 } },
    { id: "bp", label: "Blood Pressure", thresholds: { red: v => v < 90 || v > 219, orange: v => v >= 200 } },
    { id: "bm", label: "BM (Glucose)", thresholds: { red: v => v < 3.0 || v > 20.0, orange: v => v < 4.0 || v > 15.0 } },
    { id: "avpu", label: "Consciousness (AVPU)", thresholds: { red: v => v !== "Alert", orange: () => false } }
  ];

  const container = document.getElementById("obs-section");

  obsItems.forEach(item => {
    const input = item.id === "avpu" ? createSelect(item.id, [
      { value: "Alert", text: "Alert" },
      { value: "Voice", text: "Voice" },
      { value: "Pain", text: "Pain" },
      { value: "Unresponsive", text: "Unresponsive" }
    ]) : document.createElement("input");

    input.id = item.id;
    input.type = item.id === "temp" ? "number" : "text";
    input.addEventListener("input", () => {
      const value = input.value;
      setInputColorByValue(input, value, item.thresholds);
    });

    container.appendChild(createLabel(item.label, input));
  });

  const overrideToggle = createSelect("bm-range-toggle", [
    { value: "Yes", text: "Yes" },
    { value: "No", text: "No" }
  ]);
  container.appendChild(createLabel("Use Patient’s Normal Ranges for BM?", overrideToggle));
}

function buildSummaryCard() {
  const card = document.getElementById("card-view");
  card.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Patient Identifier Summary";
  card.appendChild(title);

  const summaryItems = [
    { label: "CFR Call Sign", value: getVal("cfr-id") },
    { label: "ESR", value: getVal("esr-number") },
    { label: "Date", value: getVal("incident-date") },
    { label: "Time", value: getVal("incident-time") },
    { label: "INC Number", value: getVal("inc-number") },
    { label: "Sex", value: getVal("patient-sex") },
    { label: "Age", value: getVal("patient-age") },
    { label: "BM", value: getVal("bm") },
    { label: "BP", value: getVal("bp") },
    { label: "Heart Rate", value: getVal("heart-rate") },
    { label: "SpO2", value: getVal("spo2") },
    { label: "Respiratory Rate", value: getVal("resp-rate") },
    { label: "Temp", value: getVal("temp") },
    { label: "AVPU", value: getVal("avpu") },
    { label: "Blood Thinners", value: getSelectedThinners().join(", ") },
  ];

  summaryItems.forEach(item => {
    const p = document.createElement("p");
    p.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
    card.appendChild(p);
  });

  const backBtn = document.createElement("button");
  backBtn.textContent = "⬅️ Return to Form";
  backBtn.onclick = () => {
    card.classList.add("hidden");
    document.getElementById("main-form").classList.remove("hidden");
  };
  card.appendChild(backBtn);

  card.classList.remove("hidden");
  document.getElementById("main-form").classList.add("hidden");
}

document.getElementById("summaryBtn").addEventListener("click", () => {
  evaluateFast();
  evaluateIstumble();
  buildSummaryCard();
});

document.getElementById("settingsBtn").addEventListener("click", () => {
  alert("Settings panel not yet implemented in this version.");
});

document.getElementById("medsBtn").addEventListener("click", () => {
  alert("Blood Thinner List:\nWarfarin, Apixaban (Eliquis), Rivaroxaban (Xarelto), Dabigatran (Pradaxa), Edoxaban, Clopidogrel, Aspirin, Ticagrelor, Prasugrel, Heparin, LMWH, Fondaparinux.");
});

function resetAppData() {
  document.querySelectorAll("input, select").forEach(el => el.value = "");
  document.getElementById("card-view").classList.add("hidden");
  document.getElementById("main-form").classList.remove("hidden");
}

function buildForm() {
  buildFastTest();
  buildIstumble();
  buildObsSection();
  setupTooltips();
}

function setupTooltips() {
  const tooltips = {
    "istumble-help": {
      title: "ISTUMBLE",
      text: "Use this tool to determine if a lift is safe. Escalate if any red flags present."
    },
    "obs-help": {
      title: "Observations",
      text: "Enter vitals here. NEWS2-based thresholds highlight abnormal values."
    },
    "fast-help": {
      title: "FAST Stroke Test",
      text: "Check for signs of stroke. Initiate stroke protocol if positive."
    },
    "frat-help": {
      title: "FRAT Risk Assessment",
      text: "Assess long-term fall risk. Dropdown options calculate total score."
    }
  };

  Object.entries(tooltips).forEach(([id, data]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => {
        alert(`${data.title} Info:\n\n${data.text}`);
      });
    }
  });
}

window.onload = () => {
  buildForm();
  document.getElementById("main-form").classList.remove("hidden");
};

