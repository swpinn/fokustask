export default function ProgressBar({ completed, total }) {
  const progress = total > 0 ? (completed / total) * 100 : 0;
  return (
    <section className="bg-white rounded-xl p-5 sm:p-6 border border-[#dee4e3] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="text-xl font-semibold text-[#181c1c] mb-1">Today&#39;s Focus</h2>
        <p className="text-sm text-[#3f4947]">
          {completed} of {total} tasks completed.{" "}
          {progress === 100 ? "Amazing work! 🎉" : "Keep the momentum going."}
        </p>
      </div>
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="flex-grow md:w-48 h-2 bg-[#e6e9e8] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#26665f] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-semibold tracking-wider text-[#26665f] shrink-0 uppercase">
          {Math.round(progress)}%
        </span>
      </div>
    </section>
  );
}
