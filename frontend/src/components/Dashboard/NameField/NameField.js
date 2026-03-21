import { useState, Fragment } from "react";
import { useAuthContext } from "../../../context/AuthContext";
export const NameField = () => {
  const { user, updateDisplayName, token } = useAuthContext();
  const [editing, setEditing] = useState(false);
  const [prospectiveDisplayName, setProspectiveDisplayName] = useState(
    user?.displayName || user?.username || "",
  );

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
      if (res.ok) {
        alert("Name updated successfully!");
        updateDisplayName(prospectiveDisplayName);
        setEditing(false);
      }
    } catch (er) {
      console.error("Rename failed:", er);
    }
  };

  return (
    <span>
      {editing ? (
        <>
          <input
            type="text"
            value={prospectiveDisplayName}
            onChange={(e) => setProspectiveDisplayName(e.target.value)}
          />
          <button onClick={handleRename}>Save</button>
        </>
      ) : (
        <>
          {user?.displayName || user?.username}
          <button onClick={() => setEditing(true)}>Edit</button>
        </>
      )}
    </span>
  );
};
