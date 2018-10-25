import React, { Component } from 'react';
import TodoListTemplate from './components/TodoListTemplate';
import Form from './components/Form';
import TodoItemList from './components/TodoItemList';
import axios from 'axios';
import * as moment from 'moment';

const API_SERVER_URL = 'http://localhost:8000/';


class App extends Component {

  id = 3 // 이미 0,1,2 가 존재하므로 3으로 설정

  state = {
    input: '',
    todos: [
      { id: 0, text: ' 리액트 소개', checked: false },
      { id: 1, text: ' 리액트 소개', checked: true },
      { id: 2, text: ' 리액트 소개', checked: false }
    ]
  }

  handleChange = (e) => {
    this.setState({
      input: e.target.value
    });
  }

  handleToggle = (id) => {
    const { todos } = this.state;

    // 파라미터로 받은 id 를 가지고 몇번째 아이템인지 찾습니다.
    const index = todos.findIndex(todo => todo.id === id);
    const selected = todos[index]; // 선택한 객체

    const nextTodos = [...todos]; // 배열을 복사

    // 기존의 값들을 복사하고, checked 값을 덮어쓰기
    nextTodos[index] = { 
      ...selected, 
      checked: !selected.checked
    };

    this.setState({
      todos: nextTodos
    });
  }

  handleCreate = () => {
    const { input, todos } = this.state;

    const [text, ...references] = input.split('@')
      .map((value) => { return value.trim(); });

    const requestForm = {
      text,
      references
    }

    let dateFormatter = (stringDate) => {

      if ( !(stringDate !== undefined && stringDate !== null) ) {
        const momentDate = new moment(stringDate);
        const formattedDate = momentDate.format('YYYY-MM-DD h:mm:ss');
        return formattedDate;
      } else {
        return '';
      }
    }
    
    axios.post(API_SERVER_URL + 'todos', requestForm)
      .then((response) => {
        const trailingText = (response.data.references.length === 0) ? '' :' @'.concat(response.data.references.join(' @'));
        this.setState({
          input: '',
          todos: todos.concat({
            id: response.data.id,
            text: response.data.text + trailingText,
            createdAt: dateFormatter(response.data.createdAt),
            updatedAt: dateFormatter(response.data.updatedAt),
            completedAt: dateFormatter(response.data.completedAt)
          })
      });
    
    });
  }

  handleRemove = (id) => {
    const { todos } = this.state;
    this.setState({
      todos: todos.filter(todo => todo.id !== id)
    });
  }


  handleKeyPress = (e) => {
    // 눌려진 키가 Enter 면 handleCreate 호출
    if(e.key === 'Enter') {
      this.handleCreate();
    }
  }

  render() {
    const { input, todos } = this.state;
    const {
      handleChange,
      handleCreate,
      handleKeyPress,
      handleToggle,
      handleRemove
    } = this;

    return (
      <TodoListTemplate form={(
        <Form 
          value={input}
          onKeyPress={handleKeyPress}
          onChange={handleChange}
          onCreate={handleCreate}
        />
      )}>
        <TodoItemList todos={todos} onToggle={handleToggle} onRemove={handleRemove}/>
      </TodoListTemplate>
    );
  }
}

export default App;