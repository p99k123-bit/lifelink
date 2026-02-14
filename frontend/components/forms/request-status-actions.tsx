"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RequestStatus } from "../../lib/types";
import { updateEmergencyRequestStatus } from "../../lib/services/hospital";
import { Button } from "../ui/button";
import { useToast } from "../ui/toast";

export function RequestStatusActions({ requestId, status }: { requestId: string; status: RequestStatus }) {
  const [loadingState, setLoadingState] = useState<RequestStatus | null>(null);
  const toast = useToast();
  const router = useRouter();

  const updateStatus = async (nextStatus: RequestStatus) => {
    try {
      setLoadingState(nextStatus);
      await updateEmergencyRequestStatus(requestId, nextStatus);
      toast.success(`Request marked as ${nextStatus}.`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update request.";
      toast.error(message);
    } finally {
      setLoadingState(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="secondary"
        disabled={status === "fulfilled" || loadingState !== null}
        onClick={() => updateStatus("fulfilled")}
      >
        {loadingState === "fulfilled" ? "Saving..." : "Mark fulfilled"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={status === "cancelled" || loadingState !== null}
        onClick={() => updateStatus("cancelled")}
      >
        {loadingState === "cancelled" ? "Saving..." : "Cancel"}
      </Button>
    </div>
  );
}
