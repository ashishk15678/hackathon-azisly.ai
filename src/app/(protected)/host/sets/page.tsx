import Link from "next/link";
import { createCaller } from "@/trpc/server";
import { Add01Icon, Edit01Icon, Rocket01Icon } from "hugeicons-react";
import { Badge, Button, Card } from "@/components/ui";

export const metadata = { title: "Quiz Sets — AptiQuiz" };

export default async function SetsPage() {
  const caller = await createCaller();
  const sets = await caller.quiz.listSets();

  return (
    <div className="max-w-5xl space-y-6 mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Quiz Sets</h1>
        <Link href="/host/sets/new">
          <Button>
            <Add01Icon size={16} />
            New Quiz
          </Button>
        </Link>
      </div>

      {sets.length === 0 ? (
        <Card className="text-center py-16 space-y-4">
          <div className="flex justify-center text-indigo-300">
            <Add01Icon size={52} />
          </div>
          <p className="text-gray-500">Create your first question set.</p>
          <Link href="/host/sets/new">
            <Button>Get started</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sets.map((s) => (
            <Card
              key={s.id}
              className="flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 leading-snug">{s.title}</h3>
                <Badge variant="indigo">{s._count.questions} Qs</Badge>
              </div>
              {s.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{s.description}</p>
              )}
              <p className="text-xs text-gray-400">
                {s._count.rooms} room{s._count.rooms !== 1 ? "s" : ""} hosted ·{" "}
                Updated {new Date(s.updatedAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2 mt-auto pt-1">
                <Link href={`/host/sets/${s.id}`} className="flex-1">
                  <Button variant="outline" size="sm" fullWidth>
                    <Edit01Icon size={13} />
                    Edit
                  </Button>
                </Link>
                <Link href={`/host/sets/${s.id}/launch`} className="flex-1">
                  <Button size="sm" fullWidth>
                    <Rocket01Icon size={13} />
                    Launch
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
