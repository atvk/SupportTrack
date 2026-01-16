"use client";
import { useState, useRef, FC } from "react";

interface DriveAudioPlayerProps {
  /** ID файла на Google Диске */
  fileId: string;
  /** Имя файла для отображения */
  fileName?: string;
}

const DriveAudioPlayer: FC<DriveAudioPlayerProps> = ({
  fileId = "1ZQA3j1bXzbE2QLCQbr7z9Samo75dJomx",
  fileName = "Аудиофайл",
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Прямая ссылка для потокового воспроизведения
  const directAudioUrl = `https://drive.google.com/uc?export=view&id=1ZQA3j1bXzbE2QLCQbr7z9Samo75dJomx`;

  // Альтернативный вариант (может работать лучше)
  const altAudioUrl = `https://docs.google.com/uc?export=open&id=${fileId}`;

  const handlePlay = () => {
    if (audioRef.current) {
      setIsLoading(true);
      audioRef.current.play().catch((err) => {
        setError(`Ошибка воспроизведения: ${err.message}`);
        setIsLoading(false);
      });
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    setIsPlaying(true);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleError = () => {
    setError(
      "Не удалось загрузить аудиофайл. Попробуйте альтернативную ссылку."
    );
    setIsLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Аудиоплеер</h2>

      <div className="mb-4">
        <p className="text-gray-700 mb-2">
          <span className="font-semibold">Файл:</span> {fileName}
        </p>

        {/* HTML5 Audio элемент */}
        <audio
          ref={audioRef}
          src={directAudioUrl}
          onLoadedData={handleLoadedData}
          onEnded={handleEnded}
          onError={handleError}
          preload="metadata"
          className="w-full"
        />

        {/* Статус */}
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Загрузка...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.src = altAudioUrl;
                  setError(null);
                  setIsLoading(true);
                  audioRef.current.load();
                }
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Попробовать альтернативную ссылку
            </button>
          </div>
        )}
      </div>

      {/* Управление */}
      <div className="flex space-x-4">
        <button
          onClick={handlePlay}
          disabled={isLoading || isPlaying}
          className={`flex-1 py-2 px-4 rounded-lg ${
            isPlaying
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {isPlaying ? "▶ Идет воспроизведение" : "▶ Воспроизвести"}
        </button>

        <button
          onClick={handlePause}
          disabled={!isPlaying}
          className={`flex-1 py-2 px-4 rounded-lg ${
            !isPlaying
              ? "bg-gray-200 text-gray-500"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          ⏸ Пауза
        </button>
      </div>
    </div>
  );
};

export default DriveAudioPlayer;
