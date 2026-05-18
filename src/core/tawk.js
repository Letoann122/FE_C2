const TAWK_SRC = "https://embed.tawk.to/69267c1f7a43e3195d75e558/1jav59mqa";
const SCRIPT_ID = "tawkto-script";

let loadPromise = null;

function isLoaded() {
  return !!document.getElementById(SCRIPT_ID);
}

export function loadTawk() {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (isLoaded()) return resolve();

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const s1 = document.createElement("script");
    s1.id = SCRIPT_ID;
    s1.async = true;
    s1.src = TAWK_SRC;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    s1.onload = () => resolve();
    s1.onerror = (e) => {
      loadPromise = null;
      reject(e);
    };

    document.head.appendChild(s1);
  });

  return loadPromise;
}

export async function showTawk(options = {}) {
  const { maximize = false } = options;

  try {
    await loadTawk();

    setTimeout(() => {
      window.Tawk_API?.showWidget?.();

      if (maximize) {
        window.Tawk_API?.maximize?.();
      }
    }, 100);
  } catch (e) {
    // nếu cần thì bạn console.log(e)
  }
}

export async function prepareTawkHidden() {
  try {
    await loadTawk();

    setTimeout(() => {
      window.Tawk_API?.hideWidget?.();
    }, 100);
  } catch (e) {}
}

export function hideTawk() {
  try {
    window.Tawk_API?.hideWidget?.();
  } catch (e) {}
}
