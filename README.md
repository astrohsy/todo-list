# Todo Web Application

<img width="537" alt="todolistpicture" src="https://user-images.githubusercontent.com/16847671/47604056-62296c00-da2f-11e8-92c8-f0ab9ab99668.png">


## 1. 문제 및 해결 방법

### 1. 정방향 참조가 아닌 역방향 참조

#### 문제

본 앱에는 Todo가 자기가 끝나고 수행되어야 하는 관계를 지정합니다.
그래서 단순히 Todo에서 참조를 가지고 있는 것으로는 선행작업이 완료가 되었는지 확인이 어렵습니다.

```
# 예시1
ID    TODO
2     Example @1
1     Example
```

예시1만 확인하여도 왜 어려운지를 알 수 있습니다.
`1`이 완료되기 위해서는 `2`가 완료되어 있는지를 확인하여야 하는데 `1`에 대한 연결관계를 `2`가 들고 있습니다.

#### 해결방법

가장 Naive한 해결방법은 `POST /todos`와 `PUT /todos`을 할 때, 참조하는 Todo 목록을 다 방문하며 각 Todo의 참조목록을 수정하여합니다. 하지만 이 방법은 최악의 경우 `/POST todos`와 `PUT /todos` 요청을 보낸 경우 Todo의 갯수가 V이라고 할 때, **`O(V^2)`** 시간이 걸립니다.

조금 개선한 방법은 모든 Todo들의 참조를 기반으로 역방향 그래프를 만들고 확인을 하여야 합니다. 이 방법을 활용하면 `PUT /todos`하는 경우에만 역 방향 그래프를 만들면 됩니다. 그래프은 `O(V+E)` 시간이 걸립니다. 이 같은 경우도 `E`가 최악의 경우에는 `V^2` 될 가능성은 있지만 Cycle이 존재하는 Edge는 삽압할 수 없기 때문에 그보단 훨씬 적을 것 같습니다.

제가 구현한 방법은 Redis 상에서 Todo 정보 말고도 그래프 연결 정보를 같이 저장하였습니다. `POST /todos`와 `PUT /todos` 할 때, 단지 Redis 위에 있는 그래프의 Edge를 Key를 통해 `O(1)`에 접근할 수 있습니다. 이와 같이 구현할 경우 Todo를 생성할 때 참조관계 만족하는 확인하는데 `O(V)` 시간안에 알 수 있습니다.

In-Memory DB를 사용을 위해 Redis를 사용하였는데, Redis에서 제공하는 가장 기본적인 Operation을 활용하여 구현하여서 다소 깔끔하지 못하게 구현된 것 같습니다.

Relational DB를 활용할 경우 **`Closure Table`** 를 활용하여 `Create 혹은 Update`를 수행할 때 Hook을 걸어서 구현하면 깔끔하게 작성할 수 있을 것 같습니다. 

### 2. Todo 참조에 의한 순환참조 문제 

#### 문제
본 앱에는 Todo 간의 참조를 지정할 수 있습니다. 하지만 이 속성 때문에 데드락이 발생할 수 있습니다.

```
# 예시2
ID    TODO
3     Example @2
2     Example @1
1     Example
```

위의 예시2과 같은 경우는 참조가 `3 -> 2 -> 1`로 생기기에 데드락이 안생깁니다.

하지만 1번을 Example @3으로 수정하면 다음 상태가 됩니다.

```
# 예시3
ID    TODO
3     Example @2
2     Example @1
1     Example @3
```

예시3 같은 경우 `3 -> 2 -> 1 -> 3 -> ...` 형식으로 순환참조가 발생하여서 사이클안에 존재하는 Todo는 모두 완료할 수 없는 Deadlock 상태가 됩니다.

#### 해결방법

이 문제를 해결하기 위해서는 이 순환참조가 생길 수 있는 가능성을 제거하면 됩니다. 저는 이 문제를 PUT `/todos` 요청을 받을 때, 수정되는 참조들이 사이클을 생성하는지를 Redis위에 그래프 노드들을 저장하여 `DFS(Depth First Search)`를 활용하여서 `Cycle Detection`을 하였습니다. 사이클과 같은 경우 완료할 때 참조 확인을 하는 것과는 달리 역방향 순방향을 고려할 필요가 없이 어느 방향으로든 사이클이 존재하면 반드시 반대편 사이클도 존재합니다.

### 3. Pagination과 Redis에서의 순차적 데이터 접근 문제

Redis는 `key-value store`로 Memory 위에서 구현되어 있기 때문에 기본적으로 Hash 기반으로 구현되어 있었습니다. 하지만 본 Todo 앱은 pagination 기능을 제공하여야 하기 때문에 Hash 보다는 Sorted Set을 활용하여서 인덱스를 보존하는 것이 데이터를 접근할 때 유리할 것이라 생각했습니다. 

그래서 Redis의 `SADD`와 `ZRANGEBYSCORE`로 일반 Database와 최대한 비슷하게 `utils/TodoStorage`에 구현하였습니다.

사용할 때, 최신 Todo가 가장 상단에 표시되는 것이 사용자 편의성을 향상할 것이라고 생각하여서 limit과 offset이 주어져 있을 때,Reverse Order로 다음과 같이 Pagination 구현했습니다.

```
Reversed Offset을 max(size - offset - limit, 0)
Reversed Limit을 min(limit, size - offset)

추상화하면 (size - offset - limit) ~ (size - offset) 사이의 값들을
ZRANGEBYSCORE 찾고 반환된 결과를 Reverse 하는 방식으로 구현하였습니다.
```
`ZRANGEBYSCORE` 함수 옵션에 reverse_order 관련 옵션이 없어서 지원을 안하는 줄 알았는데, 위 로직을 구현하고 나서야 `ZREVRANGEBYSCORE`의 존재를 알게 되었습니다. Document를 더욱 꼼꼼히 읽어봐야한다는 것을 느겼습니다 ㅜㅜ

## 2. 프로젝트 구조 명세

#### 프로젝트 구조
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
│   │   │   │   ├── todos.environments.ts
│   │   │   │   └── todos.messages.ts
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


#### Docker를 활용한 빌드 및 실행 방법

> 서버가 올라오는 시간이 걸리기 때문에 실행하고 나서 5초 정도 이후에 `http://localhost:3000`으로 접속하여 주시기 바랍니다.


```sh

# 레포지토리 최상단에서 다음 커맨드를 실행하면 됩니다.
docker-compose up -d

# 실행을 종료하기 위해서는 다음 커맨드를 입력하시면 됩니다.
docker-compose down

```
#### Manual 실행 방법 

> 본 서버는 Redis를 활용하기 때문에 Redis가 6379 포트로 열어져 있어야 합니다.

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

[6. Understanding Jest Mocks](https://medium.com/@rickhanlonii/understanding-jest-mocks-f0046c68e53c)

[7. Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)