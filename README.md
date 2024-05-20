Run the below script in your console and it will start the plugin:

(function() { 
    const scripts = [
        "https://githubraw.com/andyman087/Achievements/main/data.js",
        "https://githubraw.com/andyman087/Achievements/main/visuals.js",
        "https://githubraw.com/andyman087/Achievements/main/main.js"
    ];

    function loadScript(url, callback) {
        const script = document.createElement("script");
        script.src = url + '?cacheBust=' + new Date().getTime();  // Cache busting
        script.onload = callback;
        script.onerror = function() {
            console.error("Failed to load script: " + url);
        };
        document.head.appendChild(script);
    }

    function removeOldScripts() {
        const scripts = document.querySelectorAll('script[src*="githubraw.com/andyman087/Achievements/main/"]');
        scripts.forEach(script => script.remove());
    }

    function loadScriptsSequentially(scripts, index) {
        if (index < scripts.length) {
            loadScript(scripts[index], () => loadScriptsSequentially(scripts, index + 1));
        }
    }

    removeOldScripts();  // Remove old script elements
    loadScriptsSequentially(scripts, 0);  // Load new scripts
})();
