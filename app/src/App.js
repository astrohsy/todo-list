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
      const offset = (this.state.pageNumber-1) * this.state.pageSize;
      const limit = this.state.pageSize;
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
    if (stringDate == null || stringDate === '') {
      return '';
    }

    const momentDate = new moment(stringDate);
    const formattedDate = momentDate.format('YYYY-MM-DD hh:mm:ss');
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

  handleComplete = (id) => {
    const requestForm = {
      completedAt: new Date(),
    }
    
    axios.patch(API_SERVER_URL + `todos/${id}` , requestForm)
      .then((response) => {
        this.reloadTodos();
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

  handleUpdate = (todo) => {

    const [text, ...references] = todo.text.split('@')
      .map((value) => { return value.trim(); });

    const requestForm = {
      ...todo,
      text,
      references
    }
    
    axios.put(API_SERVER_URL + `todos/${todo.id}` , requestForm)
      .then((response) => {
        //const trailingText = (response.data.references.length === 0) ? '' :' @'.concat(response.data.references.join(' @'));
        this.reloadTodos();
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
      handleComplete,
      handleUpdate
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
      
        <TodoItemList todos={todos} onComplete={handleComplete} onUpdate={handleUpdate}/>
      </TodoListTemplate>
    );
  }
}

export default App;