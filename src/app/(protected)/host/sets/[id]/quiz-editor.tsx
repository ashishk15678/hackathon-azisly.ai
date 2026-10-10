"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import {
  Add01Icon,
  ArrowLeft01Icon,
  Cancel01Icon,
  Delete01Icon,
  Edit01Icon,
  FileUploadIcon,
  FloppyDiskIcon,
  PlusSignIcon,
  Rocket01Icon,
  Tick01Icon,
  Time01Icon,
} from "hugeicons-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Field,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui";

// ── Types ─────────────────────────────────────────────────────────────────────

type Question = {
  id: string;
  prompt: string;
  options: unknown;
  answerIdx: number;
  topic: string;
  difficulty: string;
  imageUrl?: string | null;
  timeSecs: number;
  order: number;
};

type QuestionSet = {
  id: string;
  title: string;
  description?: string | null;
  questions: Question[];
};

type EditingQuestion = {
  prompt: string;
  options: string[];
  answerIdx: number;
  topic: string;
  difficulty: string;
  imageUrl?: string | null;
  timeSecs: number;
};

const TOPICS = [
  { value: "quantitative",       label: "Quantitative" },
  { value: "logical",            label: "Logical" },
  { value: "verbal",             label: "Verbal" },
  { value: "data_interpretation",label: "Data Interpretation" },
] as const;

const DIFFICULTIES = [
  { value: "easy",   label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard",   label: "Hard" },
] as const;

function blankQuestion(): EditingQuestion {
  return {
    prompt: "",
    options: ["", "", "", ""],
    answerIdx: 0,
    topic: "quantitative",
    difficulty: "medium",
    imageUrl: null,
    timeSecs: 30,
  };
}

// ── CSV parser ────────────────────────────────────────────────────────────────
// Expected columns (header row required):
// prompt, option1, option2, option3, option4, answer (1-based), topic, difficulty, time
function parseCSV(text: string): EditingQuestion[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");
  const header = lines[0]!.split(",").map((h) => h.trim().toLowerCase());

  const idx = (name: string) => header.indexOf(name);
  const pIdx   = idx("prompt");
  const aIdx   = idx("answer");
  if (pIdx === -1 || aIdx === -1)
    throw new Error("CSV must have 'prompt' and 'answer' columns.");

  return lines.slice(1).map((line, row) => {
    // Handle quoted fields with commas inside
    const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map((c) =>
      c.replace(/^"|"$/g, "").trim(),
    ) ?? line.split(",").map((c) => c.trim());

    const prompt = cols[pIdx] ?? "";
    if (!prompt) throw new Error(`Row ${row + 2}: 'prompt' is empty.`);

    // Collect options — option1 through option6
    const options: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const oi = idx(`option${i}`);
      if (oi !== -1 && cols[oi]) options.push(cols[oi]!);
    }
    if (options.length < 2) throw new Error(`Row ${row + 2}: need at least option1 and option2.`);

    const answerRaw = parseInt(cols[aIdx] ?? "1", 10);
    const answerIdx = isNaN(answerRaw) ? 0 : Math.min(answerRaw - 1, options.length - 1);

    const topicRaw = (cols[idx("topic")] ?? "quantitative").toLowerCase().replace(/\s+/g, "_");
    const topic = TOPICS.map((t) => t.value).includes(topicRaw as never)
      ? topicRaw
      : "quantitative";

    const diffRaw = (cols[idx("difficulty")] ?? "medium").toLowerCase();
    const difficulty = ["easy", "medium", "hard"].includes(diffRaw) ? diffRaw : "medium";

    const timeSecs = parseInt(cols[idx("time")] ?? "30", 10) || 30;

    return { prompt, options, answerIdx, topic, difficulty, timeSecs, imageUrl: null };
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function QuizEditor({ set }: { set: QuestionSet | null }) {
  const router = useRouter();
  const trpc   = useTRPC();
  const csvRef = useRef<HTMLInputElement>(null);

  // Set metadata state
  const [title,     setTitle]     = useState(set?.title ?? "");
  const [desc,      setDesc]      = useState(set?.description ?? "");
  const [setId,     setSetId]     = useState(set?.id ?? "");
  const [questions, setQuestions] = useState<Question[]>(set?.questions ?? []);
  const [metaErrors, setMetaErrors] = useState<Record<string, string>>({});

  // Question editor state
  const [editing,      setEditing]      = useState<EditingQuestion | null>(null);
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [qErrors,      setQErrors]      = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [csvError,     setCsvError]     = useState<string | null>(null);
  const [csvPending,   setCsvPending]   = useState(false);

  // tRPC mutations
  const createSet = useMutation(trpc.quiz.createSet.mutationOptions());
  const updateSet = useMutation(trpc.quiz.updateSet.mutationOptions());
  const addQ      = useMutation(trpc.quiz.addQuestion.mutationOptions());
  const updateQ   = useMutation(trpc.quiz.updateQuestion.mutationOptions());
  const deleteQ   = useMutation(trpc.quiz.deleteQuestion.mutationOptions());

  // ── Ensure set exists, return its ID ──────────────────────────────────────
  async function ensureSet(): Promise<string> {
    if (setId) return setId;
    if (!title.trim()) {
      setMetaErrors({ title: "Give your quiz a title first." });
      throw new Error("no title");
    }
    const s = await createSet.mutateAsync({ title, description: desc || undefined });
    setSetId(s.id);
    return s.id;
  }

  async function handleSaveMeta() {
    if (!title.trim()) { setMetaErrors({ title: "Title is required" }); return; }
    setMetaErrors({});
    if (setId) {
      await updateSet.mutateAsync({ id: setId, title, description: desc || undefined });
    } else {
      const s = await createSet.mutateAsync({ title, description: desc || undefined });
      setSetId(s.id);
    }
  }

  // ── Question save ─────────────────────────────────────────────────────────
  async function saveQuestion() {
    if (!editing) return;
    const errs: Record<string, string> = {};
    if (!editing.prompt.trim()) errs.prompt = "Question text is required.";
    const filledOpts = editing.options.filter((o) => o.trim());
    if (filledOpts.length < 2) errs.options = "At least 2 options are required.";
    if (Object.keys(errs).length) { setQErrors(errs); return; }

    setQErrors({});
    let sid: string;
    try { sid = await ensureSet(); } catch { return; }

    const payload = {
      prompt:     editing.prompt.trim(),
      options:    editing.options.filter((o) => o.trim()),
      answerIdx:  editing.answerIdx,
      topic:      editing.topic as "quantitative" | "logical" | "verbal" | "data_interpretation",
      difficulty: editing.difficulty as "easy" | "medium" | "hard",
      timeSecs:   editing.timeSecs,
      imageUrl:   editing.imageUrl ?? undefined,
    };

    if (editingId) {
      const q = await updateQ.mutateAsync({ id: editingId, ...payload });
      setQuestions((prev) => prev.map((p) => (p.id === editingId ? q as unknown as Question : p)));
    } else {
      const q = await addQ.mutateAsync({ setId: sid, ...payload });
      setQuestions((prev) => [...prev, q as unknown as Question]);
    }
    setEditing(null);
    setEditingId(null);
  }

  // ── CSV import ────────────────────────────────────────────────────────────
  async function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setCsvError(null);
    setCsvPending(true);

    try {
      const text = await file.text();
      const parsed = parseCSV(text);

      let sid: string;
      try { sid = await ensureSet(); } catch { setCsvPending(false); return; }

      const added: Question[] = [];
      for (const q of parsed) {
        const { imageUrl, ...rest } = q;
        const result = await addQ.mutateAsync({
          setId: sid,
          prompt:     rest.prompt,
          options:    rest.options,
          answerIdx:  rest.answerIdx,
          topic:      rest.topic as "quantitative" | "logical" | "verbal" | "data_interpretation",
          difficulty: rest.difficulty as "easy" | "medium" | "hard",
          timeSecs:   rest.timeSecs,
          imageUrl:   imageUrl ?? undefined,
        });
        added.push(result as unknown as Question);
      }
      setQuestions((prev) => [...prev, ...added]);
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : "Failed to parse CSV.");
    } finally {
      setCsvPending(false);
    }
  }

  function openEdit(q: Question) {
    setEditing({ ...q, options: q.options as string[] });
    setEditingId(q.id);
    setQErrors({});
  }

  function openNew() {
    setEditing(blankQuestion());
    setEditingId(null);
    setQErrors({});
  }

  const isSavingMeta = createSet.isPending || updateSet.isPending;
  const isQSaving    = addQ.isPending || updateQ.isPending;
  const canAddQ      = !!title.trim(); // can add even before saving (ensureSet handles it)

  return (
    <div className="max-w-5xl mx-auto mt-20 space-y-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
        <h1 className="
        text-xl font-bold">Set questions here</h1>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0 space-y-3 max-w-lg">
          <Field label="Quiz title" id="title" required error={metaErrors.title}>
            <Input
              id="title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setMetaErrors({}); }}
              placeholder="e.g. Campus Placement Mock 2025"
              error={!!metaErrors.title}
            />
          </Field>
          <Field label="Description" id="desc">
            <Textarea
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Optional short description"
              className="h-[60px]"
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-2 mt-7">
          <Button variant="outline" onClick={() => router.push("/host/sets")}>
            <ArrowLeft01Icon size={16} />
            Back
          </Button>
          <Button loading={isSavingMeta} onClick={handleSaveMeta}>
            <FloppyDiskIcon size={16} />
            {setId ? "Save" : "Create quiz"}
          </Button>
          {setId && (
            <Button
              variant="secondary"
              onClick={() => router.push(`/host/sets/${setId}/launch`)}
            >
              <Rocket01Icon size={16} />
              Launch room
            </Button>
          )}
        </div>
      </div>

      {/* ── Questions list ──────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Questions
            <Badge variant="indigo">{questions.length}</Badge>
          </h2>
          <div className="flex gap-2">
            {/* CSV import */}
            <input
              ref={csvRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleCSV}
            />
            <Button
              variant="outline"
              size="sm"
              loading={csvPending}
              disabled={!canAddQ}
              onClick={() => csvRef.current?.click()}
              title="Import questions from CSV"
            >
              <FileUploadIcon size={15} />
              Import CSV
            </Button>
            <Button size="sm" disabled={!canAddQ} onClick={openNew}>
              <PlusSignIcon size={15} />
              Add question
            </Button>
          </div>
        </div>

        {csvError && (
          <Alert variant="error" className="mb-4">
            {csvError}
          </Alert>
        )}

        {/* CSV format hint */}
        <div className="mb-4 text-xs text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-xl px-4 py-2">
          CSV format: <code>prompt, option1, option2, option3, option4, answer (1-based), topic, difficulty, time</code>
        </div>

        {questions.length === 0 && !editing && (
          <Card className="text-center py-12">
            <p className="text-gray-400">
              No questions yet. Click <strong>Add question</strong> or <strong>Import CSV</strong>.
            </p>
          </Card>
        )}

        <div className="space-y-3">
          {questions.map((q, i) => (
            <Card key={q.id} className="flex items-start gap-4 py-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{q.prompt}</p>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <Badge variant="default">{q.topic.replace(/_/g, " ")}</Badge>
                  <DifficultyBadge diff={q.difficulty} />
                  <Badge variant="blue" className="flex items-center gap-1">
                    <Time01Icon size={11} />
                    {q.timeSecs}s
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => openEdit(q)}>
                  <Edit01Icon size={15} />
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteTarget(q.id)}>
                  <Delete01Icon size={15} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Inline question editor ──────────────────────────────────────── */}
      {editing && (
        <Card highlighted className="space-y-5">
          <h3 className="font-bold text-gray-900">
            {editingId ? "Edit question" : "New question"}
          </h3>

          {Object.keys(qErrors).length > 0 && (
            <Alert variant="error">
              {qErrors.prompt ?? qErrors.options}
            </Alert>
          )}

          <Field label="Question text" id="q-prompt" required error={qErrors.prompt}>
            <Textarea
              id="q-prompt"
              value={editing.prompt}
              onChange={(e) => setEditing({ ...editing, prompt: e.target.value })}
              placeholder="Enter your question…"
              error={!!qErrors.prompt}
            />
          </Field>

          {/* Options */}
          <div>
            <Label>
              Answer options
              <span className="ml-2 text-xs font-normal text-gray-400">
                click the circle to mark correct
              </span>
            </Label>
            {qErrors.options && (
              <p className="text-xs text-red-600 mt-0.5">{qErrors.options}</p>
            )}
            <div className="space-y-2 mt-2">
              {editing.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing({ ...editing, answerIdx: idx })}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                      editing.answerIdx === idx
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-gray-300 text-gray-400 hover:border-indigo-400"
                    }`}
                    aria-label={`Mark option ${idx + 1} as correct`}
                  >
                    {editing.answerIdx === idx ? (
                      <Tick01Icon size={13} />
                    ) : (
                      String.fromCharCode(65 + idx)
                    )}
                  </button>
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const opts = [...editing.options];
                      opts[idx] = e.target.value;
                      setEditing({ ...editing, options: opts });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  />
                  {editing.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        const opts = editing.options.filter((_, i) => i !== idx);
                        setEditing({
                          ...editing,
                          options: opts,
                          answerIdx: Math.min(editing.answerIdx, opts.length - 1),
                        });
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove option"
                    >
                      <Cancel01Icon size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {editing.options.length < 6 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() =>
                  setEditing({ ...editing, options: [...editing.options, ""] })
                }
              >
                <Add01Icon size={14} />
                Add option
              </Button>
            )}
          </div>

          {/* Topic / Difficulty / Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Topic" id="q-topic">
              <Select
                id="q-topic"
                value={editing.topic}
                onChange={(e) =>
                  setEditing({ ...editing, topic: (e as React.ChangeEvent<HTMLSelectElement>).target.value })
                }
              >
                {TOPICS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Difficulty" id="q-diff">
              <Select
                id="q-diff"
                value={editing.difficulty}
                onChange={(e) =>
                  setEditing({ ...editing, difficulty: (e as React.ChangeEvent<HTMLSelectElement>).target.value })
                }
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Time limit (sec)" id="q-time">
              <Input
                id="q-time"
                type="number"
                min={10}
                max={120}
                value={editing.timeSecs}
                onChange={(e) =>
                  setEditing({ ...editing, timeSecs: Math.max(10, Number(e.target.value)) })
                }
              />
            </Field>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => { setEditing(null); setEditingId(null); setQErrors({}); }}
            >
              <Cancel01Icon size={15} />
              Cancel
            </Button>
            <Button loading={isQSaving} onClick={saveQuestion}>
              <FloppyDiskIcon size={15} />
              {editingId ? "Update" : "Add question"}
            </Button>
          </div>
        </Card>
      )}

      {/* ── Delete confirm ──────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteQ.mutate({ id: deleteTarget }, {
            onSuccess: () => {
              setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget));
              setDeleteTarget(null);
            },
          });
        }}
        title="Delete question?"
        description="This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function DifficultyBadge({ diff }: { diff: string }) {
  if (diff === "easy") return <Badge variant="green">Easy</Badge>;
  if (diff === "hard") return <Badge variant="red">Hard</Badge>;
  return <Badge variant="yellow">Medium</Badge>;
}
