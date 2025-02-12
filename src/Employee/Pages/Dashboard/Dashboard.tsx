import { useEffect, useState } from "react";
import UpcomingCalendarEvents from "../../Components/Dashboard/Other/UpcomingCalendarEvents";
import AttendanceWeekView from "../../Components/Dashboard/Other/AttendanceWeekView";
import AttendanceStats from "../../Components/Dashboard/Other/AttendanceStats";
import axios from "axios";
import { io } from "socket.io-client";
import { API_WEBSOCKET_URL } from "../../../API/API";
import EndingTasks from "../../Components/Dashboard/Other/EndingTasks";
import dayjs from "dayjs";
import { Spinner } from "@heroui/react";

const socket = io(API_WEBSOCKET_URL);

interface Attendances {
  current: any[];
  previous: any[];
}

export default function Dashboard() {
  const [stafferId, setStafferId] = useState<number>(0);
  const [attendances, setAttendances] = useState<Attendances>({
    current: [],
    previous: [],
  });
  const [endingTasks, setEndingTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const selectedDate = new Date();

  const fetchAttendances = async () => {
    try {
      const sessionData = await axios.get("/Authentication/GET/GetSessionData");
      setStafferId(sessionData.data.StafferId);

      // Fetch del mese corrente
      const currentMonth = await axios.get(
        "/Staffer/GET/GetAttendanceByStafferId",
        {
          params: {
            month: selectedDate.getMonth() + 1,
            year: selectedDate.getFullYear(),
            stafferId: sessionData.data.StafferId,
          },
        }
      );

      // Fetch del mese precedente
      const previousDate = dayjs(selectedDate).subtract(1, "month").toDate();
      const previousMonth = await axios.get(
        "/Staffer/GET/GetAttendanceByStafferId",
        {
          params: {
            month: previousDate.getMonth() + 1,
            year: previousDate.getFullYear(),
            stafferId: sessionData.data.StafferId,
          },
        }
      );

      setAttendances({
        current: currentMonth.data,
        previous: previousMonth.data,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/Project/GET/GetProjectInTeam");
      const projectsWithTasks = [];

      for (const project of res.data) {
        const resTask = await axios.get("/Project/GET/GetTasksByProjectId", {
          params: { ProjectId: project.ProjectId },
        });

        const tasks = [];
        for (const task of resTask.data) {
          const resTaskMember = await axios.get(
            "/Project/GET/GetMembersByTaskId",
            {
              params: { ProjectTaskId: task.ProjectTaskId },
            }
          );

          // Check if task expires within 5 days AND user is assigned
          const expirationDate = dayjs(task.ProjectTaskExpiration);
          const today = dayjs();
          const daysUntilExpiration = expirationDate.diff(today, "day");
          const isUserAssigned = resTaskMember.data.some(
            (member: any) => member.StafferId === stafferId
          );

          if (
            daysUntilExpiration <= 5 &&
            daysUntilExpiration >= 0 &&
            isUserAssigned
          ) {
            tasks.push({
              ...task,
              ProjectTaskMembers: resTaskMember.data,
            });
          }
        }

        if (tasks.length > 0) {
          projectsWithTasks.push({
            ProjectId: project.ProjectId,
            ProjectName: project.ProjectName,
            Tasks: tasks.sort((a, b) =>
              dayjs(a.ProjectTaskExpiration).diff(
                dayjs(b.ProjectTaskExpiration)
              )
            ),
          });
        }
      }

      setEndingTasks(projectsWithTasks);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      await fetchAttendances();
      await fetchTasks();
      setIsLoading(false);
    }
    fetchData();

    socket.on("employee-attendance-update", () => {
      fetchAttendances();
    });
  }, []);

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
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-5">
            <div className="col-span-4 flex flex-col gap-5 h-screen">
              <div className="border-2 rounded-xl p-6 bg-white">
                <h2 className="text-xl font-semibold mb-6">Le tue presenze</h2>

                <AttendanceWeekView
                  stafferId={stafferId}
                  attendances={attendances.current}
                />
              </div>

              <div>
                <AttendanceStats
                  attendances={attendances}
                  selectedDate={selectedDate}
                />
              </div>

              <div className="col-span-4">
                <div className="border-2 rounded-xl p-6 bg-white">
                  <h2 className="text-xl font-semibold mb-6">
                    Task In Scadenza
                  </h2>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <Spinner />
                    </div>
                  ) : (
                    <EndingTasks projects={endingTasks} />
                  )}
                </div>
              </div>
            </div>
            <div className="col-span-2">
              <UpcomingCalendarEvents />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
