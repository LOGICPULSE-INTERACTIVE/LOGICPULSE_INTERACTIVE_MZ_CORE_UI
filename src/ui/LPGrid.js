//=============================================================================
// LPGrid.js (Base – to be extended)
//=============================================================================

LOGICPULSE.UI.BaseGrid = class extends LOGICPULSE.UI.Element {
    constructor(layout, options) {
        super();
        options = options || {};
        this._layout = layout;
        this._provider = options.provider || function() { return []; };
        this._category = LOGICPULSE.Constants.Category ? LOGICPULSE.Constants.Category.Consumable : "consumable";
        this._selectedIndex = 0;
        this._scrollRow = 0;
        this._visibleRows = Math.floor(this._layout.rect.height / this._layout.spacingY);
        this._scrollTargetY = 0;
        this._slots = [];
        this._isCartGrid = options.isCartGrid || false;
        this._isFocused = true;
        this.create();
    }

    create() {
        this.createMask();
        this.createViewport();
    }

    createMask() {
        var mask = this._layout.mask;
        this._maskGraphic = new PIXI.Graphics();
        this._maskGraphic.beginFill(0xffffff);
        this._maskGraphic.drawRect(mask.x, mask.y, mask.width, mask.height);
        this._maskGraphic.endFill();
        this.addChild(this._maskGraphic);
        this.mask = this._maskGraphic;
    }

    createViewport() {
        this._viewport = new PIXI.Container();
        this.addChild(this._viewport);
        this.createLayers();
    }

    createLayers() {
        this._slotLayer = new PIXI.Container();
        this._iconLayer = new PIXI.Container();
        this._cursorLayer = new PIXI.Container();
        this._viewport.addChild(this._slotLayer);
        this._viewport.addChild(this._iconLayer);
        this._viewport.addChild(this._cursorLayer);
        this.buildGrid();
    }

    buildGrid() {
        this.clearSlots();
        this.buildSlots();
        this.updateViewport();
        this.setSelectedIndex(this._selectedIndex);
    }

    clearSlots() {
        var children = this._slotLayer.removeChildren();
        for (var i = 0; i < children.length; i++) {
            children[i].destroy();
        }
        this._slots = [];
    }

    // ---- Override in subclass ----
    buildSlots() {
        var items = this.items();
        var slotWidth = this._layout.itemWidth || this._layout.itemSize || 92;
        var slotHeight = this._layout.itemHeight || this._layout.itemSize || 92;
        for (var index = 0; index < items.length; index++) {
            var position = this.slotPosition(index);
            var slot = this.createSlot({
                x: position.x,
                y: position.y,
                entry: items[index],
                isCartSlot: this._isCartGrid,
                width: slotWidth,
                height: slotHeight
            });
            this._slotLayer.addChild(slot);
            this._slots.push(slot);
        }
    }

    createSlot(options) {
        // Subclass must override to return a slot instance (extending BaseGridSlot)
        return new LOGICPULSE.UI.BaseGridSlot(options);
    }

    slotPosition(index) {
        var layout = this._layout;
        return {
            x: layout.rect.x + ((index % layout.columns) * layout.spacingX),
            y: layout.rect.y + (Math.floor(index / layout.columns) * layout.spacingY)
        };
    }

    setCategory(category) {
        this._category = category;
        this._selectedIndex = 0;
        this._scrollRow = 0;
        this._scrollTargetY = 0;
        if (this._viewport) this._viewport.y = 0;
        this.buildGrid();
    }

    category() { return this._category; }
    items() { return this._provider(this); }
    selectedIndex() { return this._selectedIndex; }

    setSelectedIndex(index) {
        var max = this.items().length - 1;
        if (max < 0) {
            this._selectedIndex = -1;
            this.updateSelection();
            return;
        }
        this._selectedIndex = Math.max(0, Math.min(index, max));
        this.updateSelection();
    }

    selectedEntry() {
        if (this._selectedIndex < 0) return null;
        return this.items()[this._selectedIndex] || null;
    }

    moveLeft() { this.setSelectedIndex(this._selectedIndex - 1); }
    moveRight() { this.setSelectedIndex(this._selectedIndex + 1); }
    moveUp() { this.setSelectedIndex(this._selectedIndex - this._layout.columns); }
    moveDown() { this.setSelectedIndex(this._selectedIndex + this._layout.columns); }

    updateSelection() {
        if (!this._slots) return;
        for (var i = 0; i < this._slots.length; i++) {
            var isSlotFocused = (i === this._selectedIndex) && this._isFocused;
            this._slots[i].setFocused(isSlotFocused);
        }
        this.updateViewport();
    }

    setFocus(value) {
        this._isFocused = value;
        this.updateSelection();
    }

    updateViewport() {
        if (this._selectedIndex < 0) return;
        var row = Math.floor(this._selectedIndex / this._layout.columns);
        var totalRows = Math.max(1, Math.ceil(this.items().length / this._layout.columns));
        var maxScrollRow = Math.max(0, totalRows - this._visibleRows);
        if (row < this._scrollRow) {
            this._scrollRow = row;
        } else if (row >= this._scrollRow + this._visibleRows) {
            this._scrollRow = row - this._visibleRows + 1;
        }
        this._scrollRow = Math.max(0, Math.min(this._scrollRow, maxScrollRow));
        this._scrollTargetY = -(this._scrollRow * this._layout.spacingY);
    }

    update() {
        var speed = 0.18;
        if (Math.abs(this._viewport.y - this._scrollTargetY) < 0.5) {
            this._viewport.y = this._scrollTargetY;
        } else {
            this._viewport.y += (this._scrollTargetY - this._viewport.y) * speed;
        }
    }

    getSlotAt(worldX, worldY) {
        var gridWorldX = this.x;
        var gridWorldY = this.y;
        var parent = this.parent;
        while (parent && parent !== SceneManager._scene) {
            gridWorldX += parent.x || 0;
            gridWorldY += parent.y || 0;
            parent = parent.parent;
        }
        var viewportX = gridWorldX;
        var viewportY = gridWorldY + this._viewport.y;
        for (var i = 0; i < this._slots.length; i++) {
            var slot = this._slots[i];
            if (!slot || !slot.visible) continue;
            var slotWorldX = viewportX + slot.x;
            var slotWorldY = viewportY + slot.y;
            if (worldX >= slotWorldX && worldX <= slotWorldX + slot._slotWidth &&
                worldY >= slotWorldY && worldY <= slotWorldY + slot._slotHeight) {
                return slot;
            }
        }
        return null;
    }

    setSelectedSlot(slot) {
        if (!slot) return;
        var index = this._slots.indexOf(slot);
        if (index >= 0) {
            this.setSelectedIndex(index);
        }
    }

    destroy(options) {
        this.clearSlots();
        this._viewport = null;
        this._maskGraphic = null;
        super.destroy(options);
    }
};