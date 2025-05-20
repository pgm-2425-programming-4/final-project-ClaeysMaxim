import React from "react";

const Backlog = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return <p>No tasks found in backlog</p>;
  }

  return (
    <table className="task-table">
      <thead className="task-table__header">
        <tr>
          <th>ID</th>
          <th>Task</th>
          <th>Description</th>
          <th>Due Date</th>
        </tr>
      </thead>
      <tbody className="task-table__body">
        {tasks.map((task) => (
          <tr className="task-table__row" key={task.id}>
            <td>{task.id}</td>
            <td>{task.Title}</td>
            <td>{task.Description}</td>
            <td>
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString()
                : "No date"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Backlog;
