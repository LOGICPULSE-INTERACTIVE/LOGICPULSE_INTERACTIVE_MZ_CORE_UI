"use strict";

module.exports = [

    //=========================================================================
    // 1. CORE
    //=========================================================================

    "src/Header.js",
    "src/Version.js",
    "src/Constants.js",

    //=========================================================================
    // 2. BASE MANAGERS (no dependencies)
    //=========================================================================

    "src/managers/LPAssets.js",          // Asset loading

    //=========================================================================
    // 3. INPUT & ANIMATION
    //=========================================================================

    "src/managers/LPInput.js",           // Input wrapper
    "src/managers/LPMouse.js",           // Mouse manager
    "src/managers/LPAnimator.js",        // Animations (pulse, etc.)


    //=========================================================================
    // 4. BASE UI (no dependencies)
    //=========================================================================

    "src/ui/LPUIElement.js",             // Base UI element
    "src/ui/LPText.js",                  // Text sprite
    "src/ui/LPScrollText.js",            // Scrollable text

    //=========================================================================
    // 5. GRID COMPONENTS (depends on UIElement, Text, etc.)
    //=========================================================================

    "src/ui/LPGridSlot.js",              // Individual grid slot
    "src/ui/LPGrid.js",                  // Grid logic (selection, scroll)

    //=========================================================================
    // 6. SCENE (depends on everything)
    //=========================================================================

    "src/scenes/LPScene.js",

    //=========================================================================
    // 7. ENTRY POINT
    //=========================================================================

    "src/Main.js"                        // Plugin entry point

];