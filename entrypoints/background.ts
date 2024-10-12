export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openModal") {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id! },
          func: injectReactApp,
        });
      });
    }
  });

  function injectReactApp() {
    const root = document.getElementById('ai-modal-content');
    // if (root) {
    //   // This is where we'll render our React app
    //   root.innerHTML = '<div id="root"></div>';
    //   const script = document.createElement('script');
    //   script.src = chrome.runtime.getURL('/content-scripts/content.js');
    //   document.body.appendChild(script);
    // }
  }
});
