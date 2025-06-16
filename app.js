// === Helper Functions ===
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
  let redFlag = false;
  const thinners = getSelectedThinners();
  const trauma = getVal("trauma");
  const alerts = [];

  if (thinners.length) {
    alerts.push("⚠️ Anticoagulant Use Detected – Seek Advice from PP Hub");
  }

  if (thinners.length && (trauma === "Yes" || trauma === "Unknown")) {
    alerts.push("⚠️ Anticoagulant Use with Suspected or Unknown Trauma – Lift Not Authorised");
    redFlag = true;
  }

  istumbleQuestions.forEach(q => {
    const val = getVal(q.id);
    if (val === "Yes") redFlag = true;
  });

  const resultDiv = document.getElementById("istumble-result");
  if (alerts.length > 0) {
    resultDiv.innerHTML = alerts.join("<br>");
    resultDiv.className = "risk-result high-risk";
  } else if (redFlag) {
    resultDiv.textContent = "⚠️ Lift Not Authorised – Red Flag Detected: Escalate via Response Desk";
    resultDiv.className = "risk-result high-risk";
  } else {
    resultDiv.textContent = "✅ Lift Authorised – No Red Flags Detected";
    resultDiv.className = "risk-result low-risk";
  }
}

function getSelectedThinners() {
  const select = document.getElementById("blood-thinners");
  return Array.from(select.selectedOptions).map(opt => opt.value);
}

// === Summary ===
function generateSummary() {
  const card = document.getElementById("card-view");
  const thinners = getSelectedThinners().join(", ");
  card.innerHTML = `
    <h2>Patient Summary</h2>
    <p>Age: ${getVal("patient-age")}, Sex: ${getVal("patient-sex")}</p>
    <p>CFR: ${getVal("cfr-id")}, ESR: ${getVal("esr-number")}, INC: ${getVal("inc-number")}</p>
    <p>Date: ${getVal("incident-date")}, Time: ${getVal("incident-time")}</p>
    <p>Blood Thinners: ${thinners || "None Selected"}</p>
    <button onclick="returnToForm()">← Back to Form</button>
  `;
  card.classList.remove("hidden");
  document.getElementById("main-form").classList.add("hidden");
}

function returnToForm() {
  document.getElementById("main-form").classList.remove("hidden");
  document.getElementById("card-view").classList.add("hidden");
}

// === Settings and Meds ===
function showMedicines() {
  const card = document.getElementById("card-view");
  card.innerHTML = `
    <h2>Common Blood Thinners</h2>
    <select multiple id="blood-thinners" style="width:100%;height:100px;">
      <option value="Aspirin">Aspirin (Disprin, Caprin)</option>
      <option value="Clopidogrel">Clopidogrel (Plavix)</option>
      <option value="Warfarin">Warfarin (Marevan, Coumadin)</option>
      <option value="Apixaban">Apixaban (Eliquis)</option>
      <option value="Rivaroxaban">Rivaroxaban (Xarelto)</option>
      <option value="Edoxaban">Edoxaban (Lixiana)</option>
    </select>
    <p><em>⚠️ Anticoagulant Use triggers clinical escalation checks.</em></p>
    <button onclick="returnToForm()">← Back to Form</button>
  `;
  card.classList.remove("hidden");
  document.getElementById("main-form").classList.add("hidden");
}

function showSettings() {
  const card = document.getElementById("card-view");
  card.innerHTML = `
    <h2>Settings</h2>
    <p>Theme: [Switch]</p>
    <p>Font: [Select Bionic, Sans, Serif]</p>
    <p>Dark Mode: [Toggle]</p>
    <p><button onclick="clearData()">Clear Saved Data</button></p>
    <button onclick="returnToForm()">← Back to Form</button>
  `;
  card.classList.remove("hidden");
  document.getElementById("main-form").classList.add("hidden");
}

function clearData() {
  localStorage.clear();
  alert("App data cleared.");
}

document.getElementById("summaryBtn").addEventListener("click", generateSummary);
document.getElementById("medsBtn").addEventListener("click", showMedicines);
document.getElementById("settingsBtn").addEventListener("click", showSettings);
