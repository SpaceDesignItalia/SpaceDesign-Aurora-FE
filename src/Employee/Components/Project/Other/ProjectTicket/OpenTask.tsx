import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Task {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  status: string;
}

const OpenTask: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>(); // Otteniamo l'ID del ticket dai parametri URL
  const navigate = useNavigate();
  const [task, setTask] = useState<Task>({
    title: "",
    description: "",
    assignee: "",
    dueDate: "",
    status: "open", // Stato di default
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Funzionalità per salvare il task (da integrare con backend API o Redux store)
    console.log("Task creato:", task);

    // Al termine, reindirizza alla dashboard dei ticket o alla lista dei task
    navigate("/tickets");
  };

  return (
    <div className="open-task-container">
      <h2>Apri un nuovo Task per il Ticket #{ticketId}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Titolo del Task</label>
          <input
            type="text"
            id="title"
            name="title"
            value={task.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descrizione</label>
          <textarea
            id="description"
            name="description"
            value={task.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="assignee">Assegnato a</label>
          <input
            type="text"
            id="assignee"
            name="assignee"
            value={task.assignee}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Data di Scadenza</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={task.dueDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Stato</label>
          <select
            id="status"
            name="status"
            value={task.status}
            onChange={handleChange}
          >
            <option value="open">Aperto</option>
            <option value="inProgress">In Corso</option>
            <option value="completed">Completato</option>
          </select>
        </div>

        <button type="submit">Crea Task</button>
      </form>
    </div>
  );
};

export default OpenTask;
