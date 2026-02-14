"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Donor } from "../../lib/types";
import { updateDonorProfile } from "../../lib/services/donor";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Modal } from "../ui/modal";
import { Select } from "../ui/select";
import { useToast } from "../ui/toast";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const profileSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  phone: z.string().min(7, "Enter a valid phone number"),
  city: z.string().min(2, "City is required"),
  blood_group: z.enum(bloodGroups),
  last_donated_at: z.string().optional(),
  is_available: z.boolean(),
});

type ProfileFormInput = z.infer<typeof profileSchema>;

export function DonorProfileModal({
  open,
  onClose,
  donor,
}: {
  open: boolean;
  onClose: () => void;
  donor: Donor | null;
}) {
  const router = useRouter();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormInput>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: donor?.full_name ?? "",
      phone: donor?.phone ?? "",
      city: donor?.city ?? "",
      blood_group: (donor?.blood_group ?? "O+") as ProfileFormInput["blood_group"],
      last_donated_at: donor?.last_donated_at ? donor.last_donated_at.slice(0, 10) : "",
      is_available: donor?.is_available ?? true,
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await updateDonorProfile({
        ...values,
        last_donated_at: values.last_donated_at ? values.last_donated_at : null,
      });

      toast.success("Profile updated.");
      router.refresh();
      onClose();
      reset(values);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile.";
      toast.error(message);
    }
  });

  return (
    <Modal title="Edit donor profile" open={open} onClose={onClose}>
      <form className="space-y-4" onSubmit={submit} noValidate>
        <Input label="Full name" error={errors.full_name?.message} {...register("full_name")} />
        <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
        <Input label="City" error={errors.city?.message} {...register("city")} />

        <Select label="Blood group" error={errors.blood_group?.message} {...register("blood_group")}>
          {bloodGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </Select>

        <Input label="Last donated date" type="date" error={errors.last_donated_at?.message} {...register("last_donated_at")} />

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register("is_available")} />
          Available for emergency requests
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
