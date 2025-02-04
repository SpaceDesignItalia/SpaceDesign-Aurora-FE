import { useEffect, useState } from "react";
import UpcomingCalendarEvents from "../../Components/Dashboard/UpcomingCalendarEvents";
import AttendanceWeekView from "../../Components/Dashboard/AttendanceWeekView";
import AttendanceStats from "../../Components/Dashboard/AttendanceStats";
import axios from "axios";

export default function Dashboard() {
  const [stafferId, setStafferId] = useState<number>(0);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchAttendances = async () => {
    try {
      const sessionData = await axios.get("/Authentication/GET/GetSessionData");
      setStafferId(sessionData.data.StafferId);

      const res = await axios.get("/Staffer/GET/GetAttendanceByStafferId", {
        params: {
          month: selectedDate.getMonth() + 1,
          year: selectedDate.getFullYear(),
          stafferId: sessionData.data.StafferId,
        },
      });
      setAttendances(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, [selectedDate]);

  return (
    <div className="py-10 m-0 lg:ml-72">
      <header>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Dashboard
          </h1>
        </div>
      </header>
      <main className="mt-5 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-6 gap-5">
          <div className="col-span-4">
            <div className="border-2 rounded-xl p-6 bg-white">
              <h2 className="text-xl font-semibold mb-6">Le tue presenze</h2>
              <AttendanceWeekView
                stafferId={stafferId}
                attendances={attendances}
                onUpdate={fetchAttendances}
              />
            </div>

            <div className="mt-5">
              <AttendanceStats
                attendances={attendances}
                selectedDate={selectedDate}
              />
            </div>
          </div>
          <div className="col-span-2">
            <UpcomingCalendarEvents />
          </div>
        </div>
      </main>
    </div>
  );
}
