import "./Onboarding.css";
import { useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
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
    </aside>
  );
};

const NameSubmission = ({ authContext, incrementStep, decrementStep }) => {
  const { token, user, reassignToken, activateNewUser, updateDisplayName } =
    authContext;
  const [prospectiveDisplayName, setProspectiveDisplayName] = useState("");
  const handleRename = async (e) => {
    e.preventDefault();

    const formattedFallbackName =
      user.username.charAt(0).toUpperCase() + user?.username.slice(1);

    try {
      const res = await fetch("http://localhost:5000/api/account/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({
          displayName:
            prospectiveDisplayName === ""
              ? formattedFallbackName
              : prospectiveDisplayName,
        }),
      });

      const data = await res.json();
      console.log("Rename response:", data);
      if (res.ok) {
        alert("Name updated successfully!");
        updateDisplayName(prospectiveDisplayName);
        reassignToken(data.token);
        activateNewUser();
        incrementStep();
      }
    } catch (er) {
      console.error("Rename failed:", er);
    }
  };

  return (
    <article>
      <h2>What's your name?</h2>
      <form onSubmit={handleRename} className="onboarding__content">
        <input
          placeholder={
            user
              ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
              : ""
          }
          value={prospectiveDisplayName}
          onChange={(e) => setProspectiveDisplayName(e.target.value)}
        ></input>
        <button>Continue</button>
      </form>
    </article>
  );
};
