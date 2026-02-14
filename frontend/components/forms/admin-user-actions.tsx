"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteUserProfile, setUserSuspension } from "../../lib/services/admin";
import { Button } from "../ui/button";
import { useToast } from "../ui/toast";

export function AdminUserActions({
  userId,
  email,
  isSuspended,
}: {
  userId: string;
  email: string;
  isSuspended: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState<"suspend" | "delete" | null>(null);

  const toggleSuspend = async () => {
    try {
      setLoading("suspend");
      await setUserSuspension(userId, !isSuspended);
      toast.success(isSuspended ? "User reactivated." : "User suspended.");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update user.";
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  const deleteUser = async () => {
    const confirmed = window.confirm(`Delete profile for ${email}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      setLoading("delete");
      await deleteUserProfile(userId);
      toast.success("User profile deleted.");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete user.";
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" onClick={toggleSuspend} disabled={loading !== null}>
        {loading === "suspend" ? "Saving..." : isSuspended ? "Unsuspend" : "Suspend"}
      </Button>
      <Button size="sm" variant="danger" onClick={deleteUser} disabled={loading !== null}>
        {loading === "delete" ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}
