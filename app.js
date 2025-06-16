// Helper functions
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

function createInput(id, type = "text", placeholder = "") {
  const input = document.createElement("input");
  input.type = type;
  input.id = id;
  if (placeholder) input.placeholder = placeholder;
  return input;
}

function createTextarea(id, placeholder = "") {
  const textarea = document.createElement("textarea");
  textarea.id = id;
  textarea.rows = 3;
  textarea.placeholder = placeholder;
  return textarea;
}

function createDateInput(id) {
  const input = document.createElement("input");
  input.type = "date";
  input.id = id;
  return input;
}

function createLabelWithElement(text, element, description = "") {
  const label = document.createElement("label");
  label.htmlFor = element.id;
  label.style.display = "block";
  label.style.marginTop = "12px";
  label.style.fontWeight = "600";
  label.textContent = text;
  if (description) {
    const desc = document.createElement("div");
    desc.style.fontWeight = "400";
    desc.style.fontSize = "0.85rem";
    desc.style.marginTop = "3px";
    desc.style.color = "#555";
    desc.textContent = description;
    label.appendChild(desc);
  }
  label.appendChild(element);
  return label;
}

// ISTUMBLE Questions Setup
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
    resultDiv.textContent = "⚠️ Red Flag Detected: Escalate via Response Desk";
    resultDiv.className = "risk-result high-risk";
  } else {
    resultDiv.textContent = "✅ No Red Flags Detected";
    resultDiv.className = "risk-result low-risk";
  }
}

// FRAT Build (with Yes/No dropdown checklist and AMTS ref button)
function buildFrat() {
  const fratContainer = document.getElementById("frat-content");
  fratContainer.innerHTML = "";

  const recentFalls = createSelect("recentFalls", [
    { value: "2", text: "None in last 12 months" },
    { value: "4", text: "One or more between 3 and 12 months ago" },
    { value: "6", text: "One or more in last 3 months" },
    { value: "8", text: "One or more in last 3 months whilst inpatient / resident" }
  ], "Select recent falls");
  fratContainer.appendChild(createLabelWithElement("Recent Falls", recentFalls, "To score this, complete history of falls overleaf"));

  const meds = createSelect("meds", [
    { value: "1", text: "Not taking any of these" },
    { value: "2", text: "Taking one (Sedatives, Anti-Depressants)" },
    { value: "3", text: "Taking two (Anti-Parkinson’s, Diuretics)" },
    { value: "4", text: "Taking more than two (Anti-hypertensives, hypnotics)" }
  ], "Select medication count");
  fratContainer.appendChild(createLabelWithElement("Medications", meds));

  const psych = createSelect("psych", [
    { value: "1", text: "No apparent psychological issues" },
    { value: "2", text: "Mild anxiety/depression or mildly affected" },
    { value: "3", text: "Moderately affected (poor cooperation, insight)" },
    { value: "4", text: "Severely affected (poor judgement esp. re mobility)" }
  ], "Select psychological status");
  fratContainer.appendChild(createLabelWithElement("Psychological Status", psych));

  // Cognitive status + AMTS reference button container
  const cog = createSelect("cog", [
    { value: "1", text: "AMTS 9 or 10 (Intact)" },
    { value: "2", text: "AMTS 7-8 (Mildly Impaired)" },
    { value: "3", text: "AMTS 5-6 (Moderately Impaired)" },
    { value: "4", text: "AMTS 4 or less (Severely Impaired)" }
  ], "Select cognitive status");

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.gap = "10px";

  const labelText = document.createElement("label");
  labelText.htmlFor = "cog";
  labelText.style.fontWeight = "600";
  labelText.textContent = "Cognitive Status (AMTS)";

  const refButton = document.createElement("button");
  refButton.type = "button";
  refButton.textContent = "AMTS Questions";
  refButton.style.padding = "4px 8px";
  refButton.style.fontSize = "0.85rem";
  refButton.style.cursor = "pointer";
  refButton.style.backgroundColor = "#00703c";
  refButton.style.color = "white";
  refButton.style.border = "none";
  refButton.style.borderRadius = "4px";

  refButton.addEventListener("click", () => {
    document.getElementById("amts-modal").style.display = "block";
  });

  container.appendChild(labelText);
  container.appendChild(refButton);

  const labelWithSelect = createLabelWithElement("", cog);
  labelWithSelect.insertBefore(container, labelWithSelect.firstChild);

  fratContainer.appendChild(labelWithSelect);

  // High Risk Checkboxes
  const highRisk1 = createInput("autoHighRisk1", "checkbox");
  const highRisk1Label = document.createElement("label");
  highRisk1Label.htmlFor = "autoHighRisk1";
  highRisk1Label.textContent = "Recent change in functional status and/or medications affecting safe mobility (or anticipated)";
  highRisk1Label.style.display = "block";
  highRisk1Label.style.marginTop = "15px";

  const highRisk2 = createInput("autoHighRisk2", "checkbox");
  const highRisk2Label = document.createElement("label");
  highRisk2Label.htmlFor = "autoHighRisk2";
  highRisk2Label.textContent = "Dizziness / postural hypotension";
  highRisk2Label.style.display = "block";

  fratContainer.appendChild(highRisk1);
  fratContainer.appendChild(highRisk1Label);
  fratContainer.appendChild(highRisk2);
  fratContainer.appendChild(highRisk2Label);

  const part2Title = document.createElement("h3");
  part2Title.textContent = "Part 2: Risk Factor Checklist";
  part2Title.style.marginTop = "30px";
  fratContainer.appendChild(part2Title);

  const checklistItems = [
    "Vision Reports / observed difficulty seeing - objects / signs / finding way around",
    "Mobility status unknown or appears unsafe / impulsive / forgets gait aid",
    "Transfer status unknown or appears unsafe ie. over-reaches, impulsive",
    "Observed or reported agitation, confusion, disorientation",
    "Difficulty following instructions or non-compliant (observed or known)",
    "Observed risk-taking behaviours, or reported from referrer / previous facility",
    "Observed unsafe use of equipment",
    "Unsafe footwear / inappropriate clothing",
    "Difficulties with orientation to environment i.e. areas between bed / bathroom / dining room",
    "Underweight / low appetite",
    "Reported or known urgency / nocturia / accidents"
  ];

  checklistItems.forEach((item, i) => {
    const select = createSelect(`checklist${i}`, [
      { value: "", text: "Please Select" },
      { value: "Yes", text: "Yes" },
      { value: "No", text: "No" }
    ]);
    fratContainer.appendChild(createLabelWithElement(item, select));
  });

  const historyTitle = document.createElement("h3");
  historyTitle.textContent = "History of Falls";
  historyTitle.style.marginTop = "30px";
  fratContainer.appendChild(historyTitle);

  const fallsDuringStayChk = createInput("fallsDuringStay", "checkbox");
  const fallsDuringStayLabel = document.createElement("label");
  fallsDuringStayLabel.htmlFor = "fallsDuringStay";
  fallsDuringStayLabel.textContent = "Falls prior to this admission / during current stay";
  fallsDuringStayLabel.style.display = "block";
  fratContainer.appendChild(fallsDuringStayChk);
  fratContainer.appendChild(fallsDuringStayLabel);

  const fallsInfo = createTextarea("fallsInfo", "Describe circumstances of recent falls, details and comments");
  fratContainer.appendChild(createLabelWithElement("Circumstances of Recent Falls", fallsInfo));

  const infoSource = createInput("infoSource", "text", "Information obtained from (patient/family/medical records)");
  fratContainer.appendChild(createLabelWithElement("Information Source", infoSource));

  const reviewTitle = document.createElement("h3");
  reviewTitle.textContent = "Review";
  reviewTitle.style.marginTop = "30px";
  fratContainer.appendChild(reviewTitle);

  const reviewDate1 = createDateInput("reviewDate1");
  fratContainer.appendChild(createLabelWithElement("Review Date", reviewDate1));

  const riskStatus1 = createSelect("riskStatus1", [
    { value: "", text: "Please Select" },
    { value: "Low", text: "Low" },
    { value: "Medium", text: "Medium" },
    { value: "High", text: "High" }
  ]);
  fratContainer.appendChild(createLabelWithElement("Risk Status", riskStatus1));

  const revisedCarePlan1 = createSelect("revisedCarePlan1", [
    { value: "", text: "Please Select" },
    { value: "Y", text: "Yes" },
    { value: "N", text: "No" }
  ]);
  fratContainer.appendChild(createLabelWith