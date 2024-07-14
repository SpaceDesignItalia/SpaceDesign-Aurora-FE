import AddTicketModal from "../../Components/Project/Other/AddTicketModel";

export default function AddTicketPage() {
  return (
    <div className="py-10 m-0">
      <header>
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Apri ticket
          </h1>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8">
        <div className="py-6 lg:py-8">
          <AddTicketModal />
        </div>
      </main>
    </div>
  );
}
