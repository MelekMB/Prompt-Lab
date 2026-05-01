(function () {
  'use strict';

  if (document.querySelector('#promptlabs-float-btn')) return;

  let activeEl = null;
  let btn = null;
  let dismissed = false; // hide until next field focus

  // ── Create the floating button ──────────────────────────────────────────────
  function createBtn() {
    const el = document.createElement('div');
    el.id = 'promptlabs-float-btn';
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Improve with Prompt Labs');
    el.innerHTML = `
      <div class="pl-spinner"></div>
      <div class="pl-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 8L11 12L5 16" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13 16H19" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="pl-label">Improve</span>
      <span class="pl-dismiss" title="Hide">✕</span>
    `;

    // Improve click — only on the main button area, not the dismiss ×
    el.addEventListener('mousedown', (e) => {
      if (e.target.closest('.pl-dismiss')) return;
      e.stopPropagation();
      e.preventDefault();
      handleImprove();
    });

    // Dismiss ×
    el.querySelector('.pl-dismiss').addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      dismissed = true;
      el.style.display = 'none';
    });

    document.body.appendChild(el);
    return el;
  }

  // ── Position button at top-right corner of the field, just above it ─────────
  function positionBtn(el) {
    const rect = el.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const btnW = 80;
    const btnH = 22;
    const gap = 4;

    const vpH = document.documentElement.clientHeight;
    const vpW = document.documentElement.clientWidth;

    // Default: just above the field, aligned to its right edge
    let top = rect.top + scrollY - btnH - gap;
    let left = rect.right + scrollX - btnW;

    // If no room above, put it just below the field
    if (rect.top - gap - btnH < 0) {
      top = rect.bottom + scrollY + gap;
    }

    // If still off-screen below, overlap inside top-right corner
    if (top > vpH + scrollY - btnH) {
      top = rect.top + scrollY + gap;
    }

    // Clamp horizontally
    if (left + btnW > vpW + scrollX - 4) left = vpW + scrollX - btnW - 4;
    if (left < scrollX + 4) left = scrollX + 4;

    btn.style.top = top + 'px';
    btn.style.left = left + 'px';
    btn.style.display = 'flex';
  }

  // ── Read text from any kind of field ────────────────────────────────────────
  function getText(el) {
    if (el.isContentEditable) return (el.innerText || el.textContent || '').trim();
    return (el.value || '').trim();
  }

  // ── Write text back (React/Vue/plain compatible) ─────────────────────────────
  function setText(el, text) {
    el.focus();
    if (el.isContentEditable) {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand('insertText', false, text);
      if ((el.innerText || '').trim() === '') {
        el.innerText = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else {
      const proto = el.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (nativeSetter) nativeSetter.call(el, text);
      else el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // ── Main improve handler ─────────────────────────────────────────────────────
  async function handleImprove() {
    const el = activeEl;
    if (!el) return;

    const text = getText(el);
    if (!text) {
      flash('Nothing typed', 'pl-error');
      return;
    }

    btn.classList.add('pl-loading');
    setLabel('Improving…');

    try {
      const settings = await new Promise((resolve) =>
        chrome.storage.sync.get(['apiUrl', 'apiKey', 'rounds'], resolve)
      );

      const rounds = parseInt(settings.rounds, 10) || 2;

      const result = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'IMPROVE_PROMPT',
            prompt: text,
            apiUrl: settings.apiUrl || '',
            apiKey: settings.apiKey || '',
            rounds,
          },
          (response) => {
            if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
            else if (response?.error) reject(new Error(response.error));
            else resolve(response?.result);
          }
        );
      });

      setText(el, result);
      btn.classList.remove('pl-loading');
      flash('✓ Done!', 'pl-done');
    } catch (err) {
      btn.classList.remove('pl-loading');
      flash('✗ Error', 'pl-error');
      console.warn('[PromptLabs]', err.message);
    }
  }

  function setLabel(text) {
    btn.querySelector('.pl-label').textContent = text;
  }

  function flash(label, cls) {
    btn.classList.add(cls);
    setLabel(label);
    setTimeout(() => {
      btn.classList.remove(cls);
      setLabel('Improve');
    }, 2500);
  }

  // ── Focus / blur detection ───────────────────────────────────────────────────
  function isTextTarget(el) {
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    if (tag === 'textarea') return true;
    if (tag === 'input') {
      const t = (el.type || 'text').toLowerCase();
      return ['text', 'search', 'email', 'url', ''].includes(t);
    }
    if (el.isContentEditable) return true;
    return false;
  }

  function onFocusIn(e) {
    const el = e.target;
    if (!isTextTarget(el)) return;
    if (el.closest && el.closest('#promptlabs-float-btn')) return;

    // Reset dismiss state when user focuses a new field
    if (el !== activeEl) dismissed = false;

    activeEl = el;
    if (!btn) btn = createBtn();
    if (!dismissed) {
      requestAnimationFrame(() => positionBtn(el));
    }
  }

  function onFocusOut(e) {
    if (!btn) return;

    // If focus moved directly to the button, never hide
    if (e.relatedTarget && btn.contains(e.relatedTarget)) return;

    setTimeout(() => {
      const hovered = btn.matches(':hover');
      const loading = btn.classList.contains('pl-loading');
      // Don't hide if another text field now has focus
      const stillInText = isTextTarget(document.activeElement);
      if (!hovered && !loading && !stillInText) {
        btn.style.display = 'none';
      }
    }, 300);
  }

  function onScrollOrResize() {
    if (btn && btn.style.display !== 'none' && activeEl) {
      positionBtn(activeEl);
    }
  }

  document.addEventListener('focusin', onFocusIn, true);
  document.addEventListener('focusout', onFocusOut, true);
  window.addEventListener('scroll', onScrollOrResize, { passive: true, capture: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
})();
