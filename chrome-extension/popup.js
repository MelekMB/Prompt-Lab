const apiUrlInput = document.getElementById('apiUrl');
const apiKeyInput = document.getElementById('apiKey');
const roundsSelect = document.getElementById('rounds');
const saveBtn = document.getElementById('saveBtn');
const testBtn = document.getElementById('testBtn');
const statusEl = document.getElementById('status');

function setStatus(msg, type = '') {
  statusEl.textContent = msg;
  statusEl.className = 'status ' + type;
}

// Load saved settings
chrome.storage.sync.get(['apiUrl', 'apiKey', 'rounds'], ({ apiUrl, apiKey, rounds }) => {
  if (apiUrl) apiUrlInput.value = apiUrl;
  if (apiKey) apiKeyInput.value = apiKey;
  if (rounds) roundsSelect.value = rounds;
});

saveBtn.addEventListener('click', () => {
  const apiUrl = apiUrlInput.value.trim();
  const apiKey = apiKeyInput.value.trim();
  const rounds = roundsSelect.value;

  if (!apiUrl) { setStatus('Please enter the API URL.', 'err'); return; }
  if (!apiKey) { setStatus('Please enter the API key.', 'err'); return; }

  chrome.storage.sync.set({ apiUrl, apiKey, rounds }, () => {
    setStatus('✓ Settings saved!', 'ok');
    setTimeout(() => setStatus(''), 2500);
  });
});

testBtn.addEventListener('click', async () => {
  const apiUrl = apiUrlInput.value.trim();
  const apiKey = apiKeyInput.value.trim();

  if (!apiUrl || !apiKey) { setStatus('Enter URL and key first.', 'err'); return; }

  setStatus('Testing…');
  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/healthz`, {
      headers: { 'X-Extension-Key': apiKey },
    });
    if (res.ok) setStatus('✓ Connected!', 'ok');
    else setStatus(`✗ Server returned ${res.status}`, 'err');
  } catch (e) {
    setStatus('✗ Cannot reach server', 'err');
  }
  setTimeout(() => setStatus(''), 3000);
});
