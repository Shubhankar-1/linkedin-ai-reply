// 1. Import the style
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './popup/App';
import './popup/style.css';

export default defineContentScript({
  // matches: ['*://*.google.com/*'],
  // main() {
  //   console.log('Hello content.');
  // },
  matches: ["*://www.linkedin.com/*"],
  // 2. Set cssInjectionMode
  cssInjectionMode: 'manifest',

  async main() {
    // 3. Define your UI
    // Function to create and insert the AI icon
    function insertAiIcon(textarea: HTMLTextAreaElement) {
      if (!textarea || textarea.parentElement?.querySelector("#ai-icon")) return;

      const aiIcon = document.createElement("img");
      aiIcon.id = "ai-icon";
      aiIcon.src = chrome.runtime.getURL("Frame.png"); // Ensure Frame.png is in your extension's directory
      aiIcon.alt = "AI Icon";
      aiIcon.style.cssText = `
    position: absolute;
    right: 10px;
    bottom: 10px;
    cursor: pointer;
    width: 40px;
    height: 40px;
    z-index: 1000;
  `;
      if (textarea.parentElement) {
        textarea.parentElement.style.position = "relative";
        textarea.parentElement.appendChild(aiIcon);
      }

      // Ensure event listener is correctly attached
      aiIcon.addEventListener("mousedown", (event) => {
        event.preventDefault();
        event.stopPropagation();
      });

      aiIcon.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log("AI icon clicked");
        openModal();
        // Refocus the textarea after clicking the icon
        setTimeout(() => {
          textarea.focus();
        }, 0);
      });
    }
    // Function to remove the AI icon
    function removeAiIcon(textarea: HTMLTextAreaElement) {
      const aiIcon = textarea.parentElement?.querySelector("#ai-icon");
      if (aiIcon) {
        aiIcon.remove();
      }
    }

    function openModal() {
      console.log("Opening modal");
      const modal = document.createElement("div");
      modal.id = "ai-modal-container";
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;


      const modalContent = document.createElement("div");
      modalContent.id = "ai-modal-content";
      modalContent.style.cssText = `
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      // Create a root on the UI container and render a component
      const root = ReactDOM.createRoot(modalContent);
      root.render(React.createElement(App));

      // Inject the React app into the modal content
      chrome.runtime.sendMessage({ action: "openModal" });

      // Close modal when clicking outside the content
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });
    }

    // Function to check for and handle the textarea
    function checkForTextarea() {
      const textarea = document.querySelector(".msg-form__contenteditable") as HTMLTextAreaElement;
      if (textarea) {
        textarea.addEventListener("focus", () => insertAiIcon(textarea));
        textarea.addEventListener("blur", () => removeAiIcon(textarea));
      }
    }

    // Initial check
    checkForTextarea();

    // Set up a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          checkForTextarea();
        }
      });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });

    // Clean up the observer when the script is unloaded
    window.addEventListener("unload", () => {
      observer.disconnect();
    });

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "renderModal") {
        const modalContent = document.getElementById("ai-modal-content");
        if (modalContent) {
          modalContent.innerHTML = request.html;
        }
      }
      if (request.action === "insertText") {
        const textarea = document.querySelector(".msg-form__contenteditable");
        if (textarea) {
          textarea.textContent = request.text;
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    });
    // Function to insert text into the LinkedIn message field
    function insertText(text: string): void {
      const textarea = document.querySelector(".msg-form__contenteditable") as HTMLElement | null;
      if (textarea) {
        let paragraph = textarea.querySelector('p');
        if (paragraph) {
          paragraph.textContent = text;
        } else {
          textarea.textContent = text;
        }
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    // Listen for messages from the injected React app
    window.addEventListener(
      "message",
      function (event) {
        // We only accept messages from ourselves
        if (event.source != window) return;

        if (event.data.type && event.data.type == "FROM_REACT") {
          console.log("Content script received message: ", event.data);
          if (event.data.action === "insertText") {
            insertText(event.data.text);
            // Close the modal after inserting text
            const modal = document.getElementById("ai-modal-container");
            if (modal) {
              document.body.removeChild(modal);
            }
          }
        }
      },
      false
    );
  },
});
