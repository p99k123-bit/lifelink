"use client";
import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: 20 }}>
      <h1>404</h1>
      <p>This page could not be found.</p>
      <Link href="/">Go home</Link>
    </div>
  );
}
