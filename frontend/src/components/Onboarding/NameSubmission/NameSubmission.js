import { useState } from "react";
import { Button } from "../../Button/Button";
export const NameSubmission = ({
  authContext,
  incrementStep,
  decrementStep,
}) => {
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
        updateDisplayName(prospectiveDisplayName);
        reassignToken(data.token);

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
        <Button variant="primary" className="onboarding__continue" type="submit">
          Continue
        </Button>
      </form>
    </article>
  );
};
