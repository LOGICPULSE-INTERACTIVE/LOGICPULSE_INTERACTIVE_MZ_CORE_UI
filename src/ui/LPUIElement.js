//=============================================================================
// LPUIElement.js
//=============================================================================

LOGICPULSE.UI = LOGICPULSE.UI || {};

LOGICPULSE.UI.Element = class extends PIXI.Container {
    constructor() {
        super();
        this._enabled = true;
    }
    create() {}
    refresh() {}
    update() {}
    show() { this.visible = true; }
    hide() { this.visible = false; }
    move(x, y) { this.position.set(x, y); }
    createSprite(folder, filename, x, y) {
        var sprite = LOGICPULSE.Assets.createSprite(folder, filename);
        sprite.position.set(x || 0, y || 0);
        this.addChild(sprite);
        return sprite;
    }
    createText(options) {
        var text = new LOGICPULSE.UI.Text(options);
        this.addChild(text);
        return text;
    }
    enable() { this._enabled = true; }
    disable() { this._enabled = false; }
    get enabled() { return this._enabled; }
    destroy(options) {
        var children = this.removeChildren();
        for (var i = 0; i < children.length; i++) {
            if (children[i].destroy) children[i].destroy();
        }
        super.destroy(options);
    }
};
