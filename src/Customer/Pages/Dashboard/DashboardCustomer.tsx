import ProfileInfo from "../../Components/Dashboard/Other/ProfileInfo";

export default function DashboardCustomer() {
  return (
    <div className="py-10 m-0 lg:ml-72">
      <header>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Dashboard
          </h1>
        </div>
      </header>
      <main className="flex flex-row px-4 sm:px-6 lg:px-8 h-96">
        <div className="py-6 lg:py-8">
          <ProfileInfo />
        </div>
      </main>
    </div>
  );
}
