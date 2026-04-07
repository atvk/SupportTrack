import { UserData } from "@/src/types/users";

interface DirectorProps {
  user: UserData;
}


export default function Director({ user }: DirectorProps) {

  return (
    <div
      className="mt-2 min-w-[360px] max-w-[1440px] mx-auto w-full rounded-xl
    items-center bg-white text-gray-800 dark:bg-gray-600 transition-colors"
    > <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
       Руководитель
      </h2>
    </div>
  );
}

