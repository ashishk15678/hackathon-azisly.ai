import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createCaller } from "@/trpc/server";
import {
  Add01Icon,
  BarChartIcon,
  GameController01Icon,
  PlusSignIcon,
  Rocket01Icon,
  ViewIcon,
} from "hugeicons-react";
import { Badge, Button, Card, Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui";

export const metadata = { title: "Dashboard — AptiQuiz" };

export default async function DashboardPage() {
  const sessionData = await auth.api.getSession({ headers: await headers() });
  if (!sessionData?.user) redirect("/login");

  const caller = await createCaller();
  const [sets, rooms] = await Promise.all([
    caller.quiz.listSets(),
    caller.room.listMine(),
  ]);

  const totalQuestions = sets.reduce((s, q) => s + q._count.questions, 0);
  const totalGames     = rooms.length;
  const activeRooms    = rooms.filter((r) => r.status === "active").length;
  const userName       = sessionData.user.name;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center my-10 justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl  text-zinc-900">
            Welcome back,{" "}
            <span className="font-bold">{userName}</span>
          </h1>
          <p className="mt-1 text-gray-500">
            Manage your quizzes, host live rooms, and track results.
          </p>
        </div>
        <Link href="/host/sets/new">
          <Button size="lg" variant={"outline"}>
            <PlusSignIcon size={18} />
            New Quiz
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Quiz Sets",       value: sets.length,      Icon: Add01Icon },
          { label: "Total Questions", value: totalQuestions,   Icon: BarChartIcon },
          { label: "Games Hosted",    value: totalGames,       Icon: GameController01Icon },
          { label: "Active Rooms",    value: activeRooms,      Icon: Rocket01Icon },
        ].map(({ label, value, Icon }) => (
          <Card key={label} className="text-center py-5">
              <Icon size={26} className="flex justify-center items-center " />
            <div className="flex justify-baseline items-center gap-x-4 mb-2 ">
            <div className="text-2xl font-extrabold ">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quiz Sets */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Your Quiz Sets</h2>
          <Link href="/host/sets">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>

        {sets.length === 0 ? (
          <Card className="text-center py-14">
            <div className="flex justify-center mb-3 text-indigo-300">
              <Add01Icon size={48} />
            </div>
            <p className="text-gray-500 mb-4">No quiz sets yet.</p>
            <Link href="/host/sets/new">
              <Button>Create your first quiz</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sets.slice(0, 6).map((s) => (
              <Card key={s.id} className="flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 leading-snug">{s.title}</h3>
                  <Badge variant="indigo">{s._count.questions} Qs</Badge>
                </div>
                {s.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{s.description}</p>
                )}
                <div className="flex gap-2 mt-auto pt-2">
                  <Link href={`/host/sets/${s.id}`} className="flex-1">
                    <Button variant="outline" size="sm" fullWidth>Edit</Button>
                  </Link>
                  <Link href={`/host/sets/${s.id}/launch`} className="flex-1">
                    <Button size="sm" variant={"default"} >
                      <Rocket01Icon size={14} />
                      Launch
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Recent rooms */}
      {rooms.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Rooms</h2>
          <Table>
            <Thead>
              <Tr>
                <Th>Code</Th>
                <Th>Quiz</Th>
                <Th>Status</Th>
                <Th>Players</Th>
                <Th>Date</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {rooms.slice(0, 8).map((r) => (
                <Tr key={r.id}>
                  <Td>
                    <span className="font-mono font-bold text-indigo-600 tracking-widest">
                      {r.code}
                    </span>
                  </Td>
                  <Td className="font-medium">{r.set.title}</Td>
                  <Td><RoomStatusBadge status={r.status} /></Td>
                  <Td>{r._count.guests}</Td>
                  <Td className="text-gray-400 text-xs">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </Td>
                  <Td>
                    <Link href={`/host/room/${r.code}`}>
                      <Button variant="ghost" size="sm">
                        <ViewIcon size={14} />
                        View
                      </Button>
                    </Link>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </section>
      )}
    </div>
  );
}

function RoomStatusBadge({ status }: { status: string }) {
  if (status === "active")   return <Badge variant="green"  dot>Live</Badge>;
  if (status === "finished") return <Badge variant="default">Finished</Badge>;
  return <Badge variant="yellow" dot>Waiting</Badge>;
}
