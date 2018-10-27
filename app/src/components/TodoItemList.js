import React, { Component } from 'react';
import TodoItem from './TodoItem';

class TodoItemList extends Component {
    
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.todos !== nextProps.todos;
  }

render() {
    const { todos, onComplete, onUpdate } = this.props;

    const todoList = todos.map(
      ({id, text, references, createdAt, updatedAt, completedAt}, i) => (
        <TodoItem
          id={id}
          text={text}
          references={references}
          createdAt={createdAt}
          updatedAt={updatedAt}
          completedAt={completedAt}
          onComplete={onComplete}
          onUpdate={onUpdate}
          key={i}
        />
      )
    );

    return (
      <div>
        {todoList}    
      </div>
    );
  }
}

export default TodoItemList;