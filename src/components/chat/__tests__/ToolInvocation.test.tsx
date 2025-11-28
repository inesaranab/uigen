import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocation } from "../ToolInvocation";

afterEach(() => {
  cleanup();
});

test("shows 'Writing' message when creating a file", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "str_replace_editor",
        state: "pending",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );

  expect(screen.getByText("Writing App.jsx...")).toBeDefined();
});

test("shows 'Wrote' message when file creation is complete", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );

  expect(screen.getByText("Wrote App.jsx")).toBeDefined();
});

test("shows 'Editing' message when editing a file", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "str_replace_editor",
        state: "pending",
        args: { command: "str_replace", path: "/components/Button.tsx" },
      }}
    />
  );

  expect(screen.getByText("Editing Button.tsx...")).toBeDefined();
});

test("shows 'Edited' message when file edit is complete", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "str_replace", path: "/components/Button.tsx" },
      }}
    />
  );

  expect(screen.getByText("Edited Button.tsx")).toBeDefined();
});

test("shows 'Reading' message when viewing a file", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "str_replace_editor",
        state: "pending",
        args: { command: "view", path: "/index.js" },
      }}
    />
  );

  expect(screen.getByText("Reading index.js...")).toBeDefined();
});

test("shows 'Read' message when file view is complete", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "view", path: "/index.js" },
      }}
    />
  );

  expect(screen.getByText("Read index.js")).toBeDefined();
});

test("shows 'Editing' message for insert command", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "str_replace_editor",
        state: "pending",
        args: { command: "insert", path: "/utils.ts" },
      }}
    />
  );

  expect(screen.getByText("Editing utils.ts...")).toBeDefined();
});

test("shows 'Renaming' message for rename command", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "file_manager",
        state: "pending",
        args: { command: "rename", path: "/old.js", new_path: "/new.js" },
      }}
    />
  );

  expect(screen.getByText("Renaming file...")).toBeDefined();
});

test("shows 'Renamed to' message when rename is complete", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "file_manager",
        state: "result",
        args: { command: "rename", path: "/old.js", new_path: "/new.js" },
      }}
    />
  );

  expect(screen.getByText("Renamed to new.js")).toBeDefined();
});

test("shows 'Removing' message for delete command", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "file_manager",
        state: "pending",
        args: { command: "delete", path: "/temp.js" },
      }}
    />
  );

  expect(screen.getByText("Removing file...")).toBeDefined();
});

test("shows 'Removed' message when delete is complete", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "file_manager",
        state: "result",
        args: { command: "delete", path: "/temp.js" },
      }}
    />
  );

  expect(screen.getByText("Removed file")).toBeDefined();
});

test("shows spinner icon when state is pending", () => {
  const { container } = render(
    <ToolInvocation
      tool={{
        toolName: "str_replace_editor",
        state: "pending",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );

  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeDefined();
});

test("shows checkmark icon when state is result", () => {
  const { container } = render(
    <ToolInvocation
      tool={{
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );

  const checkmark = container.querySelector(".text-emerald-600");
  expect(checkmark).toBeDefined();
});

test("handles missing args gracefully", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "str_replace_editor",
        state: "pending",
      }}
    />
  );

  expect(screen.getByText("Working on file...")).toBeDefined();
});

test("handles unknown tool name gracefully", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "unknown_tool",
        state: "pending",
      }}
    />
  );

  expect(screen.getByText("Working...")).toBeDefined();
});

test("handles unknown tool name completion gracefully", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "unknown_tool",
        state: "result",
      }}
    />
  );

  expect(screen.getByText("Done")).toBeDefined();
});

test("extracts filename from nested path", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create", path: "/src/components/ui/Button.tsx" },
      }}
    />
  );

  expect(screen.getByText("Wrote Button.tsx")).toBeDefined();
});
