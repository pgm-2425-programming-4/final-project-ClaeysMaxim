import { useState } from "react";

function ToggleSlider({ checked, onChange, disabled = false, size = "small" }) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    
    if (disabled || isToggling) return;
    
    setIsToggling(true);
    try {
      await onChange(!checked);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      type="button"
      className={`toggle-slider ${size === 'small' ? 'toggle-slider--small' : ''} ${checked ? 'toggle-slider--active' : ''} ${disabled || isToggling ? 'toggle-slider--disabled' : ''}`}
      onClick={handleToggle}
      disabled={disabled || isToggling}
      title={checked ? "Deactivate project" : "Activate project"}
    >
      <span className="toggle-slider__track">
        <span className="toggle-slider__thumb"></span>
      </span>
    </button>
  );
}

export default ToggleSlider;
