import ProjectTicket from "../../Table/ProjectTicket";
import ProjectChat from "../../Table/ProjectChat";

export default function TicketContainer() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-6 gap-5 h-screen">
      <div className="col-span-6 sm:col-span-4">
        <ProjectTicket />
        <ProjectChat />
      </div>
    </div>
  );
}
