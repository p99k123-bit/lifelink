"use client";

import { useState } from "react";
import type { Donor } from "../../lib/types";
import { Button } from "../ui/button";
import { DonorProfileModal } from "./donor-profile-modal";

export function DonorProfileEditor({ donor }: { donor: Donor | null }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Edit profile
      </Button>
      <DonorProfileModal open={open} onClose={() => setOpen(false)} donor={donor} />
    </>
  );
}
