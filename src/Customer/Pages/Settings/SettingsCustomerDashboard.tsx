import SettingsModel from "../../Components/Settings/Other/SettingsModel";

export default function SettingsCustomerDashboard() {
  return (
    <div className="py-10 m-0">
      <header>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-gray-900">
            Impostazioni
          </h1>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8">
        <div className="py-6 lg:py-8">
          <SettingsModel />
        </div>
      </main>
    </div>
  );
}
