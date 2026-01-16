import UserTable from "@/app/components/UserTable";

export default function Director() {

  return (
    <div
      className="mt-2 min-w-[360px] max-w-[1440px] mx-auto w-full rounded-xl
    items-center bg-white text-gray-800 dark:bg-gray-600 transition-colors"
    >
      <main className="w-full px-2 py-2">
        <UserTable/>
      </main>
    </div>
  );
}

