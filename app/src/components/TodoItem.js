import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faEdit } from '@fortawesome/free-solid-svg-icons'

import './TodoItem.css';

class TodoItem extends Component {
  state = {
    isModify: false,
    text: ''
  };

  constructor(props) {
    super(props);

    this.state = {
        isModify: false,
        text: props.text
    }
  }

  render() {
    const { text, createdAt, updatedAt, completedAt, checked, id, onToggle } = this.props;

    return (
      <div className="todo-item" onClick={() => onToggle(id)}>
        <div className="remove" onClick={(e) => {
          e.stopPropagation();
          this.onModifyClick() }
        }>
          <FontAwesomeIcon icon={faEdit} />
        </div>
        <div className={`todo-text ${checked && 'checked'}`}>
          <div className='todo-item-id'>
            {id}번
          </div>
          { this.renderText(text) }
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

  onModifyClick = () => {
    if (this.state.isModify === true) {
      this.props.onUpdate({
        id :this.props.id,
        text: this.state.text,
        createdAt: this.props.createdAt,
        completedAt: this.props.completedAt
      });
    }
    this.setState({
      ...this.setState,
      isModify: !this.state.isModify
    })
  }

  renderText = (text) => {
    if (this.state.isModify === false) {
      return (
        <div>{text}</div>
      );
    } else {
      return (
        <input value={this.state.text} onChange={this.handleChange}></input>
      )
    }
  }

  handleChange = (e) => {
    this.setState({
      ...this.setState,
      text: e.target.value
    });
  }
}

export default TodoItem;
