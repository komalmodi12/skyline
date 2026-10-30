import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { EnquiryInput } from "./enquiry";

// Vercel par sirf /tmp likhne layak hai (permanent nahi hota)
const FILE = process.env.VERCEL
  ? path.join("/tmp", "enquiries.json")
  : path.join(process.cwd(), "data", "enquiries.json");

export interface StoredEnquiry extends EnquiryInput {
  id: string;
  createdAt: string;
}

// Queue: do requests ek saath aaye toh file ek ek karke likhi jaye
let queue: Promise<unknown> = Promise.resolve();

export function saveEnquiry(input: EnquiryInput): Promise<StoredEnquiry> {
  const task = queue.then(async () => {
    let all: StoredEnquiry[] = [];
    try {
      all = JSON.parse(await fs.readFile(FILE, "utf8"));
    } catch {
      // file abhi nahi hai, khaali list se shuru
    }
    const saved: StoredEnquiry = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    all.push(saved);
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(all, null, 2));
    return saved;
  });
  queue = task.catch(() => undefined);
  return task;
}