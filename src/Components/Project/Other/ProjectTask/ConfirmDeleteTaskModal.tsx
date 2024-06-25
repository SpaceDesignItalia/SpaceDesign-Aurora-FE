interface Tag {
  ProjectTaskTagId: number;
  ProjectTaskTagName: string;
  ProjectTaskTagColor: string;
}

interface Member {
  StafferId: number;
  StafferFullName: string;
  StafferEmail: string;
  StafferImageUrl: string;
}

interface Task {
  ProjectTaskId: number;
  ProjectTaskName: string;
  ProjectTaskDescription?: string;
  ProjectTaskExpiration: Date;
  ProjectTaskStatusId: number;
  ProjectTaskTags: Tag[];
  ProjectTaskMembers: Member[];
}

interface ConfirmDeleteTaskModalProps {
  isOpen: boolean;
  isClosed: () => void;
  TaskData: Task;
  DeleteTask: (ProjectTaskId: number) => void;
}
export default function ConfirmDeleteTaskModal(
  props: ConfirmDeleteTaskModalProps
) {
  return <div>{props.TaskData.ProjectTaskId}</div>;
}
