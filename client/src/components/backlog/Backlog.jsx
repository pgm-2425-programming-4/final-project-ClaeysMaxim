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
        {tasks.map((task) => {
          const title = task.Title || task.attributes?.Title || "No title";
          const description =
            task.Description ||
            task.attributes?.Description ||
            "No description";
          const dueDate = task.dueDate || task.attributes?.dueDate;

          return (
            <tr className="task-table__row" key={task.id}>
              <td>{task.id}</td>
              <td>{title}</td>
              <td>{description}</td>
              <td>
                {dueDate ? new Date(dueDate).toLocaleDateString() : "No date"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Backlog;
