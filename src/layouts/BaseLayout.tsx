import React from "react";
import DragWindowRegion from "@/components/common/DragWindowRegion";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/codeview/Sidebar";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <DragWindowRegion/>
      {/* <NavigationMenu /> */}
      <div className="border-t border-gray-300"></div>
      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full min-h-0">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={40} className="min-h-0">
            <Sidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80} className="min-h-0">
            {children}
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
