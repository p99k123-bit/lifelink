"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createEmergencyRequest } from "../../lib/services/hospital";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Modal } from "../ui/modal";
import { Select } from "../ui/select";
import { useToast } from "../ui/toast";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const requestSchema = z.object({
  blood_group: z.enum(bloodGroups),
  units: z.coerce.number().min(1, "Units must be at least 1").max(20, "Units must be 20 or less"),
  city: z.string().min(2, "City is required"),
  urgency_level: z.enum(["low", "medium", "critical"]),
  notes: z.string().max(240, "Notes can be up to 240 characters").optional(),
});

type RequestFormInput = z.infer<typeof requestSchema>;

export function EmergencyRequestForm() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormInput>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      blood_group: "O+",
      units: 1,
      city: "",
      urgency_level: "medium",
      notes: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createEmergencyRequest(values);
      toast.success("Emergency request created.");
      reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create request.";
      toast.error(message);
    }
  });

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create emergency request</Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Create emergency request">
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Blood group" error={errors.blood_group?.message} {...register("blood_group")}>
              {bloodGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </Select>
            <Input label="Units" type="number" min={1} max={20} error={errors.units?.message} {...register("units")} />
          </div>

          <Input label="City" error={errors.city?.message} {...register("city")} />

          <Select label="Urgency" error={errors.urgency_level?.message} {...register("urgency_level")}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="critical">Critical</option>
          </Select>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Notes</span>
            <textarea
              className="min-h-[100px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
              maxLength={240}
              {...register("notes")}
            />
            {errors.notes?.message ? <span className="text-xs text-red-600">{errors.notes.message}</span> : null}
          </label>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create request"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
