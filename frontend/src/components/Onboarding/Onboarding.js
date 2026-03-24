import "./Onboarding.css";
import { useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { NameSubmission } from "./NameSubmission/NameSubmission";
export const Onboarding = () => {
  const [step, setStep] = useState(1);
  const incrementStep = () => setStep((prev) => prev + 1);
  const decrementStep = () => setStep((prev) => prev - 1);
  const authContext = useAuthContext();

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
        <article>
          <h2>Welcome to CardConnect!</h2>
        </article>
      )}
    </aside>
  );
};
