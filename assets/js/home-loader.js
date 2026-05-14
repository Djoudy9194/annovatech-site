(function () {
  const loadedScripts = new Set();

  function loadScript(src) {
    if (!src || loadedScripts.has(src)) {
      return Promise.resolve();
    }

    const existingScript = document.querySelector(`script[data-lazy-script="${src}"]`);
    if (existingScript) {
      loadedScripts.add(src);
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.dataset.lazyScript = src;
      script.onload = () => {
        loadedScripts.add(src);
        resolve();
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  function runWhenIdle(callback) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: 1800 });
      return;
    }

    window.setTimeout(callback, 1);
  }

  function loadScriptsWhenVisible(selector, scripts) {
    const target = document.querySelector(selector);
    if (!target || !Array.isArray(scripts) || scripts.length === 0) {
      return;
    }

    const loadTargetScripts = () => {
      scripts.forEach((src) => {
        loadScript(src).catch(() => {
          // Ignore lazy script failures to preserve core page functionality.
        });
      });
    };

    if (!("IntersectionObserver" in window)) {
      loadTargetScripts();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        observer.disconnect();
        loadTargetScripts();
      },
      {
        rootMargin: "240px 0px",
      }
    );

    observer.observe(target);
  }

  window.addEventListener("load", () => {
    runWhenIdle(() => {
      loadScript("assets/js/main.js").catch(() => {
        // Ignore lazy script failures to preserve core page functionality.
      });
    });

    loadScriptsWhenVisible("#analytics", ["assets/js/counters.js"]);
    loadScriptsWhenVisible("#testimonials", ["assets/js/slider.js"]);
    loadScriptsWhenVisible("#faq", ["assets/js/faq.js"]);
  });
})();