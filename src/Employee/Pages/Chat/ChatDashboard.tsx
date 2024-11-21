import ChatTable from "../../Components/Chat/Tables/ChatTable";

export default function ChatDashboard() {
  return (
    <div className="m-0 lg:ml-72">
      <main className="flex flex-row">
        <div className="w-full">
          <ChatTable />
        </div>
      </main>
    </div>
  );
}
