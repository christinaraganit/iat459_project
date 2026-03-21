import "./Onboarding.css";
import { useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
export const Onboarding = () => {
  const { user, token } = useAuthContext();
  const [prospectiveDisplayName, setProspectiveDisplayName] = useState("");
  const handleRename = async (e) => {
    e.preventDefault();
    console.log("Attempting to rename user to:", prospectiveDisplayName);

    try {
      const res = await fetch("http://localhost:5000/api/account/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({
          displayName: prospectiveDisplayName,
        }),
      });

      const data = await res.json();
      console.log("Rename response:", data);
    } catch (er) {
      console.error("Rename failed:", er);
    }
  };
  useEffect(() => {
    console.log(prospectiveDisplayName);
  }, [prospectiveDisplayName]);
  return (
    <article className="onboarding">
      <h2>What's your name?</h2>
      <form onSubmit={handleRename} className="onboarding__content">
        <input
          placeholder={user.username}
          onChange={(e) => setProspectiveDisplayName(e.target.value)}
        ></input>
        <button>Continue</button>
      </form>
    </article>
  );
};
