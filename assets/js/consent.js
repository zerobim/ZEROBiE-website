/* TOBiE cookie & storage consent — ZERO.BIM s.r.o.
   ------------------------------------------------------------------------
   What this does today
   - This site sets NO cookies and runs NO analytics, advertising or social
     tracking. The only thing stored is the visitor's own choice, in the
     browser's localStorage under the key "tobie_consent" (strictly necessary).
   - The choice expires after 6 months, or when CONSENT_VERSION is increased,
     and the banner is shown again.

   Adding an optional tool later (e.g. analytics)
   1. Describe it in cookies.html and privacy.html first.
   2. Increase CONSENT_VERSION below so every visitor is asked again.
   3. Load it ONLY through a blocked script tag, e.g.
        <script type="text/plain" data-consent="analytics" src="..."></script>
      It will run only after the visitor has allowed that category.
   ------------------------------------------------------------------------ */
(function () {
  'use strict';
  var KEY = 'tobie_consent';
  var CONSENT_VERSION = 1;
  var MAX_AGE_MS = 182 * 24 * 60 * 60 * 1000; // ~6 months
  var CATEGORIES = [
    { id: 'necessary', label: 'Strictly necessary', locked: true,
      text: 'Remembers the choice you make in this panel. Stored in your browser only; never sent to us.' },
    { id: 'preferences', label: 'Preferences',
      text: 'Would remember settings such as display preferences. Not currently used on this site.' },
    { id: 'analytics', label: 'Analytics',
      text: 'Would help us understand how the site is used. Not currently used on this site.' }
  ];

  function read() {
    try {
      var r = JSON.parse(window.localStorage.getItem(KEY));
      if (!r || r.v !== CONSENT_VERSION || typeof r.ts !== 'number' || Date.now() - r.ts > MAX_AGE_MS) return null;
      return r;
    } catch (e) { return null; }
  }

  function save(choice) {
    var r = { v: CONSENT_VERSION, ts: Date.now(), necessary: true,
      preferences: !!choice.preferences, analytics: !!choice.analytics };
    try { window.localStorage.setItem(KEY, JSON.stringify(r)); } catch (e) { /* storage blocked: choice applies to this page view only */ }
    apply(r);
    return r;
  }

  function apply(r) {
    var blocked = document.querySelectorAll('script[type="text/plain"][data-consent]');
    for (var i = 0; i < blocked.length; i++) {
      var s = blocked[i];
      if (!r[s.getAttribute('data-consent')] || s.getAttribute('data-consent-loaded')) continue;
      var n = document.createElement('script');
      for (var j = 0; j < s.attributes.length; j++) {
        var at = s.attributes[j];
        if (at.name !== 'type' && at.name !== 'data-consent') n.setAttribute(at.name, at.value);
      }
      if (!s.src) n.text = s.text;
      s.setAttribute('data-consent-loaded', '1');
      s.parentNode.insertBefore(n, s.nextSibling);
    }
    try { document.dispatchEvent(new CustomEvent('tobie:consent', { detail: r })); } catch (e) {}
  }

  var root = null, lastFocus = null;

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }

  function policyHref() {
    var a = document.querySelector('link[rel="consent-policy"]');
    return a ? a.getAttribute('href') : 'cookies.html';
  }

  function build(current, expanded) {
    close();
    lastFocus = document.activeElement;
    root = el('div', { 'class': 'tc-banner', role: 'dialog', 'aria-modal': 'false',
      'aria-labelledby': 'tc-title', 'aria-describedby': 'tc-desc' });
    var box = el('div', { 'class': 'tc-box' });
    box.appendChild(el('p', { 'class': 'tc-title', id: 'tc-title' }, 'Your privacy choices'));
    box.appendChild(el('p', { 'class': 'tc-desc', id: 'tc-desc' },
      'This site does not use tracking, analytics or advertising cookies. We only store the choice you make here, ' +
      'in your own browser. Optional categories stay off unless you switch them on. ' +
      '<a href="' + policyHref() + '">Cookie policy</a> &middot; <a href="privacy.html">Privacy notice</a>'));

    var panel = el('div', { 'class': 'tc-panel', id: 'tc-panel' });
    if (!expanded) panel.hidden = true;
    CATEGORIES.forEach(function (c) {
      var row = el('div', { 'class': 'tc-row' });
      var id = 'tc-' + c.id;
      var checked = c.locked || (current && current[c.id]);
      var input = el('input', { type: 'checkbox', id: id, 'data-cat': c.id });
      input.checked = !!checked;
      if (c.locked) { input.disabled = true; }
      var lab = el('label', { 'for': id }, '<span class="tc-cat">' + c.label + (c.locked ? ' <em>Always on</em>' : '') + '</span>' +
        '<span class="tc-cat-text">' + c.text + '</span>');
      row.appendChild(input); row.appendChild(lab);
      panel.appendChild(row);
    });
    box.appendChild(panel);

    var actions = el('div', { 'class': 'tc-actions' });
    var bReject = el('button', { type: 'button', 'class': 'tc-btn', 'data-act': 'reject' }, 'Reject all');
    var bCustom = el('button', { type: 'button', 'class': 'tc-btn tc-link', 'data-act': 'custom', 'aria-controls': 'tc-panel',
      'aria-expanded': expanded ? 'true' : 'false' }, expanded ? 'Save choices' : 'Customise');
    var bAccept = el('button', { type: 'button', 'class': 'tc-btn', 'data-act': 'accept' }, 'Accept all');
    actions.appendChild(bReject); actions.appendChild(bCustom); actions.appendChild(bAccept);
    box.appendChild(actions);
    root.appendChild(box);

    actions.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'accept') { save({ preferences: true, analytics: true }); close(); }
      else if (act === 'reject') { save({ preferences: false, analytics: false }); close(); }
      else if (act === 'custom') {
        if (panel.hidden) {
          panel.hidden = false; b.textContent = 'Save choices'; b.setAttribute('aria-expanded', 'true');
          var first = panel.querySelector('input:not([disabled])'); if (first) first.focus();
        } else {
          var c = {};
          panel.querySelectorAll('input[data-cat]').forEach(function (i) { c[i.getAttribute('data-cat')] = i.checked; });
          save(c); close();
        }
      }
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && read()) close();
    });
    document.body.appendChild(root);
    var focusBtn = expanded ? panel.querySelector('input:not([disabled])') : bReject;
    if (focusBtn && lastFocus && lastFocus !== document.body) focusBtn.focus();
  }

  function close() {
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null;
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) { try { lastFocus.focus(); } catch (e) {} }
  }

  function open() { build(read(), true); }

  window.tobieConsent = {
    open: open,
    get: read,
    reset: function () { try { window.localStorage.removeItem(KEY); } catch (e) {} build(null, false); }
  };

  function init() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-cookie-settings]');
      if (t) { e.preventDefault(); open(); }
    });
    var r = read();
    if (r) apply(r); else build(null, false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
