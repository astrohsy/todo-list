# <span style="color:#fee233">Todo List Web Application</span> 

<img width="537" alt="todolistpicture" src="https://user-images.githubusercontent.com/16847671/47604056-62296c00-da2f-11e8-92c8-f0ab9ab99668.png">


## 1. 문제 및 해결 방법

## 2. 프로젝트 구조

```
.
├── README.md
├── package.json
├── src
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│   ├── todos
│   │   ├── contants
│   │   │   └── todos.contants.ts
│   │   ├── interfaces
│   │   │   └── todo.interface.ts
│   │   ├── todos.controller.ts
│   │   ├── todos.service.spec.ts
│   │   ├── todos.service.ts
│   │   └── validators
│   │       ├── create-todo.validator.ts
│   │       └── update-todo.validator.ts
│   └── utils
│       ├── graph
│       │   ├── graph.spec.ts
│       │   └── graph.ts
│       └── storage
│           ├── storage.spec.ts
│           └── storage.ts
```

> `todos/`
> 
> todo 요청에 대한 Restful API를 제공합니다. 
`*.controller.ts`에서 요청을 받고 구체적인 처리 로직은 `*.service.ts`에서 처리하도록 하였습니다.

> `utils/`
> 
> Redis를 활용하여 Database를 기능을 흉내낸 storage와 Redis 위에 Graph를 구현한 graph 디렉토리가 존재합니다. 서비스에서 Redis와 Graph에 대한 접근을 추상화하였습니다.



각 파일에 대한 유닛 테스트는 `*.spec.ts`로 명명하였습니다.




## 3. 실행방법

```sh
# 서버 실행
cd server/

# node version: v10.11.0
npm install

# 8000번 Port로 실행
npm run start

# 테스트 실행은
# npm run test
# 입니다.
```

```sh
# 프론트엔드 실행
cd app/

# node version: v10.11.0
npm install

# 3000번 Port로 실행
npm run start
```


## 참고문서


[1. Pagination Styles using CSS](https://codemyui.com/pagination-styles-using-css/)

[2. React 기초 입문 프로젝트 – 흔하디 흔한 할 일 목록 만들기](https://velopert.com/3480)

[3. Detect Cycle in a Directed Graph](https://www.geeksforgeeks.org/detect-cycle-in-a-graph/)

[4. Nest.js Documentation](https://docs.nestjs.com)

[5. Pagination in the REST API](https://developer.atlassian.com/server/confluence/pagination-in-the-rest-api/)