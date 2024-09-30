import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";

export default function EmployeeStats() {
  const stats = [
    {
      id: 1,
      name: "Dipendenti Totali",
      stat: 0,
      icon: EngineeringRoundedIcon,
    },
    {
      id: 2,
      name: "Nuovi dipendenti",
      stat: 0,
      icon: PersonAddRoundedIcon,
    },
  ];
  return (
    <div>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 sm:px-6 sm:pt-6 border border-gray"
          >
            <dt>
              <div className="absolute rounded-md bg-primary p-3">
                <item.icon aria-hidden="true" className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-lg md:text-2xl font-semibold text-gray-900">
                {item.stat != 0 ? item.stat : "Dati non disponibili"}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
