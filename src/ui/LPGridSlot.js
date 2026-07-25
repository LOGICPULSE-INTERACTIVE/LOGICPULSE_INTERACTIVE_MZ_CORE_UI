//=============================================================================
// LPGridSlot.js (Base – to be extended)
//=============================================================================

LOGICPULSE.UI.BaseGridSlot = class extends LOGICPULSE.UI.Element {
    constructor(options) {
        super();
        options = options || {};
        this._entry = options.entry || null;
        this._focused = false;
        this._locked = false;
        this._isDestroyed = false;
        this._isHovered = false;
        this._isMouseDown = false;
        this._isDragging = false;
        this._dragGhost = null;
        this._dragOriginalX = 0;
        this._dragOriginalY = 0;
        this._mouseDownX = 0;
        this._mouseDownY = 0;
        this._clickHandlers = [];
        this._hoverEnterHandlers = [];
        this._hoverExitHandlers = [];
        this._dragStartHandlers = [];
        this._dragMoveHandlers = [];
        this._dragEndHandlers = [];
        this._swapHandlers = [];
        this._clickDownHandlers = [];
        this._isCartSlot = options.isCartSlot || false;
        this._slotWidth = options.width || (this._isCartSlot ? 92 : 230);
        this._slotHeight = options.height || 92;
        this.move(options.x || 0, options.y || 0);
        this.create();
    }

    create() {
        this.createBackground();
        this.createContent();
        this.createSelectionFrame();
        this.createHoverOverlay();
        this.updateSelection();
    }

    // ---- Override in subclass ----
    createBackground() {
        // Subclass must implement
    }
    createContent() {
        // Subclass must implement
    }
    createSelectionFrame() {
        // Subclass can override
    }
    createHoverOverlay() {
        this._hoverOverlay = new PIXI.Graphics();
        this._hoverOverlay.beginFill(0xFFFFFF, 0);
        this._hoverOverlay.drawRect(0, 0, this._slotWidth, this._slotHeight);
        this._hoverOverlay.endFill();
        this._hoverOverlay.visible = false;
        this.addChild(this._hoverOverlay);
    }

    // ---- Shared selection ----
    setFocused(value) {
        if (this._focused === value) return;
        this._focused = value;
        if (value) this._isHovered = false;
        this.updateSelection();
    }
    setLocked(value) {
        if (this._locked === value) return;
        this._locked = value;
        this.updateSelection();
    }
    focused() { return this._focused; }
    locked() { return this._locked; }

    updateSelection() {
        // Override to show/hide selection frame
    }

    // ---- Shared hover ----
    _showHoverEffect() {
        if (this._isDestroyed || this.destroyed) return;
        if (!this._hoverOverlay || this._hoverOverlay.destroyed) this.createHoverOverlay();
        if (this._hoverOverlay) {
            this._hoverOverlay.visible = true;
            this._hoverOverlay.clear();
            this._hoverOverlay.beginFill(0xFFFFFF, 0.15);
            this._hoverOverlay.drawRect(0, 0, this._slotWidth, this._slotHeight);
            this._hoverOverlay.endFill();
        }
        if (this.scale) this.scale.set(1.02);
    }
    _hideHoverEffect() {
        if (this._isDestroyed || this.destroyed) return;
        if (this._hoverOverlay) {
            this._hoverOverlay.visible = false;
            this._hoverOverlay.clear();
        }
        if (this.scale) this.scale.set(1.0);
    }

    // ---- Mouse events (shared) ----
    _onMouseEnter() {
        if (this._focused) return;
        if (this._isDestroyed || this.destroyed) return;
        this._isHovered = true;
        this._showHoverEffect();
        for (var i = 0; i < this._hoverEnterHandlers.length; i++) {
            this._hoverEnterHandlers[i](this);
        }
    }
    _onMouseExit() {
        if (this._isDestroyed || this.destroyed) return;
        this._isHovered = false;
        this._hideHoverEffect();
        for (var i = 0; i < this._hoverExitHandlers.length; i++) {
            this._hoverExitHandlers[i](this);
        }
    }
    _onMouseDown(button, x, y) {
        if (this._locked || this._isDestroyed || this.destroyed) return;
        this._isMouseDown = true;
        this._mouseDownX = x;
        this._mouseDownY = y;
        if (this._background) this._background.alpha = 0.7;
        this._dragStartX = x;
        this._dragStartY = y;
        this._dragOffsetX = x - this.x;
        this._dragOffsetY = y - this.y;
        this._triggerEvent('clickDown', [button, x, y]);
    }
    _onMouseUp(button, x, y) {
        if (this._isDestroyed || this.destroyed) return;
        if (!this._isMouseDown) return;
        this._isMouseDown = false;
        if (this._background) this._background.alpha = 1.0;
        if (this._isDragging) {
            this._onDragEnd(x, y);
            this._isDragging = false;
            return;
        }
        var dx = x - this._mouseDownX;
        var dy = y - this._mouseDownY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 5) this._triggerEvent('click', [button, x, y]);

    }
    _onDragStart(x, y) {
        if (this._locked || !this._entry || this._isDestroyed || this.destroyed) return;
        this._isDragging = true;
        this._dragOriginalX = this.x;
        this._dragOriginalY = this.y;
        this._createDragGhost();
        if (this._background) this._background.alpha = 0.5;
        this._triggerEvent('dragStart', [x, y]);
    }
    _onDragMove(x, y) {
        if (!this._isDragging || !this._dragGhost || this._isDestroyed || this.destroyed) return;
        this._dragGhost.x = x - this._dragOffsetX;
        this._dragGhost.y = y - this._dragOffsetY;
        var targetSlot = this._findTargetSlot(x, y);
        this._highlightDropTarget(targetSlot);
        this._triggerEvent('dragMove', [x, y]);
    }
    _onDragEnd(x, y) {
        if (!this._isDragging || this._isDestroyed || this.destroyed) return;
        this._isDragging = false;
        var targetSlot = this._findTargetSlot(x, y);
        if (targetSlot && targetSlot !== this) this._swapItems(targetSlot);
        this._removeDragGhost();
        if (this._background) this._background.alpha = 1.0;
        this._clearDropHighlight();
        this._triggerEvent('dragEnd', [x, y]);
    }

    // ---- Drag ghost (shared) ----
    _createDragGhost() {
        if (this._dragGhost || this._isDestroyed || this.destroyed) return;
        this._dragGhost = new PIXI.Container();
        if (this._background && this._background.texture) {
            var ghostBg = new Sprite(this._background.texture);
            ghostBg.alpha = 0.85;
            ghostBg.x = 0;
            ghostBg.y = 0;
            ghostBg.width = this._slotWidth;
            ghostBg.height = this._slotHeight;
            this._dragGhost.addChild(ghostBg);
        }
        if (this._icon && this._icon.texture) {
            var ghostIcon = new Sprite(this._icon.texture);
            ghostIcon.x = this._icon.x || 0;
            ghostIcon.y = this._icon.y || 0;
            this._dragGhost.addChild(ghostIcon);
        }
        // Subclass can add more content (text, etc.) by overriding _onDragStart
        this._dragGhost.x = this.x;
        this._dragGhost.y = this.y;
        this._dragGhost.scale.set(1.1);
        var scene = SceneManager._scene;
        if (scene) scene.addChild(this._dragGhost);
    }
    _removeDragGhost() {
        if (this._dragGhost) {
            if (this._dragGhost.parent) this._dragGhost.parent.removeChild(this._dragGhost);
            this._dragGhost.destroy({ children: true });
            this._dragGhost = null;
        }
    }

    // ---- Target finding and swapping (shared) ----
    _findTargetSlot(x, y) {
        var scene = SceneManager._scene;
        if (!scene) return null;
        var grid = scene._grid || scene._craftGrid;
        if (!grid || !grid._slots) return null;
        for (var i = 0; i < grid._slots.length; i++) {
            var slot = grid._slots[i];
            if (slot === this || !slot.visible || slot._locked) continue;
            var bounds = this._getWorldBounds(slot);
            if (x >= bounds.x && x <= bounds.x + bounds.width &&
                y >= bounds.y && y <= bounds.y + bounds.height) return slot;
        }
        return null;
    }
    _getWorldBounds(slot) {
        var worldX = slot.x;
        var worldY = slot.y;
        var parent = slot.parent;
        while (parent && parent !== SceneManager._scene) {
            worldX += parent.x || 0;
            worldY += parent.y || 0;
            parent = parent.parent;
        }
        return { x: worldX, y: worldY, width: slot._slotWidth || 92, height: slot._slotHeight || 92 };
    }
    _highlightDropTarget(targetSlot) {
        this._clearDropHighlight();
        if (targetSlot && targetSlot !== this) {
            targetSlot._showDropHighlight();
            this._dropTarget = targetSlot;
        }
    }
    _showDropHighlight() {
        if (this._dropHighlight) return;
        this._dropHighlight = new PIXI.Graphics();
        this._dropHighlight.lineStyle(3, 0x00FF00, 0.8);
        this._dropHighlight.drawRect(0, 0, this._slotWidth, this._slotHeight);
        this._dropHighlight.alpha = 0.6;
        this.addChild(this._dropHighlight);
    }
    _clearDropHighlight() {
        if (this._dropTarget) {
            this._dropTarget._removeDropHighlight();
            this._dropTarget = null;
        }
        this._removeDropHighlight();
    }
    _removeDropHighlight() {
        if (this._dropHighlight) {
            this.removeChild(this._dropHighlight);
            this._dropHighlight.destroy();
            this._dropHighlight = null;
        }
    }
    _swapItems(targetSlot) {
        if (!this._entry || !targetSlot._entry) return;
        var myEntry = this._entry;
        var targetEntry = targetSlot._entry;
        var tempItem = myEntry.item;
        var tempAmount = myEntry.amount;
        var tempRarity = myEntry.rarity;
        myEntry.item = targetEntry.item;
        myEntry.amount = targetEntry.amount;
        myEntry.rarity = targetEntry.rarity;
        targetEntry.item = tempItem;
        targetEntry.amount = tempAmount;
        targetEntry.rarity = tempRarity;
        this.refresh();
        targetSlot.refresh();
        SoundManager.playOk();
        this._triggerEvent('swap', [targetSlot]);
        targetSlot._triggerEvent('swap', [this]);
    }

    // ---- Event helpers ----
    addClickHandler(handler) { this._clickHandlers.push(handler); }
    addHoverEnterHandler(handler) { this._hoverEnterHandlers.push(handler); }
    addHoverExitHandler(handler) { this._hoverExitHandlers.push(handler); }
    addDragStartHandler(handler) { this._dragStartHandlers.push(handler); }
    addDragMoveHandler(handler) { this._dragMoveHandlers.push(handler); }
    addDragEndHandler(handler) { this._dragEndHandlers.push(handler); }
    _triggerEvent(type, args) {
        var handlers = {
            click: this._clickHandlers,
            clickDown: this._clickDownHandlers || [],
            hoverEnter: this._hoverEnterHandlers,
            hoverExit: this._hoverExitHandlers,
            dragStart: this._dragStartHandlers,
            dragMove: this._dragMoveHandlers,
            dragEnd: this._dragEndHandlers,
            swap: this._swapHandlers || []
        };
        var list = handlers[type] || [];
        for (var i = 0; i < list.length; i++) {
            list[i].apply(null, args);
        }
    }

    // ---- Getters ----
    entry() { return this._entry; }
    item() { return this._entry ? this._entry.item : null; }
    amount() {
        if (this._isCartSlot && this._entry && this._entry.quantity !== undefined) {
            return this._entry.quantity;
        }
        return this._entry ? this._entry.amount : 0;
    }
    rarity() { return this._entry ? this._entry.rarity : 1; }
    category() { return this._entry ? this._entry.category : null; }

    // ---- Destroy ----
    destroy(options) {
        this._isDestroyed = true;
        this._removeDragGhost();
        this._clearDropHighlight();
        if (this._hoverOverlay) { this._hoverOverlay.destroy(); this._hoverOverlay = null; }
        this._clickHandlers = [];
        this._hoverEnterHandlers = [];
        this._hoverExitHandlers = [];
        this._dragStartHandlers = [];
        this._dragMoveHandlers = [];
        this._dragEndHandlers = [];
        this._swapHandlers = [];
        this._clickDownHandlers = [];
        super.destroy(options);
    }
};