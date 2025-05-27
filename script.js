document.addEventListener("DOMContentLoaded", () => {

const emotionData = [
  {
    main: "Angry",
    related: ["Let down", "Humiliated", "Bitter", "Mad", "Aggressive", "Frustrated", "Distant", "Critical"],
    deep: ["Betrayed", "Resentful", "Disrespected", "Ridiculed", "Indignant", "Violated", "Furious", "Jealous", "Provoked", "Hostile", "Infuriated", "Annoyed", "Withdrawn", "Numb", "Respected", "Sceptical", "Dismissive"]
  },
  {
    main: "Disgusted",
    related: ["Disapproving", "Disappointed", "Awful", "Repelled"],
    deep: ["Judgmental", "Embarrassed", "Appalled", "Revolted", "Nauseated", "Detestable", "Horrified", "Hesitant"]
  },
  {
    main: "Surprised",
    related: ["Startled", "Confused", "Amazed", "Excited"],
    deep: ["Shocked", "Dismayed", "Disillusioned", "Perplexed", "Astonished", "Awe", "Eager", "Energetic"]
  },
  {
    main: "Happy",
    related: ["Playful", "Content", "Interested", "Proud", "Accepted", "Powerful", "Peaceful", "Trusting", "Optimistic"],
    deep: ["Aroused", "Cheeky", "Free", "Joyful", "Curious", "Inquisitive", "Successful", "Confident", "Respected", "Valued", "Courageous", "Creative", "Loving", "Thankful", "Detestable", "Sensitive", "Intimate", "Hopeful", "Inspired"]
  },
  {
    main: "Sad",
    related: ["Depressed", "Hurt", "Guilty", "Lonely", "Despair", "Vulnerable"],
    deep: ["Embarrassed", "Disappointed", "Remorseful", "Inferior", "Empty", "Isolated", "Abandoned", "Fragile", "Grief", "Victimised", "Ashamed", "Powerless"]
  },
  {
    main: "Bad",
    related: ["Bored", "Stressed", "Busy", "Tired"],
    deep: ["Indifferent", "Apathetic", "Pressured", "Overwhelmed", "Out of control", "Rushed", "Unfocused", "Sleepy"]
  },
  {
    main: "Fearful",
    related: ["Weak", "Scared", "Anxious", "Insecure", "Rejected", "Threatened"],
    deep: ["Helpless", "Worried", "Frightened", "Overwhelmed", "Inferior", "Inadequate", "Worthless", "Insignificant", "Excluded", "Persecuted", "Nervous", "Exposed"]
  }
];

const emotionColors = {
  Angry: 'rgba(255, 99, 132, 0.7)',
  Disgusted: 'rgba(153, 102, 255, 0.7)',
  Surprised: 'rgba(255, 206, 86, 0.7)',
  Happy: 'rgba(75, 192, 192, 0.7)',
  Sad: 'rgba(54, 162, 235, 0.7)',
  Bad: 'rgba(255, 159, 64, 0.7)',
  Fearful: 'rgba(201, 203, 207, 0.7)'
};

const wheel = document.getElementById("emotionWheel");
const centerX = 500;
const centerY = 500;
const radii = [100, 250, 400];

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const continueBtn = document.getElementById('continueBtn');
const startOverBtn = document.getElementById('startOverBtn');
const wheelContainer = document.getElementById('wheel-container');
const startSection = document.getElementById('start-section');
const timerDisplay = document.getElementById('timerDisplay');
const timer = document.getElementById('timer');
const totalTime = document.getElementById('totalTime');
const chartCanvas = document.getElementById('emotionChart');

let sessionActive = false;
let sessionLog = [];
let idleTimer;
let touchedElement = null;
let timerInterval;
let secondsElapsed = 0;
let timerRunning = false;

const analyzeBtn = document.getElementById("analyzeBtn");
analyzeBtn.style.display = "none";
const analysisBox = document.getElementById("analysisResult");
const toggleChartBtn = document.getElementById("toggleChartBtn");
const toggleAnalysisBtn = document.getElementById("toggleAnalysisBtn");

analyzeBtn.style.display = "none";
analysisBox.style.display = "none";
toggleChartBtn.style.display = "none";
toggleAnalysisBtn.style.display = "none";

if (analyzeBtn) analyzeBtn.style.display = "none";
if (analysisBox) {
  analysisBox.style.display = "none";
  analysisBox.style.padding = "20px";
  analysisBox.style.marginTop = "20px";
  analysisBox.style.border = "1px solid #ccc";
  analysisBox.style.maxWidth = "600px";
  analysisBox.style.overflowWrap = "break-word";
  analysisBox.style.marginLeft = "auto";
  analysisBox.style.marginRight = "auto";
  analysisBox.style.animation = "fadeInFloat 1s ease forwards";

}
if (toggleChartBtn) toggleChartBtn.style.display = "none";
if (toggleAnalysisBtn) toggleAnalysisBtn.style.display = "none";

// Toggle Buttons Behavior
if (toggleChartBtn) {
  toggleChartBtn.addEventListener("click", () => {
    if (chartCanvas.style.display === "none") {
      chartCanvas.style.display = "block";
      toggleChartBtn.textContent = "Hide Chart";
    } else {
      chartCanvas.style.display = "none";
      toggleChartBtn.textContent = "Show Chart";
    }
  });
}

if (toggleAnalysisBtn) {
  toggleAnalysisBtn.addEventListener("click", () => {
    if (analysisBox.style.display === "none") {
      analysisBox.style.display = "block";
      toggleAnalysisBtn.textContent = "Hide Analysis";
    } else {
      analysisBox.style.display = "none";
      toggleAnalysisBtn.textContent = "Show Analysis";
    }
  });
}
// Ensure analyze button works
  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", async () => {
      analysisBox.style.display = "block";
      analysisBox.textContent = "Analyzing emotions... please wait.";

      const uniqueEmotions = [...new Set(sessionLog.map(entry => entry.emotion))];
      const totalTimeInMinutes = Math.round(secondsElapsed / 60);

      if (uniqueEmotions.length === 0) {
        analysisBox.textContent = "No emotions were selected during the session.";
        return;
      }

      const prompt = `
The user interacted with an emotion wheel while scrolling short-form videos for approximately ${totalTimeInMinutes} minute(s).
They logged a total of ${sessionLog.length} emotions. The types of emotions selected were: ${uniqueEmotions.join(', ')}.

Based on this pattern, write a short reflection (5–8 sentences) in a personal, thoughtful, and conversational tone. Focus on:

- How emotionally intense this session might have felt
- How rapid emotional shifts may affect energy and mental balance
- How exposure to these emotions might subtly shape decision-making or self-awareness

Avoid giving advice. Don’t mention therapy. Reflect like someone helping a friend make sense of their own emotional habits.
`.trim();

try {
  const response = await fetch("https://emotions-uejz.onrender.com/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt })
  });

  let message = "No response received.";
  try {
    const data = await response.json();
    message = data.message || message;
  } catch (e) {
    console.error("❌ Failed to parse response:", e);
  }

  analysisBox.textContent = message;
  toggleAnalysisBtn.style.display = "inline-block";

  // Send session to Google Sheet
  const feedbackMessage = `
Total emotions: ${sessionLog.length}
Unique emotions: ${uniqueEmotions.join(', ')}
Duration: ${formatTime(secondsElapsed)}
Analysis: ${message || "No analysis text"}
`;

  await fetch("https://emotions-uejz.onrender.com/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feedback: feedbackMessage })
  });

  console.log("✅ Session data sent to Google Sheet!");
} catch (err) {
  analysisBox.textContent = "Error during analysis.";
  console.error("OpenAI request failed:", err);
}

    });
  }


function showEmotionChart() {
  // Prevent it from growing infinitely
  chartCanvas.style.display = "block";
const emotionCount = sessionLog.length;
const dynamicHeight = Math.min(600, 300 + emotionCount * 20);
chartCanvas.style.maxHeight = "600px";
chartCanvas.style.height = `${dynamicHeight}px`;
chartCanvas.style.overflow = "auto"; // prevent overflow


  if (window.myEmotionChart) {
    window.myEmotionChart.destroy();
  }

  const grouped = {};
  sessionLog.forEach(entry => {
    if (!grouped[entry.emotion]) grouped[entry.emotion] = [];
    grouped[entry.emotion].push({ x: entry.time, y: 1 });
  });

  const datasets = Object.entries(grouped).map(([emotion, data]) => {
    const group = Object.keys(emotionColors).find(main =>
      emotionData.find(e => e.main === main)?.related.includes(emotion) ||
      emotionData.find(e => e.main === main)?.deep.includes(emotion) ||
      emotion === main
    ) || emotion;

    const color = emotionColors[group] || 'rgba(100, 149, 237, 0.6)';

    return {
      label: emotion,
      data: data.map((entry, index) => ({ x: entry.x, y: index + 1 })),
      showLine: true,
      pointRadius: 6,
      borderWidth: 2,
      fill: false,
      backgroundColor: color,
      borderColor: color
    };
  });

  window.myEmotionChart = new Chart(chartCanvas, {
    type: 'scatter',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: { boxWidth: 20, padding: 10 }
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Seconds Elapsed' },
          ticks: { precision: 0 }
        },
        y: {
          min: 1,
          title: { display: true, text: 'Emotion Count' },
          ticks: { stepSize: 1 }
        }
      }
    }
  });

  analyzeBtn.style.display = "inline-block";
  toggleChartBtn.style.display = "inline-block";
}


function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function drawMultiRingWheel() {
  const oldGroup = document.getElementById("wheelRotation");
  if (oldGroup) oldGroup.remove();
  const wheelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  wheelGroup.setAttribute("id", "wheelRotation");
  wheel.appendChild(wheelGroup);

  const total = emotionData.length;
  const slice = 360 / total;

  emotionData.forEach((group, i) => {
    const startAngle = i * slice;
    const hue = (i / total) * 360;
    [group.main, group.related, group.deep].forEach((layer, layerIndex) => {
      const r0 = layerIndex === 0 ? 0 : radii[layerIndex - 1];
      const r1 = radii[layerIndex];
      const segmentCount = Array.isArray(layer) ? layer.length : 1;
      for (let j = 0; j < segmentCount; j++) {
        const angleOffset = (slice / segmentCount) * j;
        const segStart = startAngle + angleOffset;
        const segEnd = segStart + slice / segmentCount;
        const x1 = centerX + r1 * Math.cos(toRadians(segStart));
        const y1 = centerY + r1 * Math.sin(toRadians(segStart));
        const x2 = centerX + r1 * Math.cos(toRadians(segEnd));
        const y2 = centerY + r1 * Math.sin(toRadians(segEnd));
        const x3 = centerX + r0 * Math.cos(toRadians(segEnd));
        const y3 = centerY + r0 * Math.sin(toRadians(segEnd));
        const x4 = centerX + r0 * Math.cos(toRadians(segStart));
        const y4 = centerY + r0 * Math.sin(toRadians(segStart));

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const d = `M${x1},${y1} A${r1},${r1} 0 0,1 ${x2},${y2} L${x3},${y3} A${r0},${r0} 0 0,0 ${x4},${y4} Z`;
        const emotion = Array.isArray(layer) ? layer[j] : layer;
        path.setAttribute("d", d);
        path.setAttribute("fill", `hsl(${hue}, 40%, ${80 - layerIndex * 10}%)`);
        path.setAttribute("stroke", "#fff");
        path.setAttribute("stroke-width", "1");
        path.setAttribute("data-emotion", emotion);

        const groupEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
        groupEl.setAttribute("class", "segment-group");
        groupEl.setAttribute("transform-origin", `${centerX} ${centerY}`);
        groupEl.addEventListener("click", () => {
          logEmotion(emotion);
        });

        const angleMid = (segStart + segEnd) / 2;
        const rText = r0 + (r1 - r0) * 0.5;
        const xText = centerX + rText * Math.cos(toRadians(angleMid));
        const yText = centerY + rText * Math.sin(toRadians(angleMid));
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", xText);
        text.setAttribute("y", yText);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("alignment-baseline", "middle");
        text.setAttribute("font-size", "10");
        text.setAttribute("fill", "#333");
        text.textContent = emotion;
        let rotate = angleMid;
        if (rotate > 90 && rotate < 270) rotate += 180;
        text.setAttribute("transform", `rotate(${rotate} ${xText} ${yText})`);
        groupEl.appendChild(path);
        groupEl.appendChild(text);
        wheelGroup.appendChild(groupEl);
      }
      
    });
  });
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function startSession(reset = false) {
  if (reset) sessionLog = [];
  sessionActive = true;
  resetIdleTimer();
}

function stopSession() {
  sessionActive = false;
  clearTimeout(idleTimer);
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  
}

function logEmotion(emotion) {
  if (sessionActive) {
    sessionLog.push({ emotion, time: secondsElapsed });
    resetIdleTimer();
  }
}

startBtn.addEventListener('click', () => {
  document.querySelector('.blobs').style.display = 'none';
    document.querySelector('.intro-wrapper').style.display = 'none';

  startSection.style.display = 'none';
  wheelContainer.style.display = 'flex';
  chartCanvas.style.display = 'none';
  drawMultiRingWheel();
  startSession(true);
  secondsElapsed = 0;
  timer.textContent = formatTime(secondsElapsed);
  timerDisplay.style.display = 'block';
  totalTime.style.display = 'none';
  timerInterval = setInterval(() => {
    secondsElapsed++;
    timer.textContent = formatTime(secondsElapsed);
    timer.classList.remove("pulse");
void timer.offsetWidth; // <- forces reflow so animation restarts
timer.classList.add("pulse")
  }, 1000);
  timerRunning = true;
});

stopBtn.addEventListener('click', () => {
  stopSession();
  clearInterval(timerInterval);
  timerRunning = false;
  wheelContainer.style.display = 'none';
  startSection.style.display = 'none';
  document.getElementById("postStopControls").style.display = 'block';
  document.getElementById("analyzeBtn").style.display = "inline-block";
  timerDisplay.style.display = 'none';
  totalTime.textContent = `Total time: ${formatTime(secondsElapsed)}`;
  totalTime.style.display = 'block';
  showEmotionChart();
});

continueBtn.addEventListener('click', () => {
  document.getElementById("postStopControls").style.display = 'none';
  analyzeBtn.style.display = "none";
  analysisBox.style.display = "none";
  wheelContainer.style.display = 'flex';
  chartCanvas.style.display = 'none';
  drawMultiRingWheel();
  startSession();
  timerDisplay.style.display = 'block';
  totalTime.style.display = 'none';
  timerInterval = setInterval(() => {
    secondsElapsed++;
    timer.textContent = formatTime(secondsElapsed);
  }, 1000);
  timerRunning = true;
});

startOverBtn.addEventListener('click', () => {
  document.getElementById("postStopControls").style.display = 'none';
  wheelContainer.style.display = 'flex';
  chartCanvas.style.display = 'none';
  drawMultiRingWheel();
  startSession(true);
  secondsElapsed = 0;
  timer.textContent = formatTime(secondsElapsed);
  timerDisplay.style.display = 'block';
  totalTime.style.display = 'none';
  timerInterval = setInterval(() => {
    secondsElapsed++;
    timer.textContent = formatTime(secondsElapsed);
  }, 1000);
  timerRunning = true;
});

let isDragging = false;
let startAngle = 0;
let currentRotation = 0;

function getAngle(x, y) {
  const dx = x - centerX;
  const dy = y - centerY;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

function onStart(e) {
  e.preventDefault();
  isDragging = true;
  const pos = e.touches ? e.touches[0] : e;
  startAngle = getAngle(pos.clientX, pos.clientY);
  if (e.touches) {
    const touch = e.touches[0];
    const touchedEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const group = touchedEl?.closest('.segment-group');

    if (group) {
      touchedElement = group;
      group.classList.add('hovered');
    }
  }
}

function onMove(e) {
  if (!isDragging) return;
  e.preventDefault();
  const pos = e.touches ? e.touches[0] : e;
  const angle = getAngle(pos.clientX, pos.clientY);
  const delta = angle - startAngle;
  startAngle = angle;
  currentRotation += delta;
  document.getElementById("wheelRotation").setAttribute("transform", `rotate(${currentRotation} ${centerX} ${centerY})`);
}

function onEnd() {
  if (touchedElement) {
    touchedElement.classList.remove('hovered');
    const path = touchedElement.querySelector('[data-emotion]');
    if (path && path.dataset.emotion) {
      const emotion = path.dataset.emotion;
      logEmotion(emotion);
      console.log("Touched:", emotion);
    }
  }
  touchedElement = null;
  isDragging = false;
}

const svg = document.getElementById("emotionWheel");
svg.addEventListener("mousedown", onStart);
svg.addEventListener("mousemove", onMove);
svg.addEventListener("mouseup", onEnd);
svg.addEventListener("mouseleave", onEnd);

svg.addEventListener("touchstart", onStart, { passive: false });
svg.addEventListener("touchmove", onMove, { passive: false });
svg.addEventListener("touchend", onEnd);


const feedbackURL = 'http://emotions-uejz.onrender.com/api/feedback';
  const feedbackBox = document.getElementById("feedbackContainer");
  const toggleBtn = document.getElementById("toggleFeedbackBtn");
  const submitBtn = document.getElementById("submitFeedbackBtn");

  if (toggleBtn && feedbackBox && submitBtn) {
    toggleBtn.addEventListener("click", () => {
      feedbackBox.classList.toggle("show");
    });

    submitBtn.addEventListener("click", async () => {
      const feedback = document.getElementById("feedbackInput").value;
      if (!feedback.trim()) {
        alert("Please enter some feedback.");
        return;
      }

      try {
        await fetch(feedbackURL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ feedback })
        });

        alert("Feedback sent successfully!");
        document.getElementById("feedbackInput").value = "";
        feedbackBox.classList.remove("show");
      } catch (error) {
        console.error("Feedback error:", error);
        alert("Failed to send feedback.");
      }
    });
  }
});