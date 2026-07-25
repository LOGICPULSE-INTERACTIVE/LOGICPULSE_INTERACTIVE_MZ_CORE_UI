//=============================================================================
// LPInput.js
//=============================================================================

LOGICPULSE.Input = {
    isTriggered: function(binding) {
        if (!binding) return false;
        if (binding.modifier && !Input.isPressed(binding.modifier)) return false;
        return Input.isTriggered(binding.key);
    },
    isRepeated: function(binding) {
        if (!binding) return false;
        if (binding.modifier && !Input.isPressed(binding.modifier)) return false;
        return Input.isRepeated(binding.key);
    },
    isPressed: function(binding) {
        if (!binding) return false;
        if (binding.modifier && !Input.isPressed(binding.modifier)) return false;
        return Input.isPressed(binding.key);
    },
    key: function(binding) { return binding ? binding.key : ""; },
    name: function(binding) { return binding ? binding.name : ""; }
};