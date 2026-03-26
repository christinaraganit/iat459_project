import { useState, useEffect, Fragment } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../../Button/Button";
import { Input } from "../../Input/Input";
import { Pencil } from "lucide-react";
export const NameField = () => {
  const { user, updateDisplayName, token, reassignToken } = useAuthContext();
  const [editing, setEditing] = useState(false);
  const [prospectiveDisplayName, setProspectiveDisplayName] = useState(
    user?.displayName || user?.username,
  );

  useEffect(() => {
    setProspectiveDisplayName(user?.displayName || user?.username);
  }, [user]);

  const rename = useMutation({
    mutationFn: async (newName) => {
      const res = await fetch("http://localhost:5000/api/account/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({
          displayName: newName,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to rename user");
      }

      const data = await res.json();
      return data;
    },
    onSuccess: (data) => {
      updateDisplayName(prospectiveDisplayName);
      reassignToken(data.token);
      setEditing(false);
    },
    onError: (err) => {
      console.error("Rename failed:", err);
    },
  });

  const handleRename = async (e) => {
    e.preventDefault();
    rename.mutate(prospectiveDisplayName);
  };

  return (
    <span>
      {editing ? (
        <>
          <Input
            type="text"
            value={prospectiveDisplayName}
            onChange={(e) => setProspectiveDisplayName(e.target.value)}
          />
          <Button
            variant="primary"
            className="namefield__save"
            onClick={handleRename}
          >
            Save
          </Button>
        </>
      ) : (
        <>
          {user?.displayName || user?.username}
          <Button
            variant="tertiary"
            className="namefield__edit"
            onClick={() => setEditing(true)}
          >
            <Pencil />
          </Button>
        </>
      )}
    </span>
  );
};
