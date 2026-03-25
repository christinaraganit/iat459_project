import "./Onboarding.css";
import { useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { NameSubmission } from "./NameSubmission/NameSubmission";
import { LocationSubmission } from "./LocationSubmission/LocationSubmission";
export const Onboarding = () => {
  const [step, setStep] = useState(1);
  const incrementStep = () => setStep((prev) => prev + 1);
  const decrementStep = () => setStep((prev) => prev - 1);
  const authContext = useAuthContext();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, []);

  return (
    <aside className="onboarding">
      {step === 1 && (
        <NameSubmission
          authContext={authContext}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      )}
      {step === 2 && (
        <LocationSubmission
          authContext={authContext}
          incrementStep={incrementStep}
          decrementStep={decrementStep}
        />
      )}
    </aside>
  );
};
