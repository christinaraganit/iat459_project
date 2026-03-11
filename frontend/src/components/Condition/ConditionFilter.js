import {useEffect, useRef, useState} from "react";

const conditions = ["Mint", "Near Mint", "Lightly Played", "Played"];

function ConditionFilter({selected, setSelected}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  
  const toggle = (condition) => {
    setSelected((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    }
  }, []);
  
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen((o) => !o)}>
        Condition
      </button>
      
      {open && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          background: "white",
          border: "1px solid #ccc",
          borderRadius: 4,
          padding: "8px 12px",
          zIndex: 100,
          minWidth: 160,
        }}>
          {conditions.map((condition) => (
            <label key={condition} style={{ display: "block", padding: "4px 0" }}>
              <input
                type="checkbox"
                checked={selected.includes(condition)}
                onChange={() => toggle(condition)}
              />
              {" "}{condition}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default ConditionFilter;