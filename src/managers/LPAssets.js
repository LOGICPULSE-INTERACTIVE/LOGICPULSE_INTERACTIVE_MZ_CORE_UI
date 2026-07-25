//=============================================================================
// LPAssets.js
//=============================================================================

LOGICPULSE.Assets = LOGICPULSE.Assets || {};

// Base folders – plugins will add their own
LOGICPULSE.Assets.Folders = LOGICPULSE.Assets.Folders || {};

// Base images – plugins will add their own
LOGICPULSE.Assets.Images = LOGICPULSE.Assets.Images || {};

// Shared cache
LOGICPULSE.Assets._cache = LOGICPULSE.Assets._cache || {};

// System assets
LOGICPULSE.Assets.IconSet = null;

LOGICPULSE.Assets.initialize = function() {
    this.loadSystemAssets();
};

LOGICPULSE.Assets.loadSystemAssets = function() {
    this.IconSet = ImageManager.loadSystem("IconSet");
};

LOGICPULSE.Assets.load = function(folder, filename) {
    if (!Object.values(this.Folders).includes(folder)) {
        throw new Error("[LOGICPULSE] Unknown asset folder: " + folder);
    }
    var key = folder + filename;
    if (!this._cache[key]) {
        this._cache[key] = ImageManager.loadBitmap(folder, filename);
    }
    return this._cache[key];
};

LOGICPULSE.Assets.createSprite = function(folder, filename, x, y) {
    var sprite = new Sprite();
    sprite.bitmap = this.load(folder, filename);
    if (x !== undefined) sprite.x = x;
    if (y !== undefined) sprite.y = y;
    return sprite;
};

LOGICPULSE.Assets.createItemSprite = function(item) {
    if (!item) return new Sprite();
    // Try to find a folder that might contain item images – plugins will add Folders.Items if needed.
    var folder = this.Folders.Items || this.Folders.Inventory || "";
    if (!folder) {
        return this.createIcon(item.iconIndex);
    }
    return this.createSprite(folder, "Item_" + item.iconIndex);
};

LOGICPULSE.Assets.createShowcaseItemSprite = function(item) {
    if (!item) return new Sprite();
    var folder = this.Folders.Showcase || this.Folders.Inventory || "";
    if (!folder) {
        return this.createItemSprite(item);
    }
    return this.createSprite(folder, "Item_" + item.iconIndex);
};

LOGICPULSE.Assets.createIcon = function(iconIndex) {
    var sprite = new Sprite(this.IconSet);
    var rect = this.iconRect(iconIndex);
    sprite.setFrame(rect.x, rect.y, rect.width, rect.height);
    return sprite;
};

LOGICPULSE.Assets.iconRect = function(iconIndex) {
    var width = ImageManager.iconWidth;
    var height = ImageManager.iconHeight;
    return {
        x: (iconIndex % 16) * width,
        y: Math.floor(iconIndex / 16) * height,
        width: width,
        height: height
    };
};

LOGICPULSE.Assets.clearCache = function() {
    this._cache = {};
};