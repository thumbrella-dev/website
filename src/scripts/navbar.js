//  Client behaviour for the navbar: nav-logo fade-in, the Clerk account panel,
//  and the dashboard script shim. Lives in its own plain-JS module so Astro
//  bundles it as a deferred asset instead of inlining ~11 KB of script at the
//  top of every served page. Imported from src/components/Navbar.astro.

//  Nav logo: fade in after scrolling past hero.
//  Runs as a deferred module (Astro hoists it to the head), so the document may
//  already be parsed by the time this executes.
function onReady(cb) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => cb());
  } else {
    cb();
  }
}

onReady(() => {
  const navLogo = document.getElementById('nav-logo');
  const hero = document.getElementById('hero');

  if (!navLogo) return;

  // Logo starts invisible (via [data-logo-hidden] CSS). Decide how to proceed:
  navLogo.style.transition = 'opacity 0.35s ease';

  if (hero) {
    // Homepage: tie visibility to hero leaving viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        navLogo.style.opacity = entry.isIntersecting ? '0' : '1';
      },
      { threshold: 0.1 }
    );
    observer.observe(hero);
  } else {
    // Any other page: show immediately (small fade-in feels intentional)
    requestAnimationFrame(() => { navLogo.style.opacity = '1'; });
  }
});

// ---- Clerk integration (vanilla JS, lazy-loaded on click) ----
(function () {
  var accountBtn = document.getElementById('nav-account-btn');
  if (!accountBtn) return;

  // Clerk config is fetched at runtime from the admin worker.
  // No build-time key; dev/prod switching is handled server-side.
  var clerkConfig = null;       // { publishableKey, frontendApi } from /api/clerk-config
  var clerkConfigLoading = false;

  var clerkReady = false;      // script loaded AND Clerk.load() has resolved
  var clerkLoading = false;    // script in-flight or Clerk.load() in-flight
  var pendingCallbacks = [];   // queue while Clerk is loading/initialising
  var btnOriginalHtml = '';    // saved button content for load/restore

  function btnLoading(on) {
    if (on) {
      if (!btnOriginalHtml) btnOriginalHtml = accountBtn.innerHTML;
      accountBtn.innerHTML = '<span class="nav-spin"></span> Loading\u2026';
      accountBtn.disabled = true;
    } else {
      if (btnOriginalHtml) accountBtn.innerHTML = btnOriginalHtml;
      accountBtn.disabled = false;
    }
  }

  function whenClerkReady(cb) {
    if (clerkReady) { cb(); return; }
    pendingCallbacks.push(cb);
    if (!clerkLoading && !clerkConfigLoading) initClerk();
  }

  function loadClerkConfig(cb) {
    if (clerkConfig) { cb(null); return; }
    if (clerkConfigLoading) {
      // Already loading; poll until done.
      var check = function () {
        if (clerkConfig) { cb(null); }
        else if (clerkConfigLoading) { setTimeout(check, 50); }
        else { cb(new Error('Clerk config not available')); }
      };
      setTimeout(check, 50);
      return;
    }
    clerkConfigLoading = true;
    btnLoading(true);
    fetch('/api/clerk-config')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        clerkConfigLoading = false;
        if (data && data.ok && data.publishableKey) {
          clerkConfig = data;
          // Keep loading visible; initClerk will clear it when Clerk.load() finishes.
          cb(null);
        } else {
          btnLoading(false);
          accountBtn.title = 'Account services not available';
          cb(new Error('Clerk config not available'));
        }
      })
      .catch(function (err) {
        clerkConfigLoading = false;
        btnLoading(false);
        accountBtn.title = 'Account services not available';
        cb(err);
      });
  }

  function initClerk() {
    loadClerkConfig(function (err) {
      if (err) {
        flushCallbacks(err);
        return;
      }
      var PUBLISHABLE_KEY = clerkConfig.publishableKey;
      var FRONTEND_API = clerkConfig.frontendApi;
      var CK_SCRIPT = FRONTEND_API
        ? 'https://' + FRONTEND_API + '/npm/@clerk/clerk-js@5/dist/clerk.browser.js'
        : '';

      if (!CK_SCRIPT) {
        flushCallbacks(new Error('Cannot derive Clerk script URL'));
        return;
      }
      clerkLoading = true;

      var ckScript = document.createElement('script');
      ckScript.async = true;
      ckScript.setAttribute('data-clerk-publishable-key', PUBLISHABLE_KEY);
      ckScript.crossOrigin = 'anonymous';
      ckScript.src = CK_SCRIPT;
      ckScript.onload = function () {
        window.Clerk.load({
          appearance: {
            variables: {
              colorBackground: '#212126',
              colorNeutral: 'white',
              colorPrimary: '#ffffff',
              colorPrimaryForeground: 'black',
              colorForeground: 'white',
              colorInputForeground: 'white',
              colorInput: '#26262B'
            },
            elements: {
              providerIcon__apple: { filter: 'invert(1)' },
              providerIcon__github: { filter: 'invert(1)' }
            }
          }
        })
          .then(function () {
            clerkReady = true;
            clerkLoading = false;
            btnLoading(false);
            flushCallbacks();
          })
          .catch(function (err) {
            clerkLoading = false;
            btnLoading(false);
            flushCallbacks(err);
          });
      };
      ckScript.onerror = function () {
        clerkLoading = false;
        btnLoading(false);
        flushCallbacks(new Error('Failed to load Clerk JS'));
      };
      document.head.appendChild(ckScript);
    });
  }

  function flushCallbacks(err) {
    var cbs = pendingCallbacks;
    pendingCallbacks = [];
    cbs.forEach(function (cb) { cb(err); });
  }

  function pushAccountUrl() {
    var p = window.location.pathname;
    if (p === '/account' || p === '/account/') return;
    history.pushState(null, '', '/account/');
  }

  function restoreAccountUrl() {
    if (isDirectAccountNav) {
      isDirectAccountNav = false;
      history.replaceState(null, '', '/');
    } else {
      history.back();
    }
  }

  function watchClerkModalClose() {
    var portalWasPresent = false;
    function poll() {
      var portal = document.querySelector('[data-floating-ui-portal]');
      if (portal) {
        portalWasPresent = true;
        requestAnimationFrame(poll);
      } else if (portalWasPresent) {
        document.dispatchEvent(new CustomEvent('tbr-carousel-resume'));
        restoreAccountUrl();
      } else {
        requestAnimationFrame(poll);
      }
    }
    requestAnimationFrame(poll);
  }

  function openUserProfile(customPages) {
    document.dispatchEvent(new CustomEvent('tbr-carousel-pause'));
    window.Clerk.openUserProfile({ customPages: customPages });
    pushAccountUrl();
    selectThumbrellaTab();
    watchClerkModalClose();
  }

  function selectThumbrellaTab() {
    function tryClick() {
      var buttons = document.querySelectorAll('.cl-navbarButton');
      for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].textContent.trim() === 'Thumbrella') {
          buttons[i].click();
          return;
        }
      }
      requestAnimationFrame(tryClick);
    }
    requestAnimationFrame(tryClick);
  }

  var umbrellaSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b8b8d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(-30 12 12)"><path d="M12 2v20"/><path d="M12 2c-5 0-9.3 2.5-10 6.5"/><path d="M12 2c5 0 9.3 2.5 10 6.5"/><path d="M2 8.5h20"/><path d="M9 22c0-1.7 1.3-3 3-3s3 1.3 3 3"/></g></svg>';
  var circleSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/></svg>';

  function openFallbackProfile() {
    var signOutHtml = '<button class="tbr-btn tbr-signout" onclick="window.Clerk.signOut({redirectUrl:\'/\'})">Sign out</button>';
    var html = '<div style="padding:1.5rem;text-align:center;color:var(--text-muted)"><p>Thumbrella admin services temporarily not responding.</p><br>' + signOutHtml + '</div>';
    openUserProfile([{
      label: 'Thumbrella',
      url: 'thumbrella',
      mount: function (el) { el.innerHTML = html; },
      unmount: function (el) { el.innerHTML = ''; },
      mountIcon: function (el) { el.innerHTML = umbrellaSvg; },
      unmountIcon: function (el) { el.innerHTML = ''; }
    }]);
  }

  function openDashboard() {
    accountBtn.disabled = true;
    fetch('/admin/dashboard')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        accountBtn.disabled = false;
        if (!data || !Array.isArray(data.tabs)) {
          // Admin binding failed or returned unexpected shape.
          openFallbackProfile();
          return;
        }

        var signOutHtml = '<button data-manage-account-sign-out class="tbr-btn tbr-signout" onclick="window.Clerk.signOut({redirectUrl:\'/\'})">Sign out</button>';

        var customPages = data.tabs.map(function (tab) {
          var html = tab.html.replace(/\{\{SIGNOUT\}\}/g, signOutHtml);
          return {
            label: tab.label,
            url: tab.url,
            mount: function (el) { el.innerHTML = html; },
            unmount: function (el) { el.innerHTML = ''; },
            mountIcon: function (el) { el.innerHTML = tab.url === 'manage-account' ? umbrellaSvg : circleSvg; },
            unmountIcon: function (el) { el.innerHTML = ''; }
          };
        });

        openUserProfile(customPages);
      })
      .catch(function (err) {
        accountBtn.disabled = false;
        console.error('[nav] dashboard fetch error:', err);
        openFallbackProfile();
      });
  }

  function openClerkPanel() {
    if (window.Clerk.user) {
      openDashboard();
    } else {
      var opened = window.Clerk.openSignIn({ redirectUrl: '/account/' });
      if (opened && typeof opened.then === 'function') {
        opened.then(function () {
          if (window.Clerk && window.Clerk.user) {
            openDashboard();
          }
        });
      }
    }
  }

  accountBtn.addEventListener('click', function () {
    whenClerkReady(function (err) {
      if (err) { return; }
      openClerkPanel();
    });
  });

  // Auto-open Clerk when navigating directly to /account.
  // Middleware rewrites /account -> / so the homepage content renders;
  // we detect the original pathname and open the profile automatically.
  var isDirectAccountNav = window.location.pathname === '/account' || window.location.pathname === '/account/';
  if (isDirectAccountNav) {
    whenClerkReady(function (err) {
      if (err) { console.error('[nav]', err.message || err); return; }
      openClerkPanel();
    });
  }

})();

// Dashboard script re-activation shim.
// React's dangerouslySetInnerHTML does not execute <script> tags.
// This shim watches for [data-tbr-script] elements and creates real <script> tags.
(function () {
  function activate() {
    document.querySelectorAll('[data-tbr-script]').forEach(function (s) {
      if (s.dataset.tbrActivated) return;
      s.dataset.tbrActivated = '1';
      var n = document.createElement('script');
      n.textContent = s.textContent;
      document.head.appendChild(n);
    });
  }
  activate();
  new MutationObserver(activate).observe(document.body, { childList: true, subtree: true });
})();
