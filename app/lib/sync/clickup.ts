/**
 * ClickUp Sync Module
 *
 * Fetches tasks from ClickUp lists and transforms them into:
 *   - Campaigns (from campaigns list → tasks with subtasks as milestones)
 *   - Requests (from request queue list)
 *   - Social Posts (from social calendar list)
 *
 * ClickUp API v2: https://clickup.com/api
 */

import type {
  ClientCampaign,
  ClientRequest,
  SocialPost,
  ClickUpConfig,
} from "../types";

const CLICKUP_API = "https://api.clickup.com/api/v2";

// ─── ClickUp API types (minimal) ────────────────────────────

interface ClickUpTask {
  id: string;
  name: string;
  status: { status: string; type: string };
  priority: { id: string; priority: string } | null;
  due_date: string | null; // unix ms or null
  start_date: string | null;
  url: string;
  tags: { name: string }[];
  custom_fields?: { id: string; name: string; value?: unknown; type_config?: unknown }[];
  date_done: string | null;
  subtasks?: ClickUpTask[];
  parent?: string | null;
}

interface ClickUpListResponse {
  tasks: ClickUpTask[];
  last_page: boolean;
}

// ─── API Helpers ─────────────────────────────────────────────

async function fetchClickUp(
  endpoint: string,
  token: string,
  params?: Record<string, string>
): Promise<unknown> {
  const url = new URL(`${CLICKUP_API}${endpoint}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ClickUp API ${res.status}: ${text}`);
  }

  return res.json();
}

async function fetchAllTasks(
  listId: string,
  token: string,
  includeSubtasks: boolean = false
): Promise<ClickUpTask[]> {
  const allTasks: ClickUpTask[] = [];
  let page = 0;

  while (true) {
    const params: Record<string, string> = {
      page: String(page),
      include_closed: "true",
      ...(includeSubtasks ? { subtasks: "true" } : {}),
    };

    const data = (await fetchClickUp(
      `/list/${listId}/task`,
      token,
      params
    )) as ClickUpListResponse;

    allTasks.push(...data.tasks);
    if (data.last_page) break;
    page++;
  }

  return allTasks;
}

// ─── Transform: Campaigns ────────────────────────────────────

function mapCampaignStatus(
  status: string
): "active" | "planning" | "completed" {
  const lower = status.toLowerCase();
  if (lower === "complete" || lower === "closed" || lower === "done")
    return "completed";
  if (
    lower === "in progress" ||
    lower === "active" ||
    lower === "in review"
  )
    return "active";
  return "planning";
}

function mapMilestoneStatus(
  status: string
): "done" | "in-progress" | "pending" | "scheduled" {
  const lower = status.toLowerCase();
  if (lower === "complete" || lower === "closed" || lower === "done")
    return "done";
  if (lower === "in progress" || lower === "active" || lower === "in review")
    return "in-progress";
  if (lower === "scheduled" || lower === "ready") return "scheduled";
  return "pending";
}

function formatDate(unixMs: string | null): string {
  if (!unixMs) return "";
  const d = new Date(parseInt(unixMs, 10));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateWindow(
  startMs: string | null,
  dueMs: string | null
): string {
  const start = startMs
    ? new Date(parseInt(startMs, 10)).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const due = dueMs
    ? new Date(parseInt(dueMs, 10)).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";
  if (start && due) return `${start} – ${due}`;
  if (due) return `Due ${due}`;
  return "TBD";
}

function getEmojiFromTags(tags: { name: string }[]): string {
  // Try to extract emoji from tag names
  for (const tag of tags) {
    const match = tag.name.match(
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
    );
    if (match) return match[0];
  }
  return "📋";
}

function getGoalFromCustomFields(fields?: ClickUpTask["custom_fields"]): string {
  if (!fields) return "";
  const goalField = fields.find(
    (f) =>
      f.name.toLowerCase().includes("goal") ||
      f.name.toLowerCase().includes("objective")
  );
  if (goalField && goalField.value) return String(goalField.value);
  return "";
}

export function transformCampaigns(tasks: ClickUpTask[]): ClientCampaign[] {
  // Group: parent tasks are campaigns, their subtasks are milestones
  const parentTasks = tasks.filter((t) => !t.parent);

  return parentTasks.map((task) => {
    const subtasks = tasks.filter((t) => t.parent === task.id);
    const totalSubs = subtasks.length;
    const doneSubs = subtasks.filter(
      (s) => mapMilestoneStatus(s.status.status) === "done"
    ).length;
    const progress =
      totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0;

    return {
      title: task.name,
      emoji: getEmojiFromTags(task.tags),
      window: formatDateWindow(task.start_date, task.due_date),
      status: mapCampaignStatus(task.status.status),
      goal: getGoalFromCustomFields(task.custom_fields) || task.name,
      progress,
      url: task.url,
      milestones: subtasks.map((sub) => ({
        task: sub.name,
        due: formatDate(sub.due_date),
        status: mapMilestoneStatus(sub.status.status),
      })),
    };
  });
}

// ─── Transform: Requests ─────────────────────────────────────

function mapPriority(
  priority: ClickUpTask["priority"]
): "high" | "normal" | "low" {
  if (!priority) return "normal";
  const id = parseInt(priority.id, 10);
  // ClickUp: 1=urgent, 2=high, 3=normal, 4=low
  if (id <= 2) return "high";
  if (id === 3) return "normal";
  return "low";
}

function getRequestType(task: ClickUpTask): string {
  // Try custom field named "Type" or "Request Type"
  if (task.custom_fields) {
    const typeField = task.custom_fields.find(
      (f) =>
        f.name.toLowerCase() === "type" ||
        f.name.toLowerCase().includes("request type")
    );
    if (typeField && typeField.value) return String(typeField.value);
  }
  // Fall back to first tag
  if (task.tags.length > 0) return task.tags[0].name;
  return "Request";
}

export function transformRequests(tasks: ClickUpTask[]): ClientRequest[] {
  // Only show non-closed tasks
  return tasks
    .filter((t) => {
      const lower = t.status.status.toLowerCase();
      return lower !== "closed" && lower !== "complete" && lower !== "done";
    })
    .map((task) => ({
      title: task.name,
      type: getRequestType(task),
      priority: mapPriority(task.priority),
      deadline: formatDate(task.due_date) || "No deadline",
      url: task.url,
    }));
}

// ─── Transform: Social Posts ─────────────────────────────────

function getDayOfWeek(unixMs: string | null): string {
  if (!unixMs) return "TBD";
  const d = new Date(parseInt(unixMs, 10));
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function getPlatformFromTask(task: ClickUpTask): string {
  // Check custom field
  if (task.custom_fields) {
    const platformField = task.custom_fields.find(
      (f) =>
        f.name.toLowerCase() === "platform" ||
        f.name.toLowerCase().includes("channel")
    );
    if (platformField && platformField.value)
      return String(platformField.value);
  }
  // Check tags for platform names
  const platformNames = [
    "instagram",
    "facebook",
    "tiktok",
    "twitter",
    "linkedin",
    "google",
    "youtube",
    "pinterest",
  ];
  for (const tag of task.tags) {
    const lower = tag.name.toLowerCase();
    for (const p of platformNames) {
      if (lower.includes(p)) return p.charAt(0).toUpperCase() + p.slice(1);
    }
  }
  return "Social";
}

function mapSocialStatus(
  task: ClickUpTask
): "posted" | "scheduled" | "missed" {
  const lower = task.status.status.toLowerCase();
  if (lower === "complete" || lower === "done" || lower === "posted")
    return "posted";
  if (lower === "closed") return "posted";

  // If due date has passed and not done → missed
  if (task.due_date) {
    const due = new Date(parseInt(task.due_date, 10));
    if (due < new Date() && lower !== "complete" && lower !== "done") {
      return "missed";
    }
  }

  return "scheduled";
}

export function transformSocialPosts(tasks: ClickUpTask[]): SocialPost[] {
  return tasks.map((task) => ({
    day: getDayOfWeek(task.due_date),
    platform: getPlatformFromTask(task),
    content: task.name,
    status: mapSocialStatus(task),
  }));
}

// ─── Main Sync Function ─────────────────────────────────────

export interface ClickUpSyncResult {
  campaigns: ClientCampaign[];
  requests: ClientRequest[];
  socialPosts: SocialPost[];
  errors: string[];
}

export async function syncClickUp(
  config: ClickUpConfig
): Promise<ClickUpSyncResult> {
  const result: ClickUpSyncResult = {
    campaigns: [],
    requests: [],
    socialPosts: [],
    errors: [],
  };

  const { api_token } = config;
  if (!api_token) {
    result.errors.push("No ClickUp API token configured");
    return result;
  }

  // Sync campaigns
  if (config.campaigns_list_id) {
    try {
      const tasks = await fetchAllTasks(
        config.campaigns_list_id,
        api_token,
        true
      );
      result.campaigns = transformCampaigns(tasks);
    } catch (err) {
      result.errors.push(
        `Campaigns sync failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Sync requests
  if (config.requests_list_id) {
    try {
      const tasks = await fetchAllTasks(config.requests_list_id, api_token);
      result.requests = transformRequests(tasks);
    } catch (err) {
      result.errors.push(
        `Requests sync failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Sync social posts
  if (config.social_list_id) {
    try {
      const tasks = await fetchAllTasks(config.social_list_id, api_token);
      result.socialPosts = transformSocialPosts(tasks);
    } catch (err) {
      result.errors.push(
        `Social sync failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return result;
}
