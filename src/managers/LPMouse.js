//=============================================================================
// LPMouse.js
//=============================================================================

LOGICPULSE.Mouse = {
    _x: 0,
    _y: 0,
    _hoveredElement: null,
    _pressedElement: null,
    _draggedElement: null,
    _dragOffsetX: 0,
    _dragOffsetY: 0,
    _mouseDownX: 0,
    _mouseDownY: 0,
    _clickThreshold: 5,
    _isDragging: false,
    _initialized: false,
    _wheelDelta: 0,
    _pendingUse: false,

    initialize: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('[LOGICPULSE.Mouse] Initialized (Core)');

        document.addEventListener('contextmenu', function(e) { e.preventDefault(); });

        this._patchTouchInput();
        document.addEventListener('wheel', this._onWheel.bind(this), { passive: true });
        document.addEventListener('mousedown', this._onMouseDown.bind(this));
        document.addEventListener('mouseup', this._onMouseUp.bind(this));
    },

    _patchTouchInput: function() {
        var originalUpdate = TouchInput.update;
        var self = this;
        TouchInput.update = function() {
            originalUpdate.call(this);
            self._updateFromTouchInput();
        };
    },

    _updateFromTouchInput: function() {
        this._x = TouchInput.x;
        this._y = TouchInput.y;
        this._processHover();
    },

    _onWheel: function(e) {
        this._wheelDelta = e.deltaY > 0 ? 1 : -1;
        this._processScroll();
    },

    _onMouseDown: function(e) {
        var buttonMap = { 0: 'left', 1: 'middle', 2: 'right' };
        var button = buttonMap[e.button];
        if (!button) return;
        this._mouseDownX = this._x;
        this._mouseDownY = this._y;
        this._isDragging = false;
        this._processClickDown(button);
    },

    _onMouseUp: function(e) {
        var buttonMap = { 0: 'left', 1: 'middle', 2: 'right' };
        var button = buttonMap[e.button];
        if (!button) return;
        this._processClickUp(button);
        if (this._isDragging && this._draggedElement) {
            this._endDrag();
        }
        this._isDragging = false;
        this._draggedElement = null;
        this._pendingUse = false;
    },

    _processHover: function() {
        if (!SceneManager || !SceneManager._scene) return;
        var scene = SceneManager._scene;
        if (scene._filterMenu && scene._filterMenu._visible) return;

        var grids = this._getGrids(scene);
        var slot = null;
        for (var g = 0; g < grids.length; g++) {
            var grid = grids[g];
            if (!grid || typeof grid.getSlotAt !== 'function') continue;
            slot = grid.getSlotAt(this._x, this._y);
            if (slot) break;
        }

        if (slot !== this._hoveredElement) {
            if (this._hoveredElement && this._hoveredElement._onMouseExit) {
                this._hoveredElement._onMouseExit();
            }
            this._hoveredElement = slot;
            if (this._hoveredElement && this._hoveredElement._onMouseEnter) {
                this._hoveredElement._onMouseEnter();
            }
        }
    },

    _getGrids: function(scene) {
        var grids = [];
        if (scene._grid) grids.push(scene._grid);
        if (scene._craftGrid) grids.push(scene._craftGrid);
        if (scene._shoppingCart && scene._shoppingCart.getGrid) {
            var cartGrid = scene._shoppingCart.getGrid();
            if (cartGrid) grids.push(cartGrid);
        }
        return grids;
    },

    _processClickDown: function(button) {
        if (!SceneManager || !SceneManager._scene) return;
        var scene = SceneManager._scene;
        if (scene._filterMenu && scene._filterMenu._visible) return;

        var grids = this._getGrids(scene);
        var slot = this._hoveredElement;
        var activeGrid = null;
        var gridType = null;

        for (var g = 0; g < grids.length; g++) {
            var grid = grids[g];
            if (!grid) continue;
            if (grid._slots && grid._slots.indexOf(slot) !== -1) {
                activeGrid = grid;
                if (grid === scene._grid) gridType = 'grid';
                else if (grid === (scene._shoppingCart && scene._shoppingCart.getGrid())) gridType = 'cart';
                else if (grid === scene._craftGrid) gridType = 'craft';
                break;
            }
        }
        if (!activeGrid || !slot) return;

        if (gridType && scene._controller && scene._controller._focus !== gridType && scene._controller._applyFocus) {
            scene._controller._applyFocus(gridType);
        }

        this._pressedElement = slot;
        var index = activeGrid._slots.indexOf(slot);
        if (index < 0) return;

        var currentSelected = activeGrid.selectedIndex();

        if (button === 'left') {
            if (currentSelected === index) {
                this._pendingUse = true;
            } else {
                this._pendingUse = false;
                activeGrid.setSelectedIndex(index);
                if (scene._controller && scene._controller.onSelectionChanged) {
                    scene._controller.onSelectionChanged();
                }
                this._draggedElement = slot;
                this._dragOffsetX = this._x - slot.x;
                this._dragOffsetY = this._y - slot.y;
                this._isDragging = false;
            }
        } else {
            this._pendingUse = false;
            activeGrid.setSelectedIndex(index);
            if (scene._controller && scene._controller.onSelectionChanged) {
                scene._controller.onSelectionChanged();
            }
        }

        if (slot._onMouseDown) {
            slot._onMouseDown(button, this._x, this._y);
        }
    },

    _processClickUp: function(button) {
        if (!SceneManager || !SceneManager._scene) return;
        var scene = SceneManager._scene;
        if (scene._filterMenu && scene._filterMenu._visible) {
            if (button === 'right') {
                scene._filterMenu._applyAndClose();
                this._pressedElement = null;
                this._pendingUse = false;
                return;
            }
        }

        var slot = this._hoveredElement;
        if (!slot) return;

        var dx = this._x - this._mouseDownX;
        var dy = this._y - this._mouseDownY;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this._clickThreshold && slot === this._pressedElement) {
            if (button === 'left' && this._pendingUse) {
                this._handleUseItem(slot);
                this._pendingUse = false;
            } else if (button === 'left') {
                if (scene._controller && scene._controller.onSelectionChanged) {
                    scene._controller.onSelectionChanged();
                }
            } else if (button === 'right') {
                if (scene._shoppingCart) {
                    var cartGrid = scene._shoppingCart.getGrid();
                    if (cartGrid) {
                        var slotIndex = cartGrid._slots.indexOf(slot);
                        if (slotIndex !== -1) {
                            var entry = slot.entry();
                            if (entry) {
                                LOGICPULSE.ShopProvider && LOGICPULSE.ShopProvider.removeFromCart && LOGICPULSE.ShopProvider.removeFromCart(entry.item, 1);
                                if (scene.onCartUpdated) scene.onCartUpdated();
                                SoundManager.playCancel();
                            }
                        }
                    }
                }
                if (scene._controller && scene._controller.onSelectionChanged) {
                    scene._controller.onSelectionChanged();
                }
            }
        }

        this._pressedElement = null;
        if (button === 'left' && this._pendingUse) {
            this._pendingUse = false;
        }
    },

    _handleUseItem: function(slot) {
        var scene = SceneManager._scene;
        if (scene && scene._controller && scene._controller._onConfirm) {
            scene._controller._onConfirm();
        }
    },

    _processDrag: function() {
        var dx = this._x - this._mouseDownX;
        var dy = this._y - this._mouseDownY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > this._clickThreshold && !this._isDragging) {
            this._isDragging = true;
            this._onDragStart();
        }
        if (this._isDragging && this._draggedElement) {
            this._onDragMove();
        }
    },

    _onDragStart: function() {
        if (this._draggedElement && this._draggedElement._onDragStart) {
            this._draggedElement._onDragStart(this._x, this._y);
        }
    },

    _onDragMove: function() {
        if (this._draggedElement && this._draggedElement._onDragMove) {
            this._draggedElement._onDragMove(this._x, this._y);
        }
    },

    _endDrag: function() {
        if (this._draggedElement && this._draggedElement._onDragEnd) {
            this._draggedElement._onDragEnd(this._x, this._y);
        }
    },

    _processScroll: function() {
        if (!SceneManager || !SceneManager._scene) return;
        var scene = SceneManager._scene;

        var descText = this._getDescriptionText(scene);
        if (descText && this._isOverDescription(descText)) {
            if (this._scrollDescription(descText, this._wheelDelta)) {
                this._wheelDelta = 0;
                return;
            }
        }

        var grid = scene._grid || scene._craftGrid;
        if (!grid || !grid._layout) return;
        var columns = grid._layout.columns;
        if (this._wheelDelta > 0) {
            for (var i = 0; i < columns; i++) grid.moveDown();
        } else if (this._wheelDelta < 0) {
            for (var j = 0; j < columns; j++) grid.moveUp();
        }
        if (scene._controller && scene._controller.onSelectionChanged) {
            scene._controller.onSelectionChanged();
        }
        this._wheelDelta = 0;
    },

    _getDescriptionText: function(scene) {
        if (scene._descriptionText && scene._descriptionText._textSprite) return scene._descriptionText;
        if (scene._showcase && scene._showcase._descriptionText) return scene._showcase._descriptionText;
        return null;
    },

    _isOverDescription: function(desc) {
        if (!desc) return false;
        var wx = desc.x, wy = desc.y;
        var p = desc.parent;
        while (p && p !== SceneManager._scene) {
            wx += p.x || 0;
            wy += p.y || 0;
            p = p.parent;
        }
        var w = desc._width || 288;
        var h = desc._height || 160;
        return this._x >= wx && this._x <= wx + w && this._y >= wy && this._y <= wy + h;
    },

    _scrollDescription: function(desc, delta) {
        if (!desc || typeof desc.scroll !== 'function') return false;
        desc.scroll(delta * 20);
        return desc.canScroll ? desc.canScroll() : true;
    },

    x: function() { return this._x; },
    y: function() { return this._y; },
    position: function() { return { x: this._x, y: this._y }; },
    getHoveredElement: function() { return this._hoveredElement; },

    isTriggered: function() { return TouchInput.isTriggered(); },
    isPressed: function() { return TouchInput.isPressed(); },
    isReleased: function() { return TouchInput.isReleased(); },
    isRepeated: function() { return TouchInput.isRepeated(); },

    update: function() {
        if (this._isDragging && this._draggedElement) {
            this._processDrag();
        }
    }
};
