import React, { Component } from 'react';
import TodoListTemplate from './components/TodoListTemplate';
import Form from './components/Form';
import TodoItemList from './components/TodoItemList';
import axios from 'axios';
import * as moment from 'moment';

const API_SERVER_URL = 'http://localhost:8000/';


class App extends Component {

  state = {
    input: '',
    todos: []
  }

  componentDidMount() {
    axios.get(API_SERVER_URL + 'todos?offset=0&limit=5')
      .then((response) => {

        const todos = response.data.map( (todo) => {
          todo.createdAt = this.dateFormatter(todo.createdAt);
          todo.updatedAt = this.dateFormatter(todo.updatedAt);
          todo.completedAt = this.dateFormatter(todo.completedAt);

          return todo;
        });

        this.setState({
          input: '',
          todos: todos
        })
    });
  }

  dateFormatter = (stringDate) => {

    if ( !(stringDate !== undefined && stringDate !== null) ) {
      const momentDate = new moment(stringDate);
      const formattedDate = momentDate.format('YYYY-MM-DD h:mm:ss');
      return formattedDate;
    } else {
      return '';
    }
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
    
    axios.post(API_SERVER_URL + 'todos', requestForm)
      .then((response) => {
        const trailingText = (response.data.references.length === 0) ? '' :' @'.concat(response.data.references.join(' @'));
        this.setState({
          input: '',
          todos: todos.concat({
            id: response.data.id,
            text: response.data.text + trailingText,
            createdAt: this.dateFormatter(response.data.createdAt),
            updatedAt: this.dateFormatter(response.data.updatedAt),
            completedAt: this.dateFormatter(response.data.completedAt)
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