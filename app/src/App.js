import axios from 'axios';
import * as moment from 'moment';
import React, { Component } from 'react';

import Form from './components/Form';
import Pagination from './components/Pagination';
import TodoItemList from './components/TodoItemList';
import TodoListTemplate from './components/TodoListTemplate';

const API_SERVER_URL = 'http://localhost:8000/';


class App extends Component {

  state = {
    input: '',
    pageSize: 5,
    pageNumber: 1,
    todoNumber: 10,
    todos: []
  }

  componentDidMount() {
    this.reloadTodos(this.state.pageNumber, this.state.pageSize);
  }

  reloadTodos = (pageNumber, pageSize) => {
      const offset = (pageNumber-1) * pageSize;
      const limit = pageSize;
      axios.get(API_SERVER_URL + `todos?offset=${offset}&limit=${limit}`)
      .then((response) => {
        const todos = response.data.map( (todo) => {
          
          todo.createdAt = this.dateFormatter(todo.createdAt);
          todo.updatedAt = this.dateFormatter(todo.updatedAt);
          todo.completedAt = this.dateFormatter(todo.completedAt);

          return todo;
        });

        this.setState({
          ...this.state,
          todos: todos
        })
      });
  }

  dateFormatter = (stringDate) => {
    if (stringDate == null) {
      return '';
    }

    const momentDate = new moment(stringDate);
    const formattedDate = momentDate.format('YYYY-MM-DD h:mm:ss');
    return formattedDate;
  }

  handleChange = (e) => {
    this.setState({
      ...this.setState,
      input: e.target.value
    });
  }

  handlePageSizeChange = (e) => {
    this.setState({
      ...this.setState,
      pageNumber: 1,
      pageSize: Number(e.target.value)
    }, () => {
        this.reloadTodos(this.state.pageNumber, this.state.pageSize)
      }
    );
  }

  handlePageNumberChange = (pageNum) => {
    this.setState({
      ...this.setState,
      pageNumber: Number(pageNum)
    }, () => {
        this.reloadTodos(this.state.pageNumber, this.state.pageSize)
      }
    )
  }

  handleToggle = (id) => {
    const { todos } = this.state;

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
    const { input, todoNumber, pageSize, pageNumber, todos } = this.state;
    const {
      handleChange,
      handlePageSizeChange,
      handlePageNumberChange,
      handleCreate,
      handleKeyPress,
      handleToggle,
      handleRemove
    } = this;

    return (
      <TodoListTemplate
      form={(
        <Form 
          value={input}
          pageSize={pageSize}
          onKeyPress={handleKeyPress}
          onChange={handleChange}
          onpageSizeChange={handlePageSizeChange}
          onCreate={handleCreate}
        />
      )}
      pagination={(
        <Pagination
          todoNumber={todoNumber}
          pageNumber={pageNumber}
          pageSize={pageSize}
          onPageNumberChange={handlePageNumberChange}
        >
        </Pagination>
      )}
      >
      
        <TodoItemList todos={todos} onToggle={handleToggle} onRemove={handleRemove}/>
      </TodoListTemplate>
    );
  }
}

export default App;