"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { supabase } from "../../../lib/supabaseClient"
import Input from "../../../components/Input"
import Button from "../../../components/Button"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["donor", "hospital", "admin"]).optional(),
})
type Form = z.infer<typeof schema>

export default function SignupPage() {
  const { register, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: "donor" },
  })

  const onSubmit = async (vals: Form) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: vals.email,
        password: vals.password,
      })

      if (error) throw error

      const user = data.user
      if (!user) return

      // insert role into profiles table
      await supabase.from("profiles").insert({
        id: user.id,
        role: vals.role ?? "donor",
      })
    } catch (err) {
      console.error("Signup failed:", err)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Sign up</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <Input label="Email" {...register("email")} />
        <Input label="Password" type="password" {...register("password")} />

        <label className="block">
          <div className="text-sm mb-1">Role</div>
          <select
            {...register("role")}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="donor">Donor</option>
            <option value="hospital">Hospital</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <Button type="submit">Create account</Button>
      </form>
    </div>
  )
}
