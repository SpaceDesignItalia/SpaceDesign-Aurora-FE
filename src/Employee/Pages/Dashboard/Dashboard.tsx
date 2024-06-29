import { useEffect } from "react";
import ProfileInfo from "../../Components/Dashboard/Other/ProfileInfo";
import Projects from "../../Components/Dashboard/Other/Projects";

export default function Dashboard() {
  return (
    <div className="py-10 m-0 lg:ml-72">
      <header>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Dashboard
          </h1>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8">
        <div className="py-6 lg:py-8">
          <ProfileInfo />
        </div>
        <div className="py-6 lg:py-8">
          <Projects />
        </div>
      </main>
    </div>
  );
}
