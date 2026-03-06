import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoredEpisode {
  title: string;
  cliffhangerScore: number;
  pacingScore: number;
  duration: string;
  wordCount: number;
  retentionScore: number;
  cliffhangerType: string;
  emotionArc: { start: string; mid: string; end: string };
  improvementSuggestion: string;
  segments: {
    hook: string;
    conflict: string;
    twist: string;
    escalation: string;
    cliffhanger: string;
  };
}

export interface StoredProject {
  id: string;
  uid: string;
  title: string;
  story: string;
  createdAt: Date;
  episodeCount: number;
  wordCount: number;
  overallScore: number;
  suggestions: string[];
  episodes: StoredEpisode[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function docToProject(id: string, data: Record<string, any>): StoredProject {
  return {
    id,
    uid: data.uid,
    title: data.title,
    story: data.story,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    episodeCount: data.episodeCount,
    wordCount: data.wordCount,
    overallScore: data.overallScore,
    suggestions: data.suggestions ?? [],
    episodes: data.episodes ?? [],
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/** Save a canvas analysis to Firestore. Returns the new document ID. */
export async function saveProject(
  uid: string,
  canvas: {
    title: string;
    wordCount: number;
    episodeCount: number;
    overallScore: number;
    episodes: StoredEpisode[];
    suggestions: string[];
  },
  story: string
): Promise<string> {
  const ref = await addDoc(collection(db, "projects"), {
    uid,
    title: story.trim().slice(0, 60) || canvas.title,
    story,
    createdAt: serverTimestamp(),
    episodeCount: canvas.episodeCount,
    wordCount: canvas.wordCount,
    overallScore: canvas.overallScore,
    suggestions: canvas.suggestions,
    episodes: canvas.episodes,
  });
  return ref.id;
}

/** Load all projects for a user, newest first. */
export async function getProjects(uid: string): Promise<StoredProject[]> {
  const q = query(
    collection(db, "projects"),
    where("uid", "==", uid)
  );
  const snap = await getDocs(q);
  const projects = snap.docs.map((d) => docToProject(d.id, d.data()));
  // Sort client-side to avoid requiring a composite Firestore index
  return projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/** Load a single project by its Firestore document ID. */
export async function getProject(projectId: string): Promise<StoredProject | null> {
  const snap = await getDoc(doc(db, "projects", projectId));
  if (!snap.exists()) return null;
  return docToProject(snap.id, snap.data());
}

/** Delete a project by its Firestore document ID. */
export async function deleteProject(projectId: string): Promise<void> {
  await deleteDoc(doc(db, "projects", projectId));
}

// ─── Chat Sessions ────────────────────────────────────────────────────────────

export interface StoredMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  canvasId?: string;
}

export interface StoredChatSession {
  id: string;
  uid: string;
  name: string;
  messages: StoredMessage[];
  canvases: Record<string, any>;
  updatedAt: Date;
}

function docToChatSession(id: string, data: Record<string, any>): StoredChatSession {
  return {
    id,
    uid: data.uid,
    name: data.name,
    messages: data.messages ?? [],
    canvases: data.canvases ?? {},
    updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
  };
}

/** Save a new chat session. Returns the Firestore doc ID. */
export async function saveChatSession(
  uid: string,
  name: string,
  messages: StoredMessage[],
  canvases: Record<string, any>
): Promise<string> {
  const ref = await addDoc(collection(db, "chatSessions"), {
    uid,
    name,
    messages,
    canvases,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update an existing chat session in Firestore. */
export async function updateChatSession(
  docId: string,
  name: string,
  messages: StoredMessage[],
  canvases: Record<string, any>
): Promise<void> {
  await updateDoc(doc(db, "chatSessions", docId), {
    name,
    messages,
    canvases,
    updatedAt: serverTimestamp(),
  });
}

/** Load all chat sessions for a user, newest first. */
export async function getChatSessions(uid: string): Promise<StoredChatSession[]> {
  const q = query(collection(db, "chatSessions"), where("uid", "==", uid));
  const snap = await getDocs(q);
  const sessions = snap.docs.map((d) => docToChatSession(d.id, d.data()));
  return sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

/** Delete a chat session by Firestore doc ID. */
export async function deleteChatSession(docId: string): Promise<void> {
  await deleteDoc(doc(db, "chatSessions", docId));
}
