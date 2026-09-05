"use client";

import { useEffect, useState } from "react";
import type { DragEvent, FormEvent } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

type Board = {
  id: string;
  title: string;
  description?: string | null;
  ownerId: string;
  createdAt?: string;
};

type Column = {
  id: string;
  boardId: string;
  title: string;
  order: number;
};

type Task = {
  id: string;
  columnId: string;
  title: string;
  description?: string | null;
  order: number;
};

type User = {
  id: string;
  name: string;
  email: string;
};

type Notice = {
  type: "success" | "error";
  message: string;
};

export default function BoardPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});

  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");

  const [newColumnTitle, setNewColumnTitle] = useState("");

  const [newTaskTitle, setNewTaskTitle] = useState<
    Record<string, string>
  >({});

  const [shareEmail, setShareEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [editingTaskDescription, setEditingTaskDescription] = useState("");

  const [draggedTask, setDraggedTask] = useState<{
    taskId: string;
    sourceColumnId: string;
  } | null>(null);

  const [dragOverIndex, setDragOverIndex] = useState<{
    columnId: string;
    index: number;
  } | null>(null);

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("kanban_access_token");
  };

  const showSuccess = (message: string) => {
    setNotice({
      type: "success",
      message,
    });

    setTimeout(() => {
      setNotice(null);
    }, 3000);
  };

  const showError = (message: string) => {
    setNotice({
      type: "error",
      message,
    });
  };

  const apiRequest = async (
    endpoint: string,
    options: RequestInit = {},
  ) => {
    const token = getToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let message = `Request failed: ${response.status}`;

      if (data?.message) {
        message = Array.isArray(data.message)
          ? data.message.join(" ")
          : data.message;
      }

      throw new Error(message);
    }

    return data;
  };

  // =========================================================
  // LOAD USER
  // =========================================================

  useEffect(() => {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const savedUser = localStorage.getItem("kanban_user");

    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("kanban_user");
      }
    }

    loadBoards();
  }, []);

  // =========================================================
  // LOAD BOARDS
  // =========================================================

  const loadBoards = async () => {
    try {
      setLoading(true);

      const data = await apiRequest("/boards");

      const boardList: Board[] = data || [];

      setBoards(boardList);

      if (boardList.length > 0) {
        setSelectedBoard(boardList[0]);
      }
    } catch (error: any) {
      showError(error.message || "Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD COLUMNS
  // =========================================================

  const loadColumns = async (boardId: string) => {
    try {
      setColumns([]);
      setTasks({});

      const data = await apiRequest(
        `/boards/${boardId}/columns`,
      );

      const sortedColumns = [...data].sort(
        (a: Column, b: Column) => a.order - b.order,
      );

      setColumns(sortedColumns);

      await Promise.all(
        sortedColumns.map((column) =>
          loadTasks(column.id),
        ),
      );
    } catch (error: any) {
      showError(error.message || "Failed to load columns");
    }
  };

  useEffect(() => {
    if (selectedBoard) {
      loadColumns(selectedBoard.id);
    }
  }, [selectedBoard?.id]);

  // =========================================================
  // LOAD TASKS
  // =========================================================

  const loadTasks = async (columnId: string) => {
    try {
      const data = await apiRequest(
        `/columns/${columnId}/tasks`,
      );

      const sortedTasks = [...data].sort(
        (a: Task, b: Task) => a.order - b.order,
      );

      setTasks((prev) => ({
        ...prev,
        [columnId]: sortedTasks,
      }));
    } catch (error: any) {
      showError(error.message || "Failed to load tasks");
    }
  };

  // =========================================================
  // CREATE BOARD
  // =========================================================

  const createBoard = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!newBoardTitle.trim()) {
      showError("Please enter a board title.");
      return;
    }

    try {
      const board = await apiRequest("/boards", {
        method: "POST",
        body: JSON.stringify({
          title: newBoardTitle.trim(),
          description: newBoardDescription.trim(),
        }),
      });

      setBoards((prev) => [board, ...prev]);
      setSelectedBoard(board);

      setNewBoardTitle("");
      setNewBoardDescription("");

      showSuccess("Board created successfully.");
    } catch (error: any) {
      showError(error.message || "Failed to create board");
    }
  };

  // =========================================================
  // DELETE BOARD
  // =========================================================

  const deleteBoard = async (boardId: string) => {
    if (!confirm("Are you sure you want to delete this board?")) {
      return;
    }

    try {
      await apiRequest(`/boards/${boardId}`, {
        method: "DELETE",
      });

      const remainingBoards = boards.filter(
        (board) => board.id !== boardId,
      );

      setBoards(remainingBoards);

      if (selectedBoard?.id === boardId) {
        setSelectedBoard(remainingBoards[0] || null);
      }

      showSuccess("Board deleted successfully.");
    } catch (error: any) {
      showError(error.message || "Failed to delete board");
    }
  };

  // =========================================================
  // SHARE BOARD
  // =========================================================

  const shareBoard = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!selectedBoard) {
      return;
    }

    if (!shareEmail.trim()) {
      showError("Please enter the user's email.");
      return;
    }

    try {
      setIsSharing(true);

      await apiRequest(
        `/boards/${selectedBoard.id}/share`,
        {
          method: "POST",
          body: JSON.stringify({
            email: shareEmail.trim(),
          }),
        },
      );

      setShareEmail("");

      showSuccess("Board shared successfully.");
    } catch (error: any) {
      showError(error.message || "Failed to share board");
    } finally {
      setIsSharing(false);
    }
  };

  // =========================================================
  // CREATE COLUMN
  // =========================================================

  const createColumn = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!selectedBoard) {
      return;
    }

    if (!newColumnTitle.trim()) {
      showError("Please enter a column title.");
      return;
    }

    try {
      const column = await apiRequest(
        `/boards/${selectedBoard.id}/columns`,
        {
          method: "POST",
          body: JSON.stringify({
            title: newColumnTitle.trim(),
            order: columns.length,
          }),
        },
      );

      setColumns((prev) => [...prev, column]);

      setTasks((prev) => ({
        ...prev,
        [column.id]: [],
      }));

      setNewColumnTitle("");

      showSuccess("Column created successfully.");
    } catch (error: any) {
      showError(error.message || "Failed to create column");
    }
  };

  // =========================================================
  // DELETE COLUMN
  // =========================================================

  const deleteColumn = async (columnId: string) => {
    if (!selectedBoard) {
      return;
    }

    if (!confirm("Delete this column?")) {
      return;
    }

    try {
      await apiRequest(
        `/boards/${selectedBoard.id}/columns/${columnId}`,
        {
          method: "DELETE",
        },
      );

      setColumns((prev) =>
        prev.filter((column) => column.id !== columnId),
      );

      setTasks((prev) => {
        const updated = { ...prev };
        delete updated[columnId];
        return updated;
      });

      showSuccess("Column deleted successfully.");
    } catch (error: any) {
      showError(error.message || "Failed to delete column");
    }
  };

  // =========================================================
  // CREATE TASK
  // =========================================================

  const createTask = async (
    columnId: string,
    event?: FormEvent,
  ) => {
    event?.preventDefault();

    const title = newTaskTitle[columnId]?.trim();

    if (!title) {
      showError("Enter a task title first.");
      return;
    }

    try {
      const currentTasks = tasks[columnId] || [];

      const task = await apiRequest(
        `/columns/${columnId}/tasks`,
        {
          method: "POST",
          body: JSON.stringify({
            title,
            description: "",
            order: currentTasks.length,
          }),
        },
      );

      setTasks((prev) => ({
        ...prev,
        [columnId]: [
          ...(prev[columnId] || []),
          task,
        ],
      }));

      setNewTaskTitle((prev) => ({
        ...prev,
        [columnId]: "",
      }));

      showSuccess("Task added successfully.");
    } catch (error: any) {
      showError(error.message || "Failed to create task");
    }
  };

  // =========================================================
  // DELETE TASK
  // =========================================================

  const deleteTask = async (
    columnId: string,
    taskId: string,
  ) => {
    if (!confirm("Delete this task?")) {
      return;
    }

    try {
      await apiRequest(
        `/columns/${columnId}/tasks/${taskId}`,
        {
          method: "DELETE",
        },
      );

      await loadTasks(columnId);

      showSuccess("Task deleted successfully.");
    } catch (error: any) {
      showError(error.message || "Failed to delete task");
    }
  };

  // =========================================================
  // EDIT TASK
  // =========================================================

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setEditingTaskTitle(task.title);
    setEditingTaskDescription(task.description || "");
  };

  const updateTask = async () => {
    if (!editingTask) {
      return;
    }

    if (!editingTaskTitle.trim()) {
      showError("Task title cannot be empty.");
      return;
    }

    try {
      await apiRequest(
        `/columns/${editingTask.columnId}/tasks/${editingTask.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            title: editingTaskTitle.trim(),
            description: editingTaskDescription.trim(),
          }),
        },
      );

      await loadTasks(editingTask.columnId);

      setEditingTask(null);

      showSuccess("Task updated successfully.");
    } catch (error: any) {
      showError(error.message || "Failed to update task");
    }
  };

  // =========================================================
  // DRAG START
  // =========================================================

  const handleDragStart = (
    event: DragEvent<HTMLDivElement>,
    task: Task,
  ) => {
    setDraggedTask({
      taskId: task.id,
      sourceColumnId: task.columnId,
    });

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "taskId",
      task.id,
    );
    event.dataTransfer.setData(
      "sourceColumnId",
      task.columnId,
    );
  };

  // =========================================================
  // DRAG END
  // =========================================================

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverIndex(null);
  };

  // =========================================================
  // DROP TASK
  // =========================================================

  const handleDrop = async (
    event: DragEvent<HTMLDivElement>,
    targetColumnId: string,
    dropIndex: number,
  ) => {
    event.preventDefault();

    const taskId =
      draggedTask?.taskId ||
      event.dataTransfer.getData("taskId");

    const sourceColumnId =
      draggedTask?.sourceColumnId ||
      event.dataTransfer.getData("sourceColumnId");

    setDragOverIndex(null);

    if (!taskId || !sourceColumnId) {
      return;
    }

    const sourceTasks = tasks[sourceColumnId] || [];
    const targetTasks = tasks[targetColumnId] || [];

    const sourceIndex = sourceTasks.findIndex(
      (task) => task.id === taskId,
    );

    if (sourceIndex === -1) {
      return;
    }

    let targetOrder = dropIndex;

    /*
      Same column:
      When moving downward, the source task is removed first,
      so the target order needs to be reduced by one.
    */
    if (sourceColumnId === targetColumnId) {
      if (sourceIndex < dropIndex) {
        targetOrder = dropIndex - 1;
      }

      if (dropIndex >= sourceTasks.length) {
        targetOrder = sourceTasks.length - 1;
      }

      if (targetOrder < 0) {
        targetOrder = 0;
      }

      if (targetOrder === sourceIndex) {
        return;
      }
    }

    /*
      Cross-column:
      dropIndex directly represents the final position.
    */
    if (sourceColumnId !== targetColumnId) {
      if (dropIndex > targetTasks.length) {
        targetOrder = targetTasks.length;
      }
    }

    try {
      await apiRequest(
        `/columns/${sourceColumnId}/tasks/${taskId}/move`,
        {
          method: "PATCH",
          body: JSON.stringify({
            targetColumnId,
            targetOrder,
          }),
        },
      );

      await loadTasks(sourceColumnId);

      if (sourceColumnId !== targetColumnId) {
        await loadTasks(targetColumnId);
      }

      showSuccess("Task moved successfully.");
    } catch (error: any) {
      showError(error.message || "Failed to move task");
    } finally {
      setDraggedTask(null);
    }
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
    columnId: string,
    index: number,
  ) => {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

    setDragOverIndex({
      columnId,
      index,
    });
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    localStorage.removeItem("kanban_access_token");
    localStorage.removeItem("kanban_user");

    window.location.href = "/login";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1020] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
          <p className="text-sm text-slate-400">
            Loading your workspace...
          </p>
        </div>
      </main>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b1020]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold shadow-lg shadow-indigo-600/20">
              K
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Mini Kanban
              </h1>

              <p className="text-xs text-slate-500">
                Work smarter. Stay organized.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-slate-200">
                  {currentUser.name}
                </p>

                <p className="text-xs text-slate-500">
                  {currentUser.email}
                </p>
              </div>
            )}

            <button
              onClick={logout}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8">
        {/* NOTIFICATION */}
        {notice && (
          <div
            className={`mb-6 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
              notice.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/20 bg-red-500/10 text-red-300"
            }`}
          >
            <span>{notice.message}</span>

            <button
              onClick={() => setNotice(null)}
              className="ml-4 text-lg opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        )}

        {/* PAGE INTRO */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Workspace
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Manage your projects
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Create boards, organize tasks, collaborate with your
            team, and move work forward.
          </p>
        </div>

        {/* CREATE BOARD */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                +
              </div>

              <div>
                <h3 className="font-semibold">
                  Create a new board
                </h3>

                <p className="text-xs text-slate-500">
                  Start a new workspace for your project.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={createBoard}
            className="grid gap-3 p-5 md:grid-cols-[1fr_1.4fr_auto]"
          >
            <input
              value={newBoardTitle}
              onChange={(event) =>
                setNewBoardTitle(event.target.value)
              }
              placeholder="Board title"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />

            <input
              value={newBoardDescription}
              onChange={(event) =>
                setNewBoardDescription(
                  event.target.value,
                )
              }
              placeholder="Description (optional)"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-[0.98]"
            >
              Create Board
            </button>
          </form>
        </section>

        {/* BOARD SELECTOR */}
        {boards.length > 0 && (
          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300">
                Your Boards
              </h3>

              <span className="text-xs text-slate-600">
                {boards.length} board
                {boards.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {boards.map((board) => {
                const active =
                  selectedBoard?.id === board.id;

                return (
                  <button
                    key={board.id}
                    onClick={() =>
                      setSelectedBoard(board)
                    }
                    className={`group min-w-[190px] rounded-xl border px-4 py-3 text-left transition ${
                      active
                        ? "border-indigo-500/50 bg-indigo-500/10 shadow-lg shadow-indigo-900/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`truncate text-sm font-semibold ${
                          active
                            ? "text-indigo-300"
                            : "text-slate-300"
                        }`}
                      >
                        {board.title}
                      </span>

                      {active && (
                        <span className="h-2 w-2 rounded-full bg-indigo-400" />
                      )}
                    </div>

                    {board.description && (
                      <p className="mt-1 truncate text-xs text-slate-600">
                        {board.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* SELECTED BOARD */}
        {selectedBoard ? (
          <>
            {/* BOARD HEADER */}
            <section className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/[0.08] to-transparent p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                      {selectedBoard.ownerId ===
                      currentUser?.id
                        ? "Owner"
                        : "Shared"}
                    </span>
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight text-white">
                    {selectedBoard.title}
                  </h2>

                  {selectedBoard.description && (
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedBoard.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() =>
                    deleteBoard(selectedBoard.id)
                  }
                  className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                >
                  Delete Board
                </button>
              </div>
            </section>

            {/* SHARE + ADD COLUMN */}
            <div className="mb-8 grid gap-4 lg:grid-cols-2">
              {/* SHARE */}
              {selectedBoard.ownerId ===
                currentUser?.id && (
                <form
                  onSubmit={shareBoard}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      👥
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        Share Board
                      </h3>

                      <p className="text-xs text-slate-500">
                        Give another registered user access.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={shareEmail}
                      onChange={(event) =>
                        setShareEmail(
                          event.target.value,
                        )
                      }
                      placeholder="user@example.com"
                      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
                    />

                    <button
                      type="submit"
                      disabled={isSharing}
                      className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSharing
                        ? "Sharing..."
                        : "Share"}
                    </button>
                  </div>
                </form>
              )}

              {/* ADD COLUMN */}
              <form
                onSubmit={createColumn}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                    +
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Add Column
                    </h3>

                    <p className="text-xs text-slate-500">
                      Create a new workflow stage.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    value={newColumnTitle}
                    onChange={(event) =>
                      setNewColumnTitle(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. In Progress"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                  >
                    Add Column
                  </button>
                </div>
              </form>
            </div>

            {/* KANBAN BOARD */}
            <section className="rounded-2xl border border-white/10 bg-black/10 p-4 lg:p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-200">
                    Board
                  </h3>

                  <p className="text-xs text-slate-600">
                    Drag tasks to reorder or move them.
                  </p>
                </div>

                <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-500">
                  {columns.length} stage
                  {columns.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex gap-5 overflow-x-auto pb-4">
                {columns.map((column) => {
                  const columnTasks =
                    tasks[column.id] || [];

                  return (
                    <div
                      key={column.id}
                      className="flex w-[320px] min-w-[320px] flex-col rounded-2xl border border-white/10 bg-[#111827] shadow-xl shadow-black/10"
                    >
                      {/* COLUMN HEADER */}
                      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />

                          <h3 className="font-semibold text-slate-200">
                            {column.title}
                          </h3>

                          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">
                            {columnTasks.length}
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            deleteColumn(column.id)
                          }
                          className="text-xs text-slate-600 transition hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>

                      {/* TASK AREA */}
                      <div className="min-h-[180px] flex-1 p-3">
                        {/* DROP BEFORE FIRST TASK */}
                        <div
                          onDragOver={(event) =>
                            handleDragOver(
                              event,
                              column.id,
                              0,
                            )
                          }
                          onDrop={(event) =>
                            handleDrop(
                              event,
                              column.id,
                              0,
                            )
                          }
                          className={`mb-2 h-2 rounded-full transition ${
                            dragOverIndex?.columnId ===
                              column.id &&
                            dragOverIndex.index === 0
                              ? "bg-indigo-500"
                              : "bg-transparent"
                          }`}
                        />

                        {columnTasks.map(
                          (task, index) => (
                            <div key={task.id}>
                              {/* DROP POSITION */}
                              <div
                                onDragOver={(event) =>
                                  handleDragOver(
                                    event,
                                    column.id,
                                    index,
                                  )
                                }
                                onDrop={(event) =>
                                  handleDrop(
                                    event,
                                    column.id,
                                    index,
                                  )
                                }
                                className={`mb-2 h-2 rounded-full transition ${
                                  dragOverIndex?.columnId ===
                                    column.id &&
                                  dragOverIndex.index ===
                                    index
                                    ? "bg-indigo-500"
                                    : "bg-transparent"
                                }`}
                              />

                              {/* TASK CARD */}
                              <div
                                draggable
                                onDragStart={(event) =>
                                  handleDragStart(
                                    event,
                                    task,
                                  )
                                }
                                onDragEnd={handleDragEnd}
                                className={`group cursor-grab rounded-xl border border-white/10 bg-[#1a2233] p-4 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-indigo-500/30 hover:bg-[#202a3d] active:cursor-grabbing ${
                                  draggedTask?.taskId ===
                                  task.id
                                    ? "scale-[0.98] opacity-40"
                                    : ""
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex min-w-0 items-start gap-2">
                                    <span className="mt-1 text-slate-600">
                                      ⋮⋮
                                    </span>

                                    <h4 className="break-words text-sm font-semibold text-slate-200">
                                      {task.title}
                                    </h4>
                                  </div>

                                  <button
                                    onClick={() =>
                                      deleteTask(
                                        column.id,
                                        task.id,
                                      )
                                    }
                                    className="shrink-0 text-slate-600 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                                    title="Delete task"
                                  >
                                    ×
                                  </button>
                                </div>

                                {task.description && (
                                  <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-5 text-slate-500">
                                    {task.description}
                                  </p>
                                )}

                                <div className="mt-4 flex items-center justify-between">
                                  <span className="text-[10px] uppercase tracking-wider text-slate-700">
                                    Task
                                  </span>

                                  <button
                                    onClick={() =>
                                      openEditTask(task)
                                    }
                                    className="text-xs font-medium text-indigo-400 opacity-70 transition hover:text-indigo-300 hover:opacity-100"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </div>
                            </div>
                          ),
                        )}

                        {/* DROP AT END */}
                        <div
                          onDragOver={(event) =>
                            handleDragOver(
                              event,
                              column.id,
                              columnTasks.length,
                            )
                          }
                          onDrop={(event) =>
                            handleDrop(
                              event,
                              column.id,
                              columnTasks.length,
                            )
                          }
                          className={`mt-2 min-h-8 rounded-lg border border-dashed transition ${
                            dragOverIndex?.columnId ===
                              column.id &&
                            dragOverIndex.index ===
                              columnTasks.length
                              ? "border-indigo-500 bg-indigo-500/10"
                              : "border-transparent"
                          }`}
                        />
                      </div>

                      {/* ADD TASK */}
                      <form
                        onSubmit={(event) =>
                          createTask(
                            column.id,
                            event,
                          )
                        }
                        className="border-t border-white/10 p-3"
                      >
                        <input
                          value={
                            newTaskTitle[
                              column.id
                            ] || ""
                          }
                          onChange={(event) =>
                            setNewTaskTitle(
                              (prev) => ({
                                ...prev,
                                [column.id]:
                                  event.target.value,
                              }),
                            )
                          }
                          placeholder="What needs to be done?"
                          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-700 focus:border-indigo-500"
                        />

                        <button
                          type="submit"
                          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-indigo-600 hover:text-white"
                        >
                          <span className="text-base">
                            +
                          </span>
                          Add Task
                        </button>
                      </form>
                    </div>
                  );
                })}

                {/* EMPTY STATE */}
                {columns.length === 0 && (
                  <div className="flex min-h-[300px] w-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-xl text-indigo-400">
                        +
                      </div>

                      <h3 className="font-semibold text-slate-300">
                        No columns yet
                      </h3>

                      <p className="mt-1 text-sm text-slate-600">
                        Add your first column to start
                        organizing tasks.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          /* NO BOARD */
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl text-indigo-400">
              K
            </div>

            <h2 className="text-xl font-bold text-slate-200">
              No board selected
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Create your first board above and start
              managing your project.
            </p>
          </div>
        )}
      </div>

      {/* =====================================================
          EDIT TASK MODAL
      ===================================================== */}

      {editingTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditingTask(null);
            }
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl shadow-black/50">
            <div className="mb-6">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Task
              </p>

              <h2 className="text-xl font-bold text-white">
                Edit task
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update the task title and description.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Task title
                </label>

                <input
                  autoFocus
                  value={editingTaskTitle}
                  onChange={(event) =>
                    setEditingTaskTitle(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Description
                </label>

                <textarea
                  value={editingTaskDescription}
                  onChange={(event) =>
                    setEditingTaskDescription(
                      event.target.value,
                    )
                  }
                  rows={5}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="Add a description..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setEditingTask(null)
                }
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={updateTask}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}