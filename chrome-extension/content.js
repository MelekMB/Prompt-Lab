(function () {
  'use strict';

  // Don't inject into our own extension pages
  if (document.querySelector('#promptlabs-float-btn')) return;

  let activeEl = null;
  let btn = null;

  // ── Create the floating button ──────────────────────────────────────────────
  function createBtn() {
    const el = document.createElement('div');
    el.id = 'promptlabs-float-btn';
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Improve with Prompt Labs');
    el.innerHTML = `
      <div class="pl-spinner"></div>
      <div class="pl-icon">
        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 9.5L11.5 14L5 18.5" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 18.5H23" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="pl-label">Improve</span>
    `;
    el.addEventListener('mousedown', handleImprove);
    document.body.appendChild(el);
    return el;
  }

  // ── Position button just outside the bottom-right of the element ───────────
  function positionBtn(el) {
    const rect = el.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const btnW = 96;
    const btnH = 30;
    const gap = 6;

    const vpW = document.documentElement.clientWidth;
    const vpH = document.documentElement.clientHeight;

    // Default: just below the field, aligned to its right edge
    let top = rect.bottom + scrollY + gap;
    let left = rect.right + scrollX - btnW;

    // If no room below, put it just above the field
    if (rect.bottom + gap + btnH > vpH) {
      top = rect.top + scrollY - btnH - gap;
    }

    // Clamp horizontally so button never goes off-screen
    if (left + btnW > vpW + scrollX - 4) left = vpW + scrollX - btnW - 4;
    if (left < scrollX + 4) left = scrollX + 4;

    btn.style.top = top + 'px';
    btn.style.left = left + 'px';
    btn.style.display = 'flex';
  }

  // ── Read text from any kind of field ────────────────────────────────────────
  function getText(el) {
    if (el.isContentEditable) {
      return (el.innerText || el.textContent || '').trim();
    }
    return (el.value || '').trim();
  }

  // ── Write text back into any kind of field (React/Vue/plain) ─────────────
  function setText(el, text) {
    el.focus();

    if (el.isContentEditable) {
      // Works with Gmail, ChatGPT, Notion, Replit chat, Linear, etc.
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      sel.removeAllRanges();
      sel.addRange(range);
      // insertText is deprecated but universally supported and fires the right events
      document.execCommand('insertText', false, text);
      // Fallback if execCommand didn't work
      if ((el.innerText || '').trim() === '') {
        el.innerText = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else {
      // input / textarea — handle React's synthetic event tracking
      const proto =
        el.tagName === 'TEXTAREA'
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (nativeSetter) {
        nativeSetter.call(el, text);
      } else {
        el.value = text;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // ── Main improve handler ─────────────────────────────────────────────────
  async function handleImprove(e) {
    e.stopPropagation();
    e.preventDefault();

    const el = activeEl;
    if (!el) return;

    const text = getText(el);
    if (!text) {
      flash('Nothing typed yet', 'pl-error');
      return;
    }

    // Loading state
    btn.classList.add('pl-loading');
    setLabel('Improving…');

    try {
      const settings = await new Promise((resolve) =>
        chrome.storage.sync.get(['apiUrl', 'apiKey'], resolve)
      );

      const result = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'IMPROVE_PROMPT',
            prompt: text,
            apiUrl: settings.apiUrl || '',
            apiKey: settings.apiKey || '',
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (response?.error) {
              reject(new Error(response.error));
            } else {
              resolve(response?.result);
            }
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

  // ── Focus / blur detection ───────────────────────────────────────────────
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
    if (el.id === 'promptlabs-float-btn') return;

    activeEl = el;
    if (!btn) btn = createBtn();
    // small delay so the field is fully painted
    requestAnimationFrame(() => positionBtn(el));
  }

  function onFocusOut(e) {
    if (!btn) return;
    // Delay so a click on the button registers before we hide it
    setTimeout(() => {
      const hovered = btn.matches(':hover');
      const loading = btn.classList.contains('pl-loading');
      if (!hovered && !loading) {
        btn.style.display = 'none';
      }
    }, 180);
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
