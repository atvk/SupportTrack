"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignInIcon, XIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

export default function SignIn() {
  const router = useRouter();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Ошибка входа");
        return;
      }
      if (!data?.id) {
        setError("Ошибка: пользователь без ID");
        return;
      }
      localStorage.setItem("user", JSON.stringify(data));
      setIsPopupOpen(false); // ✅ закрываем попап
      router.push(`/users/${data.id}`);
    } catch (err) {
      console.error(err);
      setError("Ошибка сети");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsPopupOpen(true)}
        className="p-2 rounded-lg bg-indigo-600 text-white"
      >
        <SignInIcon size={20} />
      </button>
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Вход</h2>
              <button onClick={() => setIsPopupOpen(false)}>
                <XIcon size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border p-2 rounded pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2"
                >
                  {showPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white p-2 rounded"
              >
                {isLoading ? "Вход..." : "Войти"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
