//=============================================================================
// LPAnimator.js
//=============================================================================

LOGICPULSE.Animator = {
    _animations: [],

    update: function() {
        for (var i = this._animations.length - 1; i >= 0; i--) {
            var anim = this._animations[i];
            if (!anim.target || anim.target.destroyed) {
                this._animations.splice(i, 1);
                continue;
            }
            switch (anim.type) {
                case "pulse": this._updatePulse(anim); break;
                case "bitmapSwap": this._updateBitmapSwap(anim); break;
            }
        }
    },

    pulse: function(target, options) {
        if (!target) return;
        options = options || {};
        var existing = this._animations.find(function(a) { return a.target === target && a.type === "pulse"; });
        if (existing) return;
        target.alpha = options.max || 1.0;
        this._animations.push({
            type: "pulse",
            target: target,
            min: options.min || 0.35,
            max: options.max || 1.0,
            speed: options.speed || 0.02,
            direction: -1
        });
    },

    bitmapSwap: function(target, folder, frames, options) {
        if (!target || !frames || frames.length < 2) return;
        options = options || {};
        var existing = this._animations.find(function(a) { return a.target === target && a.type === "bitmapSwap"; });
        if (existing) return;
        target.bitmap = LOGICPULSE.Assets.load(folder, frames[0]);
        this._animations.push({
            type: "bitmapSwap",
            target: target,
            folder: folder,
            frames: frames,
            frameIndex: 0,
            timer: 0,
            interval: options.interval || 30
        });
    },

    stop: function(target) {
        this._animations = this._animations.filter(function(a) { return a.target !== target; });
        if (target) target.alpha = 1.0;
    },

    clear: function() {
        for (var i = 0; i < this._animations.length; i++) {
            if (this._animations[i].target) this._animations[i].target.alpha = 1.0;
        }
        this._animations = [];
    },

    _updatePulse: function(anim) {
        anim.target.alpha += anim.speed * anim.direction;
        if (anim.target.alpha <= anim.min) {
            anim.target.alpha = anim.min;
            anim.direction = 1;
        } else if (anim.target.alpha >= anim.max) {
            anim.target.alpha = anim.max;
            anim.direction = -1;
        }
    },

    _updateBitmapSwap: function(anim) {
        anim.timer++;
        if (anim.timer < anim.interval) return;
        anim.timer = 0;
        anim.frameIndex++;
        if (anim.frameIndex >= anim.frames.length) anim.frameIndex = 0;
        anim.target.bitmap = LOGICPULSE.Assets.load(anim.folder, anim.frames[anim.frameIndex]);
    }
};

// Scene hook for Animator
(function() {
    var alias = Scene_Base.prototype.update;
    Scene_Base.prototype.update = function() {
        alias.call(this);
        LOGICPULSE.Animator.update();
    };
})();