//=============================================================================
// LPText.js
//=============================================================================

LOGICPULSE.UI.Text = class extends Sprite {
    constructor(options) {
        super();
        options = options || {};
        this._width = options.width || 100;
        this._height = options.height || 32;
        this.bitmap = new Bitmap(this._width, this._height);
        this.bitmap.fontFace = options.fontFace || $gameSystem.mainFontFace();
        this.bitmap.fontSize = options.fontSize || 20;
        this.bitmap.textColor = options.textColor || "#FFFFFF";
        this.bitmap.outlineColor = options.outlineColor || "rgba(0,0,0,0.8)";
        this.bitmap.outlineWidth = options.outlineWidth || 4;
        this._align = options.align || "left";
        this._padding = options.padding || 0;
        this._lineHeight = options.lineHeight || (this.bitmap.fontSize + 6);
        this.move(options.x || 0, options.y || 0);
        this.setText(options.text || "");
    }
    setText(text) {
        text = String(text);
        if (this._text === text) return;
        this._text = text;
        this.refresh();
    }
    refresh() {
        this.bitmap.clear();
        var lines = this.wrapText(this._text);
        var y = this._padding;
        for (var i = 0; i < lines.length; i++) {
            this.bitmap.drawText(lines[i], this._padding, y, this._width - this._padding * 2, this._lineHeight, this._align);
            y += this._lineHeight;
        }
    }
    wrapText(text) {
        if (!text) return [];
        var maxWidth = this._width - this._padding * 2;
        var words = text.split(" ");
        var lines = [], line = "";
        for (var i = 0; i < words.length; i++) {
            var word = words[i];
            var test = line ? line + " " + word : word;
            var width = this.bitmap.measureTextWidth(test);
            if (width > maxWidth && line.length > 0) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        }
        if (line.length > 0) lines.push(line);
        return lines;
    }
    text() { return this._text; }
};
