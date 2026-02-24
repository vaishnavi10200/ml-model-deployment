// ===== CONFIG =====
const API_URL = 'https://iris-api-oc24zgbr5a-el.a.run.app';

// ===== SPECIES DATA =====
const SPECIES_DATA = {
  setosa: {
    icon: '🌸',
    scientific: 'Iris setosa',
    color: '#D4846A',
    description: 'Small, delicate flowers with short petals'
  },
  versicolor: {
    icon: '💜',
    scientific: 'Iris versicolor',
    color: '#8B7BA8',
    description: 'Medium-sized flowers with mixed coloring'
  },
  virginica: {
    icon: '🌿',
    scientific: 'Iris virginica',
    color: '#7A9E7E',
    description: 'Large flowers with long petals and sepals'
  }
};

// ===== SLIDER SYNC =====
const fields = ['sepalLength', 'sepalWidth', 'petalLength', 'petalWidth'];

fields.forEach(field => {
  const slider = document.getElementById(`${field}Slider`);
  const number = document.getElementById(field);

  // Sync slider → number
  slider.addEventListener('input', () => {
    number.value = parseFloat(slider.value).toFixed(1);
  });

  // Sync number → slider
  number.addEventListener('input', () => {
    slider.value = number.value;
  });
});

// ===== PRESET BUTTONS =====
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const values = btn.dataset.values.split(',').map(Number);
    const fieldIds = ['sepalLength', 'sepalWidth', 'petalLength', 'petalWidth'];

    fieldIds.forEach((field, i) => {
      document.getElementById(field).value = values[i].toFixed(1);
      document.getElementById(`${field}Slider`).value = values[i];
    });

    // Animate button
    btn.style.background = 'var(--sage)';
    btn.style.color = '#fff';
    btn.style.borderColor = 'var(--sage)';
    setTimeout(() => {
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 800);
  });
});

// ===== SHOW STATE HELPER =====
function showState(stateName) {
  const states = ['loadingState', 'emptyState', 'resultState', 'errorState'];
  states.forEach(s => {
    const el = document.getElementById(s);
    el.classList.toggle('active', s === stateName);
  });
}

// ===== RENDER RESULT =====
function renderResult(data) {
  const speciesKey = data.class.toLowerCase();
  const species = SPECIES_DATA[speciesKey] || {
    icon: '🌺',
    scientific: `Iris ${speciesKey}`,
    color: 'var(--sage)',
    description: ''
  };

  // Species display
  document.getElementById('speciesIcon').textContent = species.icon;
  document.getElementById('speciesName').textContent =
    speciesKey.charAt(0).toUpperCase() + speciesKey.slice(1);
  document.getElementById('speciesSci').textContent = species.scientific;

  // Confidence
  document.getElementById('confidenceValue').textContent = `${data.confidence}%`;

  // Animate confidence bar after a tick
  setTimeout(() => {
    document.getElementById('confidenceFill').style.width = `${data.confidence}%`;
    document.getElementById('confidenceFill').style.background =
      `linear-gradient(90deg, ${species.color}, ${species.color}88)`;
  }, 100);

  // Probability bars
  const probBars = document.getElementById('probBars');
  probBars.innerHTML = '';

  const probColors = {
    setosa: '#D4846A',
    versicolor: '#8B7BA8',
    virginica: '#7A9E7E'
  };

  Object.entries(data.probabilities).forEach(([name, pct]) => {
    const color = probColors[name.toLowerCase()] || 'var(--sage)';
    const isWinner = name.toLowerCase() === speciesKey;

    const item = document.createElement('div');
    item.className = 'prob-bar-item';
    item.innerHTML = `
      <div class="prob-name" style="${isWinner ? `color:${color};font-weight:700` : ''}">
        ${name.charAt(0).toUpperCase() + name.slice(1)}
      </div>
      <div class="prob-track">
        <div class="prob-fill" data-pct="${pct}" style="background:${color}${isWinner ? '' : '66'}"></div>
      </div>
      <div class="prob-pct">${pct}%</div>
    `;
    probBars.appendChild(item);
  });

  // Animate prob bars after render
  setTimeout(() => {
    probBars.querySelectorAll('.prob-fill').forEach(fill => {
      fill.style.width = `${fill.dataset.pct}%`;
    });
  }, 150);

  showState('resultState');
}

// ===== PREDICT =====
async function predict() {
  const btn = document.getElementById('predictBtn');
  btn.disabled = true;
  btn.querySelector('.btn-text').textContent = 'Classifying...';

  showState('loadingState');

  const features = fields.map(field =>
    parseFloat(document.getElementById(field).value)
  );

  // Validate inputs
  if (features.some(isNaN)) {
    showState('errorState');
    document.getElementById('errorMsg').textContent = 'Please fill in all measurements.';
    btn.disabled = false;
    btn.querySelector('.btn-text').textContent = 'Classify Flower';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();

    if (data.error) throw new Error(data.error);

    renderResult(data);

  } catch (err) {
    showState('errorState');
    document.getElementById('errorMsg').textContent =
      err.message.includes('Failed to fetch')
        ? 'Could not reach the API. Check your connection or CORS settings.'
        : err.message;
  } finally {
    btn.disabled = false;
    btn.querySelector('.btn-text').textContent = 'Classify Flower';
  }
}

// ===== API HEALTH CHECK =====
async function checkHealth() {
  const dot = document.getElementById('statusDot');
  const label = document.getElementById('statusLabel');

  dot.className = 'status-dot checking';
  label.textContent = 'Checking API...';

  try {
    const res = await fetch(`${API_URL}/health`);
    if (res.ok) {
      dot.className = 'status-dot online';
      label.textContent = 'API Online';
    } else {
      throw new Error('not ok');
    }
  } catch {
    dot.className = 'status-dot offline';
    label.textContent = 'API Offline';
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  showState('emptyState');
  checkHealth();

  // Re-check health every 60s
  setInterval(checkHealth, 60000);
});