import axios from 'axios';
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
    todoCount: 10,
    todos: []
  }

  componentDidMount() {
    this.reloadTodos(this.state.pageNumber, this.state.pageSize);
  }

  reloadTodos = (pageNumber, pageSize, _tryCnt) => {
      const tryCnt = _tryCnt || 0;

      if (tryCnt > 5) {
        return;
      }

      const offset = (this.state.pageNumber-1) * this.state.pageSize;
      const limit = this.state.pageSize;
      axios.get(API_SERVER_URL + `todos?offset=${offset}&limit=${limit}`)
      .then((response) => {
        const todoCount = response.data.metadata.count;
        const todos = response.data.data;

        this.setState({
          ...this.state,
          input: '',
          todoCount,
          todos
        })
      })
      .catch((error) => {
        setTimeout(() => {
          this.reloadTodos(pageNumber, pageSize, tryCnt+1);
        }, 200 * (tryCnt + 1))
      })
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
    const pageNumLimit = Math.ceil(this.state.todoCount / this.state.pageSize);
    if (pageNum < 1 || pageNum > pageNumLimit) {
      return;
    }

    this.setState({
      ...this.setState,
      pageNumber: Number(pageNum)
    }, () => {
        this.reloadTodos(this.state.pageNumber, this.state.pageSize)
      }
    )
  }

  handleComplete = (id, isCompleted) => {
    const requestForm = {
      completedAt: isCompleted ? null : new Date(),
    }
    
    axios.patch(API_SERVER_URL + `todos/${id}` , requestForm)
      .then((response) => {
        this.reloadTodos();
    }).catch((error) => {
      if (error.response) {
        const  response = error.response;
        alert(`${response.status} ${response.statusText }: ${
          typeof(response.data.message) === 'object' ? 
          JSON.stringify(response.data.message[0].constraints) :
          response.data.message
         }`);
      }
    });
  }

  handleCreate = () => {
    const { input } = this.state;

    const [text, ...references] = input.split('@')
      .map((value) => { return value.trim(); });

    const requestForm = {
      text,
      createdAt: new Date(),
      references: references.map((value) => Number(value))
    }
    
    axios.post(API_SERVER_URL + 'todos', requestForm)
      .then((response) => {
        this.reloadTodos(this.state.pageNumber, this.state.pageSize)
      })
      .catch((error) => {
        if (error.response) {
          const  response = error.response;
          alert(`${response.status} ${response.statusText }: ${
            typeof(response.data.message) === 'object' ? 
            JSON.stringify(response.data.message[0].constraints) :
            response.data.message
           }`);
        }
      });
  }

  handleUpdate = (todo) => {

    const [text, ...references] = todo.text.split('@')
      .map((value) => { return value.trim(); });

    const requestForm = {
      ...todo,
      text,
      updatedAt: new Date(),
      references: references.map((value) => Number(value))
    }
    
    axios.put(API_SERVER_URL + `todos/${todo.id}` , requestForm)
      .then((response) => {
        this.reloadTodos();
    }).catch((error) => {
      if (error.response) {
        const  response = error.response;
        alert(`${response.status} ${response.statusText }: ${
          typeof(response.data.message) === 'object' ? 
          JSON.stringify(response.data.message[0].constraints) :
          response.data.message
         }`);
      }
    })
  }


  handleKeyPress = (e) => {
    // 눌려진 키가 Enter 면 handleCreate 호출
    if(e.key === 'Enter') {
      this.handleCreate();
    }
  }

  render() {
    const { input, todoCount, pageSize, pageNumber, todos } = this.state;
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
          todoCount={todoCount}
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