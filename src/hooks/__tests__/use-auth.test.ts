import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useAuth } from "@/hooks/use-auth";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should return isLoading as false initially", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
    });

    it("should return signIn and signUp functions", () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.signIn).toBe("function");
      expect(typeof result.current.signUp).toBe("function");
    });
  });

  describe("signIn", () => {
    it("should set isLoading to true during sign in", async () => {
      let resolveSignIn: (value: { success: boolean }) => void;
      (signInAction as Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSignIn = resolve;
          })
      );
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue([{ id: "project-1" }]);

      const { result } = renderHook(() => useAuth());

      let signInPromise: Promise<unknown>;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password123");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveSignIn!({ success: true });
        await signInPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should return the result from signInAction", async () => {
      const expectedResult = { success: true };
      (signInAction as Mock).mockResolvedValue(expectedResult);
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue([{ id: "project-1" }]);

      const { result } = renderHook(() => useAuth());

      let signInResult: unknown;
      await act(async () => {
        signInResult = await result.current.signIn(
          "test@example.com",
          "password123"
        );
      });

      expect(signInResult).toEqual(expectedResult);
    });

    it("should return error result on failed sign in", async () => {
      const expectedResult = { success: false, error: "Invalid credentials" };
      (signInAction as Mock).mockResolvedValue(expectedResult);

      const { result } = renderHook(() => useAuth());

      let signInResult: unknown;
      await act(async () => {
        signInResult = await result.current.signIn(
          "test@example.com",
          "wrongpassword"
        );
      });

      expect(signInResult).toEqual(expectedResult);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should set isLoading to false after failed sign in", async () => {
      (signInAction as Mock).mockResolvedValue({
        success: false,
        error: "Invalid credentials",
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "wrongpassword");
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should set isLoading to false even if signInAction throws", async () => {
      (signInAction as Mock).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signIn("test@example.com", "password123");
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("signUp", () => {
    it("should set isLoading to true during sign up", async () => {
      let resolveSignUp: (value: { success: boolean }) => void;
      (signUpAction as Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSignUp = resolve;
          })
      );
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue([{ id: "project-1" }]);

      const { result } = renderHook(() => useAuth());

      let signUpPromise: Promise<unknown>;
      act(() => {
        signUpPromise = result.current.signUp("test@example.com", "password123");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveSignUp!({ success: true });
        await signUpPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should return the result from signUpAction", async () => {
      const expectedResult = { success: true };
      (signUpAction as Mock).mockResolvedValue(expectedResult);
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue([{ id: "project-1" }]);

      const { result } = renderHook(() => useAuth());

      let signUpResult: unknown;
      await act(async () => {
        signUpResult = await result.current.signUp(
          "test@example.com",
          "password123"
        );
      });

      expect(signUpResult).toEqual(expectedResult);
    });

    it("should return error result on failed sign up", async () => {
      const expectedResult = { success: false, error: "Email already registered" };
      (signUpAction as Mock).mockResolvedValue(expectedResult);

      const { result } = renderHook(() => useAuth());

      let signUpResult: unknown;
      await act(async () => {
        signUpResult = await result.current.signUp(
          "existing@example.com",
          "password123"
        );
      });

      expect(signUpResult).toEqual(expectedResult);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should set isLoading to false after failed sign up", async () => {
      (signUpAction as Mock).mockResolvedValue({
        success: false,
        error: "Email already registered",
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("existing@example.com", "password123");
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should set isLoading to false even if signUpAction throws", async () => {
      (signUpAction as Mock).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signUp("test@example.com", "password123");
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("post sign-in behavior with anonymous work", () => {
    it("should create project with anonymous work and redirect after successful sign in", async () => {
      const anonWork = {
        messages: [{ role: "user", content: "Hello" }],
        fileSystemData: { "/App.jsx": "content" },
      };
      const createdProject = { id: "new-project-123" };

      (signInAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(anonWork);
      (createProject as Mock).mockResolvedValue(createdProject);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^Design from \d+:\d+:\d+/),
        messages: anonWork.messages,
        data: anonWork.fileSystemData,
      });
      expect(clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/new-project-123");
    });

    it("should create project with anonymous work and redirect after successful sign up", async () => {
      const anonWork = {
        messages: [{ role: "assistant", content: "Here is your component" }],
        fileSystemData: { "/App.jsx": "export default () => <div />" },
      };
      const createdProject = { id: "signup-project-456" };

      (signUpAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(anonWork);
      (createProject as Mock).mockResolvedValue(createdProject);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("new@example.com", "password123");
      });

      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^Design from \d+:\d+:\d+/),
        messages: anonWork.messages,
        data: anonWork.fileSystemData,
      });
      expect(clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/signup-project-456");
    });

    it("should not use anonymous work if messages array is empty", async () => {
      const anonWork = {
        messages: [],
        fileSystemData: { "/App.jsx": "content" },
      };
      const existingProject = { id: "existing-project" };

      (signInAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(anonWork);
      (getProjects as Mock).mockResolvedValue([existingProject]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(clearAnonWork).not.toHaveBeenCalled();
      expect(getProjects).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/existing-project");
    });
  });

  describe("post sign-in behavior with existing projects", () => {
    it("should redirect to most recent project if no anonymous work", async () => {
      const projects = [
        { id: "project-1", name: "Recent" },
        { id: "project-2", name: "Older" },
      ];

      (signInAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue(projects);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(mockPush).toHaveBeenCalledWith("/project-1");
      expect(createProject).not.toHaveBeenCalled();
    });

    it("should redirect to most recent project after sign up if no anonymous work", async () => {
      const projects = [{ id: "user-project-1" }];

      (signUpAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue(projects);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("new@example.com", "password123");
      });

      expect(mockPush).toHaveBeenCalledWith("/user-project-1");
    });
  });

  describe("post sign-in behavior with no existing projects", () => {
    it("should create a new project if no anonymous work and no existing projects", async () => {
      const newProject = { id: "brand-new-project" };

      (signInAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue([]);
      (createProject as Mock).mockResolvedValue(newProject);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
      expect(mockPush).toHaveBeenCalledWith("/brand-new-project");
    });

    it("should create a new project after sign up if no anonymous work and no existing projects", async () => {
      const newProject = { id: "fresh-project" };

      (signUpAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue([]);
      (createProject as Mock).mockResolvedValue(newProject);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("new@example.com", "password123");
      });

      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
      expect(mockPush).toHaveBeenCalledWith("/fresh-project");
    });
  });

  describe("edge cases", () => {
    it("should handle null from getAnonWorkData", async () => {
      (signInAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue([{ id: "project-1" }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(clearAnonWork).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-1");
    });

    it("should handle anon work with messages but getAnonWorkData returns object with empty messages", async () => {
      (signInAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue({ messages: [], fileSystemData: {} });
      (getProjects as Mock).mockResolvedValue([{ id: "project-1" }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(clearAnonWork).not.toHaveBeenCalled();
      expect(getProjects).toHaveBeenCalled();
    });

    it("should pass credentials correctly to signInAction", async () => {
      (signInAction as Mock).mockResolvedValue({ success: false });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@test.com", "mySecurePass123!");
      });

      expect(signInAction).toHaveBeenCalledWith("user@test.com", "mySecurePass123!");
    });

    it("should pass credentials correctly to signUpAction", async () => {
      (signUpAction as Mock).mockResolvedValue({ success: false });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("newuser@test.com", "newSecurePass456!");
      });

      expect(signUpAction).toHaveBeenCalledWith(
        "newuser@test.com",
        "newSecurePass456!"
      );
    });
  });
});
