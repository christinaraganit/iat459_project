import {useEffect, useRef, useState} from "react";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { ChevronDown } from "lucide-react";

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
      <Button
        variant="secondary"
        className={
          `listing__control-button listing__dropdown-control${
            selected.length > 0 ? " is-active" : ""
          }${open ? " is-open" : ""}`
        }
        onClick={() => setOpen((o) => !o)}
      >
        <span>{selected.length > 0 ? `Condition (${selected.length})` : "Condition"}</span>
        <ChevronDown className="listing__dropdown-chevron" size={16} />
      </Button>
      
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
            <label
              key={condition}
              className="condition-filter__option"
            >
              <Input
                type="checkbox"
                className="condition-filter__checkbox"
                checked={selected.includes(condition)}
                onChange={() => toggle(condition)}
              />
              <span>{condition}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default ConditionFilter;