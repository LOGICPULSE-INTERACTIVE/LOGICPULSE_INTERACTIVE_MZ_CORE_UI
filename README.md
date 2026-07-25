# LOGICPULSE Core  
👤 Author: **LOGICPULSE INTERACTIVE**

The foundational library for all **LOGICPULSE Interactive** plugins for **RPG Maker MZ**.  
Provides shared UI components, asset management, input handling, and animation utilities.

---

This plugin is open‑source and available under the MIT License.

For support or feature requests, please open an issue on GitHub.

---

## ✨ Features

- **UI Base Classes** – `Element`, `Text`, `ScrollText` – reusable building blocks for custom UIs.
- **Asset Management** – Centralised loading, caching, and folder configuration for images.
- **Input System** – Keyboard and mouse wrappers (`LOGICPULSE.Input`, `LOGICPULSE.Mouse`) with key bindings.
- **Animation Helpers** – Pulse, bitmap swap, and tween utilities for smooth UI feedback.
- **Layout System** – Shared layout definitions (`LOGICPULSE.Layout`) for consistent positioning.
- **Plugin‑Friendly** – Designed to be extended by other LOGICPULSE plugins (Inventory, Store, Save/Load, etc.).
- **Lightweight & Performant** – Minimal overhead; only what’s needed for UI plugins.

---

## 📦 Installation

1. Download the latest release `.zip` file.
2. Place `LOGICPULSE_Core.js` in your project’s `js/plugins/` folder.
3. Open RPG Maker MZ, go to **Plugin Manager**, and add the plugin **at the top** of your plugin list.
4. Other LOGICPULSE plugins (e.g., Inventory, Store, Save/Load) **must** be placed below this core plugin.

---

## 🛠 Dependencies

This plugin has **no external dependencies** – it works standalone and provides the foundation for other plugins.

---

## 🖼️ Asset Folder Structure (Recommended)

Place your custom images in the following folders:
```Text
img/LOGICPULSE_INTERACTIVE UI/
├── Items/ – Shared item icons
├── Items_Show_Case/ – Large item previews
├── INVENTORY_UI/ – Inventory scene assets
├── STORE_UI/ – Shop scene assets
├── Save_Load_UI/ – Save/Load scene assets
├── INVENTORY_UI/Synthesizer/ – Crafting scene assets
└── INVENTORY_UI/Sidebar/ – Category tab assets
```
---

The core plugin does not require any images by itself – it only provides the loading logic.

---

## 📁 Source Structure (for developers)

The source code is organised in the `src/` folder for easy editing and customisation.
```text
src/
├── Version.js – Plugin name and version.
├── Constants.js – Shared constants (categories, modes).
├── core/
│ ├── LPAssets.js – Asset loader, folder/image definitions.
│ ├── LPLayout.js – Shared layout coordinates (empty by default).
│ ├── LPInput.js – Keyboard input wrapper (uses Input).
│ ├── LPMouse.js – Mouse input handler (TouchInput based).
│ ├── LPBindings.js – Default key/action mappings.
│ ├── LPAnimator.js – Animation helpers (pulse, bitmap swap).
│ └── LPUIElement.js – Base class for all UI elements (Sprite+Container).
├── ui/
│ ├── LPText.js – Multi‑line text with word wrap and alignment.
│ ├── LPScrollText.js – Scrollable text block with mouse wheel support.
│ └── LPBaseGrid.js – Generic grid base class (scrollable, selectable).
└── Main.js – Plugin entry point (initialises assets, mouse).
```
---

### How to Edit

1. Make changes to any `.js` file inside `src/`.
2. Run the build script (e.g., `npm run build` or your custom bundler) to generate the final plugin file.
3. Replace the plugin in your RPG Maker project with the newly built `.js` file.

> **Note:** The build process concatenates all `src` files in the order defined in your build configuration. Do not edit the final bundled file directly.

---

## 🔌 Using the Core in Your Own Plugin

To use the core in your custom plugin, simply include the core plugin as a dependency and extend its classes:

```js
class MyCustomUI extends LOGICPULSE.UI.Element {
    create() {
        // your code
    }
}
```

All core classes are available under the LOGICPULSE namespace.
---

## 🔧 Troubleshooting

| Issue                   | Solution 			  |
|-------------------------------|---------------------------------|
| LOGICPULSE.CoreVersion is undefined |	The core plugin is not loaded or is placed below a dependent plugin. Move it to the top. |
| Images not loading | Check folder paths. The core expects img/LOGICPULSE_INTERACTIVE UI/. |
| Mouse not working | Ensure LOGICPULSE.Mouse.initialize() is called (it auto‑initialises on load). |
| Layout not applying | Make sure LOGICPULSE.Layout is defined before using it. The core provides a stub. |


Enjoy!
– LOGICPULSE