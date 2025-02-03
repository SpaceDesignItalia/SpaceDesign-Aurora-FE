import UpcomingEventsCard from "../../Components/Dashboard/Other/UpcomingEventsCard";

export default function Dashboard() {
  return (
    <div className="py-10 m-0 lg:ml-72">
      <header>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-gray-900">
            Dashboard
          </h1>
        </div>
      </header>
      <main className="mt-5 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-6 gap-5">
          <div className="col-span-4 border-2 rounded-xl w-full"></div>
          <div className="col-span-2">
            <UpcomingEventsCard />
          </div>
        </div>
      </main>
    </div>
  );
}
