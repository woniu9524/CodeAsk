import React from "react";
import DragWindowRegion from "@/components/DragWindowRegion";
import { Toaster } from "@/components/ui/sonner";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DragWindowRegion/>
      {/* <NavigationMenu /> */}
      <main className="h-screen  pb-12 p-2 ">{children}</main>
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
