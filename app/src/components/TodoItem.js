import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faEdit } from '@fortawesome/free-solid-svg-icons'

import './TodoItem.css';

class TodoItem extends Component {
  render() {
    const { text, createdAt, updatedAt, completedAt, checked, id, onToggle, onRemove } = this.props;

    return (
      <div className="todo-item" onClick={() => onToggle(id)}>
        <div className="remove" onClick={(e) => {
          e.stopPropagation();
          onRemove(id)}
        }>
          <FontAwesomeIcon icon={faEdit} />
        </div>
        <div className={`todo-text ${checked && 'checked'}`}>
          <div className='todo-item-id'>
            {id}번
          </div>
          <div>
          {text}
          </div>
        </div>
        <div className='todo-date-group'>
          <div className='todo-date'>{createdAt ? `생성일시: ${createdAt}` : ''}</div>
          <div className='todo-date'>{updatedAt ? `수정일시: ${updatedAt}` : ''}</div>
          <div className='todo-date'>{completedAt ? `완료일시: ${completedAt}` : ''}</div>
        </div>
        {
          checked && (<div className="check-mark">✓</div>)
        }
      </div>
    );
  }
}

export default TodoItem;
