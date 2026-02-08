"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"donor" | "hospital">("donor");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await signup(email, password, selectedRole);
      console.log("Signup complete, role:", r);
      if (selectedRole === "donor") router.push("/donor/dashboard");
      else if (selectedRole === "hospital") router.push("/hospital/dashboard");
      else router.push("/");
    } catch (err: any) {
      console.error("Signup failed:", err);
      setErrorMsg(err?.message || String(err));
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Sign up</h2>
      {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}
      <form onSubmit={handle} className="flex flex-col gap-3">
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <label className="block">
          <div className="text-sm mb-1">Role</div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as any)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="donor">Donor</option>
            <option value="hospital">Hospital</option>
          </select>
        </label>
        <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2">
          Create account
        </button>
      </form>
    </div>
  );
}
