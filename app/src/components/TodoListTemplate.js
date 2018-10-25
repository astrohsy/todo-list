import React from 'react';
import './TodoListTemplate.css';

const TodoListTemplate = ({form, pagination, children}) => {
  return (
    <main className="todo-list-template">
      <div className="title">
        To Do List
      </div>
      <section className="form-wrapper">
        { form }
      </section>
      <section className="todos-wrapper">
        { children }
      </section>
      <section className="pagination-wrapper">
        { pagination }
      </section>
    </main>
  );
};

export default TodoListTemplate;