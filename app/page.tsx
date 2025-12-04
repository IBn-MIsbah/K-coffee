import prisma from "@/lib/prisma";

export default async function Home() {
  const users = await prisma.user.findMany();
  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <span>name: {u.name} </span>
            <span>email: {u.email}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
