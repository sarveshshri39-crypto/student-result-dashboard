// Fictional results for this demo; each record represents one student's exam.
const results = [
  { name: "Alex Morgan", roll: "R-101", subject: "Mathematics", score: 93 },
  { name: "Jordan Lee", roll: "R-102", subject: "English", score: 81 },
  { name: "Casey Patel", roll: "R-103", subject: "Science", score: 74 },
  { name: "Taylor Kim", roll: "R-104", subject: "History", score: 48 },
  { name: "Riley Chen", roll: "R-105", subject: "Mathematics", score: 88 },
  { name: "Avery Brooks", roll: "R-106", subject: "English", score: 67 },
  { name: "Morgan Diaz", roll: "R-107", subject: "Science", score: 91 },
  { name: "Jamie Park", roll: "R-108", subject: "History", score: 55 },
  { name: "Quinn Rivera", roll: "R-109", subject: "Mathematics", score: 39 },
  { name: "Skyler Nguyen", roll: "R-110", subject: "English", score: 96 },
  { name: "Drew Carter", roll: "R-111", subject: "Science", score: 62 },
  { name: "Robin Shah", roll: "R-112", subject: "History", score: 79 },
];

const passMark = 50;
const scoreRanges = [
  { label: "0-49", min: 0, max: 49 },
  { label: "50-59", min: 50, max: 59 },
  { label: "60-69", min: 60, max: 69 },
  { label: "70-79", min: 70, max: 79 },
  { label: "80-100", min: 80, max: 100 },
];

const searchInput = document.querySelector("#student-search");
const subjectFilter = document.querySelector("#subject-filter");
const statusFilter = document.querySelector("#status-filter");
const resultsBody = document.querySelector("#results-body");
const chart = document.querySelector("#score-chart");

// Populate the subject menu from the sample data so it stays in sync.
const subjects = [...new Set(results.map((result) => result.subject))].sort();
subjects.forEach((subject) => {
  const option = document.createElement("option");
  option.value = subject;
  option.textContent = subject;
  subjectFilter.append(option);
});

function getGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  if (score >= passMark) return "E";
  return "F";
}

function getVisibleResults() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedSubject = subjectFilter.value;
  const selectedStatus = statusFilter.value;

  return results.filter((result) => {
    const matchesSearch =
      result.name.toLowerCase().includes(searchTerm) ||
      result.roll.toLowerCase().includes(searchTerm);
    const matchesSubject = selectedSubject === "all" || result.subject === selectedSubject;
    const isPassing = result.score >= passMark;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "pass" && isPassing) ||
      (selectedStatus === "fail" && !isPassing);

    return matchesSearch && matchesSubject && matchesStatus;
  });
}

function updateSummary(visibleResults) {
  const studentCount = new Set(visibleResults.map((result) => result.roll)).size;
  const totalScore = visibleResults.reduce((total, result) => total + result.score, 0);
  const average = visibleResults.length ? Math.round(totalScore / visibleResults.length) : 0;
  const highest = visibleResults.length
    ? Math.max(...visibleResults.map((result) => result.score))
    : 0;
  const passedCount = visibleResults.filter((result) => result.score >= passMark).length;
  const passRate = visibleResults.length
    ? Math.round((passedCount / visibleResults.length) * 100)
    : 0;

  document.querySelector("#student-count").textContent = String(studentCount);
  document.querySelector("#class-average").textContent = `${average}%`;
  document.querySelector("#highest-score").textContent = `${highest}%`;
  document.querySelector("#pass-rate").textContent = `${passRate}%`;
}

function updateChart(visibleResults) {
  const counts = scoreRanges.map(
    (range) =>
      visibleResults.filter((result) => result.score >= range.min && result.score <= range.max)
        .length,
  );
  const largestCount = Math.max(...counts, 1);
  chart.replaceChildren();
  chart.setAttribute(
    "aria-label",
    `Score distribution for current results: ${scoreRanges
      .map((range, index) => `${range.label}: ${counts[index]}`)
      .join(", ")}`,
  );

  scoreRanges.forEach((range, index) => {
    const row = document.createElement("div");
    row.className = "chart-row";

    const label = document.createElement("span");
    label.className = "chart-label";
    label.textContent = range.label;

    const track = document.createElement("div");
    track.className = "chart-track";
    track.setAttribute("aria-hidden", "true");

    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.width = `${(counts[index] / largestCount) * 100}%`;
    track.append(bar);

    const count = document.createElement("span");
    count.className = "chart-count";
    count.textContent = String(counts[index]);

    row.append(label, track, count);
    chart.append(row);
  });
}

function updateTable(visibleResults) {
  resultsBody.replaceChildren();

  if (visibleResults.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "empty-state";
    cell.colSpan = 6;
    cell.textContent = "No results match your search and filters.";
    row.append(cell);
    resultsBody.append(row);
    return;
  }

  visibleResults.forEach((result) => {
    const row = document.createElement("tr");
    const isPassing = result.score >= passMark;
    const values = [result.name, result.roll, result.subject, `${result.score}%`, getGrade(result.score)];

    values.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    });

    const statusCell = document.createElement("td");
    const status = document.createElement("span");
    status.className = `status ${isPassing ? "status-pass" : "status-fail"}`;
    status.textContent = isPassing ? "Pass" : "Fail";
    statusCell.append(status);
    row.append(statusCell);
    resultsBody.append(row);
  });
}

function renderDashboard() {
  const visibleResults = getVisibleResults();
  updateSummary(visibleResults);
  updateChart(visibleResults);
  updateTable(visibleResults);
  document.querySelector("#result-count").textContent =
    `Showing ${visibleResults.length} ${visibleResults.length === 1 ? "result" : "results"}`;
}

searchInput.addEventListener("input", renderDashboard);
subjectFilter.addEventListener("change", renderDashboard);
statusFilter.addEventListener("change", renderDashboard);
document.querySelector("#reset-filters").addEventListener("click", () => {
  searchInput.value = "";
  subjectFilter.value = "all";
  statusFilter.value = "all";
  renderDashboard();
  searchInput.focus();
});

renderDashboard();
