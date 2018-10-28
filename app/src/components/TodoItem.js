import './TodoItem.css';

import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as moment from 'moment';
import React, { Component } from 'react';

class TodoItem extends Component {
  state = {
    isModify: false,
    text: ''
  };

  referenceToTrailingText = (refs) => {
    return (refs.length > 0 ? ' @' : '') + refs.join(' @');
  }

  render() {
    const { createdAt, updatedAt, completedAt, id, onComplete } = this.props;

    return (
      <div className="todo-item" onClick={() => onComplete(id, (completedAt != null))}>
        <div className={`modify ${completedAt ? 'hidden' : ''}`} onClick={(e) => {
          e.stopPropagation();
          this.onModifyClick() 
        }}
        >
          <FontAwesomeIcon icon={faEdit}/>
        </div>
        <div className={`todo-text ${completedAt && 'checked'}`}>
          <div className='todo-item-id'>
            {id}번
          </div>
          { this.renderText() }
        </div>
        {
          completedAt && (<div className="check-mark">✓</div>)
        }
        <div className='todo-date-group'>
          <div className='todo-date'>{createdAt ? `생성일시: ${this.dateFormatter(createdAt)}` : ''}</div>
          <div className='todo-date'>{updatedAt ? `수정일시: ${this.dateFormatter(updatedAt)}` : ''}</div>
          <div className='todo-date'>{completedAt ? `완료일시: ${this.dateFormatter(completedAt)}` : ''}</div>
        </div>
      </div>
    );
  }

  dateFormatter = (stringDate) => {
    if (stringDate == null || stringDate === '') {
      return null;
    }

    const momentDate = new moment(stringDate);
    const formattedDate = momentDate.format('YYYY-MM-DD hh:mm:ss');
    return formattedDate;
  }

  onModifyClick = () => {
    if (this.state.isModify === true) {
      this.props.onUpdate({
        id :this.props.id,
        text: this.state.text,
        references: this.props.references,
        createdAt: this.props.createdAt,
        completedAt: this.props.completedAt
      });
    }
    const refInfo = this.referenceToTrailingText(this.props.references);

    this.setState({
      ...this.setState,
      text: this.props.text + refInfo,
      isModify: !this.state.isModify
    })
  }

  renderText = () => {
    const refInfo = this.referenceToTrailingText(this.props.references);
    if (this.state.isModify === false) {
      return (
        <div>{ this.props.text + refInfo }</div>
      );
    } else {
      return (
        <input value={this.state.text} 
        onChange={this.handleChange}
        onClick={(e) => {
          e.stopPropagation();
          }
        }>
        </input>
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
