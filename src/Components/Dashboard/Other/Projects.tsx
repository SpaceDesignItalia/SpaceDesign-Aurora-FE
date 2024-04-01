import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Avatar, AvatarGroup, Button } from "@nextui-org/react";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";

interface ProjectConfig {
  id?: number;
  projectImagePath?: string;
  projectName?: string;
  creationDate?: Date;
  projectStatus?: ProjectStatusConfig;
  remainingTasks?: number;
  team?: string[];
}

interface ProjectStatusConfig {
  idStatus?: number;
  projectStatusName?: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectConfig[]>([
    {
      id: 1,
      projectImagePath: "https://via.placeholder.com/150",
      projectName: "Project A",
      creationDate: new Date(),
      projectStatus: {
        idStatus: 1,
        projectStatusName: "Appena creato",
      },
      remainingTasks: 5,
      team: [
        "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        "https://i.pravatar.cc/150?u=a04258a2462d826712d",
      ],
    },
    {
      id: 2,
      projectImagePath: "https://via.placeholder.com/150",
      projectName: "Project B",
      creationDate: new Date(),
      projectStatus: {
        idStatus: 2,
        projectStatusName: "In sviluppo",
      },
      remainingTasks: 8,
      team: [
        "https://i.pravatar.cc/150?u=a04258114e29026302d",
        "https://i.pravatar.cc/150?u=a04258114e29026702d",
      ],
    },
    {
      id: 3,
      projectImagePath: "https://via.placeholder.com/150",
      projectName: "Project C",
      creationDate: new Date(),
      projectStatus: {
        idStatus: 3,
        projectStatusName: "Terminato",
      },
      remainingTasks: 3,
      team: [
        "https://i.pravatar.cc/150?u=a04258114e29026708c",
        "https://i.pravatar.cc/150?u=a04258114e29026702d",
      ],
    },
  ]);

  const statuses = [
    "text-green-700 bg-green-50 ring-green-600/20",
    "text-orange-600 bg-orange-50 ring-orange-500/20",
    "text-red-700 bg-red-50 ring-red-600/10",
  ];

  function classNames(...classes: (string | boolean | undefined)[]): string {
    return classes.filter((className) => !!className).join(" ");
  }

  return (
    <div className="border border-gray-200 rounded-xl bg-white px-4 py-5 sm:px-6">
      <div className="bg-white px-4 py-5 sm:px-6">
        <div className="flex space-x-3">
          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-gray-900">
            Progetti
          </h2>
        </div>
        <div className="py-5">
          {projects.length !== 0 ? (
            <ul
              role="list"
              className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
            >
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="overflow-hidden rounded-xl border border-gray-200"
                >
                  <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
                    <img
                      src={project.projectImagePath}
                      alt={project.projectName}
                      className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
                    />
                    <div className="text-sm font-medium leading-6 text-gray-900">
                      {project.projectName}
                    </div>
                    <Menu as="div" className="relative ml-auto">
                      <Menu.Button className="-m-2.5 block p-2.5 text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Open options</span>
                        <MoreVertRoundedIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  href="#"
                                  className={classNames(
                                    active
                                      ? "bg-gray-100 text-gray-900"
                                      : "text-gray-700",
                                    "group flex items-center px-4 py-2 text-sm"
                                  )}
                                >
                                  <RemoveRedEyeRoundedIcon
                                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                    aria-hidden="true"
                                  />
                                  Visualizza
                                </a>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                  <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
                    <div className="flex justify-between gap-x-4 py-3">
                      <dt className="text-gray-500">Task da fare</dt>
                      <dd className="text-gray-700">
                        {project.remainingTasks}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-x-4 py-3">
                      <dt className="text-gray-500">Team</dt>
                      <dd className="text-gray-700">
                        <AvatarGroup isBordered max={2} total={10} size="sm">
                          {project.team !== undefined && (
                            <>
                              {project.team.map(
                                (member: string, index: number) => (
                                  <Avatar key={index} src={member} />
                                )
                              )}
                            </>
                          )}
                        </AvatarGroup>
                      </dd>
                    </div>
                    <div className="flex justify-between gap-x-4 py-3">
                      <dt className="text-gray-500">Status progetto</dt>
                      <dd className="flex items-start gap-x-2">
                        <div
                          className={classNames(
                            project.projectStatus &&
                              statuses[
                                project.projectStatus.idStatus
                                  ? project.projectStatus.idStatus - 1
                                  : 0
                              ],
                            "rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset"
                          )}
                        >
                          {project.projectStatus?.projectStatusName}
                        </div>
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Non hai progetti attivi!
              </h3>
            </div>
          )}
        </div>
        <div className="flex flex-row justify-between">
          <div />
          <Button variant="light" color="primary" radius="sm">
            Visualizza tutti i progetti <span aria-hidden="true"> &rarr;</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
