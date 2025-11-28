"use client";

import { Loader2, Check } from "lucide-react";

interface ToolInvocationArgs {
  command?: string;
  path?: string;
  new_path?: string;
}

interface ToolInvocationData {
  toolName: string;
  state: string;
  args?: ToolInvocationArgs;
  result?: unknown;
}

interface ToolInvocationProps {
  tool: ToolInvocationData;
}

function getFileName(path?: string): string {
  if (!path) return "file";
  return path.split("/").pop() || path;
}

function getMessage(tool: ToolInvocationData): { pending: string; complete: string } {
  const args = tool.args || {};
  const fileName = getFileName(args.path);

  if (tool.toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return {
          pending: `Writing ${fileName}...`,
          complete: `Wrote ${fileName}`,
        };
      case "view":
        return {
          pending: `Reading ${fileName}...`,
          complete: `Read ${fileName}`,
        };
      case "str_replace":
      case "insert":
        return {
          pending: `Editing ${fileName}...`,
          complete: `Edited ${fileName}`,
        };
      default:
        return {
          pending: `Working on ${fileName}...`,
          complete: `Updated ${fileName}`,
        };
    }
  }

  if (tool.toolName === "file_manager") {
    const newFileName = getFileName(args.new_path);
    switch (args.command) {
      case "rename":
        return {
          pending: `Renaming file...`,
          complete: `Renamed to ${newFileName}`,
        };
      case "delete":
        return {
          pending: `Removing file...`,
          complete: `Removed file`,
        };
      default:
        return {
          pending: `Processing file...`,
          complete: `Done`,
        };
    }
  }

  return {
    pending: `Working...`,
    complete: `Done`,
  };
}

export function ToolInvocation({ tool }: ToolInvocationProps) {
  const messages = getMessage(tool);
  const isComplete = tool.state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <Check className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">
        {isComplete ? messages.complete : messages.pending}
      </span>
    </div>
  );
}
