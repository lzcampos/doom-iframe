"use strict";

async function registerContextMenus() {
  try {
    await chrome.contextMenus.removeAll();
  } catch (_) {}
  try {
    chrome.contextMenus.create({
      id: "webdoom-inject",
      title: "WebDOOM: inject floating overlay",
      contexts: ["page", "frame"],
    });
  } catch (e) {
    console.warn(e);
  }
  try {
    chrome.contextMenus.create({
      id: "webdoom-new-tab",
      title: "WebDOOM: open in new tab",
      contexts: ["page", "frame"],
    });
  } catch (e) {
    console.warn(e);
  }
  try {
    chrome.contextMenus.create({
      id: "webdoom-new-tab-action",
      title: "WebDOOM: open in new tab",
      contexts: ["action"],
    });
  } catch (e) {
    /* Older Chromium may not support contexts: ["action"] */
  }
}

async function ensureSidePanelClickOpensPanel() {
  try {
    if (chrome.sidePanel && typeof chrome.sidePanel.setPanelBehavior === "function") {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    }
  } catch (e) {
    console.warn("WebDOOM: sidePanel.setPanelBehavior failed", e);
  }
}

/**
 * Firefox: no chrome.sidePanel — toolbar click must open the sidebar explicitly.
 * Chrome: openPanelOnActionClick handles this; onClicked is not fired there.
 */
chrome.action.onClicked.addListener(async function () {
  try {
    if (chrome.sidebarAction && typeof chrome.sidebarAction.open === "function") {
      await chrome.sidebarAction.open();
    }
  } catch (e) {
    console.warn("WebDOOM: sidebarAction.open failed", e);
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  await ensureSidePanelClickOpensPanel();
  registerContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  ensureSidePanelClickOpensPanel();
  registerContextMenus();
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "webdoom-inject" && tab && tab.id != null) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: false },
        files: ["inject/overlay.js"],
      });
    } catch (e) {
      console.error("WebDOOM inject failed", e);
      await chrome.tabs.create({ url: chrome.runtime.getURL("player-tab.html") });
    }
    return;
  }
  if (info.menuItemId === "webdoom-new-tab" || info.menuItemId === "webdoom-new-tab-action") {
    await chrome.tabs.create({ url: chrome.runtime.getURL("player-tab.html") });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "open-webdoom-tab") {
    await chrome.tabs.create({ url: chrome.runtime.getURL("player-tab.html") });
    return;
  }
  if (command !== "toggle-page-overlay") return;
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab || tab.id == null) return;
  const u = tab.url || "";
  if (
    u.startsWith("chrome://") ||
    u.startsWith("chrome-extension://") ||
    u.startsWith("edge://") ||
    u.startsWith("about:") ||
    u.startsWith("moz-extension:")
  ) {
    await chrome.tabs.create({ url: chrome.runtime.getURL("player-tab.html") });
    return;
  }
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: false },
      files: ["inject/overlay.js"],
    });
  } catch (e) {
    console.error("WebDOOM overlay shortcut failed", e);
    await chrome.tabs.create({ url: chrome.runtime.getURL("player-tab.html") });
  }
});
