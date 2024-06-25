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

interface EditTaskModalProps {
  isOpen: boolean;
  isClosed: () => void;
  TaskData: Task;
}
export default function EditTaskModal(props: EditTaskModalProps) {
  return <div>{props.TaskData.ProjectTaskId}</div>;
}
