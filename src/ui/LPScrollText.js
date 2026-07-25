//=============================================================================
// LPScrollText.js
//=============================================================================

LOGICPULSE.UI.ScrollText = class extends LOGICPULSE.UI.Element {
    constructor(options) {
        super();
        options = options || {};
        this._width = options.width || 200;
        this._height = options.height || 100;
        this._padding = options.padding || 0;
        this._lineHeight = options.lineHeight || 28;
        this._fontSize = options.fontSize || 20;
        this._scroll = 0;
        this._maxScroll = 0;
        this._contentHeight = 0;
        this.move(options.x || 0, options.y || 0);
        this.create();
    }
    create() {
        this.createMask();
        this.createText();
    }
    createMask() {
        this._maskGraphic = new PIXI.Graphics();
        this._maskGraphic.beginFill(0xffffff);
        this._maskGraphic.drawRect(0, 0, this._width, this._height);
        this._maskGraphic.endFill();
        this.addChild(this._maskGraphic);
    }
    createText() {
        this._textSprite = new Sprite();
        this._textSprite.bitmap = new Bitmap(this._width, 2000);
        this._textSprite.bitmap.fontFace = $gameSystem.mainFontFace();
        this._textSprite.bitmap.fontSize = this._fontSize;
        this._textSprite.bitmap.outlineWidth = 4;
        this._textSprite.bitmap.outlineColor = "rgba(0,0,0,0.8)";
        this._textSprite.mask = this._maskGraphic;
        this.addChild(this._textSprite);
    }
    setText(text) {
        text = String(text || "");
        this._textSprite.bitmap.clear();
        this.drawWrappedText(text);
        this.resetScroll();
    }
    drawWrappedText(text) {
        var bitmap = this._textSprite.bitmap;
        var maxWidth = this._width - this._padding * 2;
        var words = text.split(/\s+/);
        var line = "", y = 0;
        for (var i = 0; i < words.length; i++) {
            var word = words[i];
            var test = line.length ? line + " " + word : word;
            var width = bitmap.measureTextWidth(test);
            if (width > maxWidth && line.length) {
                bitmap.drawText(line, this._padding, y, maxWidth, this._lineHeight, "left");
                line = word;
                y += this._lineHeight;
            } else {
                line = test;
            }
        }
        if (line.length) {
            bitmap.drawText(line, this._padding, y, maxWidth, this._lineHeight, "left");
            y += this._lineHeight;
        }
        this._contentHeight = y;
        this._maxScroll = Math.max(0, this._contentHeight - this._height);
    }
    scroll(amount) {
        if (this._maxScroll <= 0) return;
        this._scroll += amount;
        if (this._scroll < 0) this._scroll = 0;
        if (this._scroll > this._maxScroll) this._scroll = this._maxScroll;
        this._textSprite.y = -this._scroll;
    }
    canScroll() { return this._maxScroll > 0; }
    resetScroll() { this._scroll = 0; this._textSprite.y = 0; }
};