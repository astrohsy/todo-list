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
        const todos = response.data.data.map( (todo) => {
          todo.createdAt = this.dateFormatter(todo.createdAt);
          todo.updatedAt = this.dateFormatter(todo.updatedAt);
          todo.completedAt = this.dateFormatter(todo.completedAt);

          return todo;
        });

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
        }, 100 * (tryCnt + 1))
      })
  }

  dateFormatter = (stringDate) => {
    if (stringDate == null || stringDate === '') {
      return null;
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

  handleComplete = (id, isCompleted) => {
    const requestForm = {
      completedAt: isCompleted ? null : new Date(),
    }
    
    axios.patch(API_SERVER_URL + `todos/${id}` , requestForm)
      .then((response) => {
        this.reloadTodos();
    }).catch((error) => {
      if (error.response) {
        alert(`${error.response.status} Error 발생: ${error.response.data.response}`);
      }
    });
  }

  handleCreate = () => {
    const { input } = this.state;

    const [text, ...references] = input.split('@')
      .map((value) => { return value.trim(); });

    const requestForm = {
      text,
      references: references.map((value) => Number(value))
    }
    
    axios.post(API_SERVER_URL + 'todos', requestForm)
      .then((response) => {
        this.reloadTodos(this.state.pageNumber, this.state.pageSize)
      })
      .catch((error) => {
        if (error.response) {
          alert(`${error.response.status} Error 발생: ${error.response.data.response}`);
        }
      });
  }

  handleUpdate = (todo) => {

    const [text, ...references] = todo.text.split('@')
      .map((value) => { return value.trim(); });

    const requestForm = {
      ...todo,
      text,
      references: references.map((value) => Number(value))
    }
    
    axios.put(API_SERVER_URL + `todos/${todo.id}` , requestForm)
      .then((response) => {
        //const trailingText = (response.data.references.length === 0) ? '' :' @'.concat(response.data.references.join(' @'));
        this.reloadTodos();
    }).catch((error) => {
      if (error.response) {
        alert(`${error.response.status} Error 발생: ${error.response.data.response}`);
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