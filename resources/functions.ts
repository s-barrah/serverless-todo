export default {
    jwtAuth: {
        handler: 'handler.jwtAuth',
    },
    basicAuth: {
        handler: 'handler.basicAuth',
    },
    createList: {
        handler: 'handler.createList',
        events: [
            {
                http: {
                    method: 'POST',
                    path: 'list/create',
                    authorizer: {
                        name: 'jwtAuth'
                    },
                    cors: true
                }
            }
        ]
    },
    deleteList: {
        handler: 'handler.deleteList',
        events: [
            {
                http: {
                    method: 'POST',
                    path: 'list/delete',
                    authorizer: {
                        name: 'jwtAuth'
                    },
                    cors: true
                }
            }
        ]
    },
    getList: {
        handler: 'handler.getList',
        events: [
            {
                http: {
                    method: 'post',
                    path: 'list',
                    authorizer: {
                        name: 'jwtAuth'
                    },
                    cors: true
                }
            }
        ]
    },
    updateList: {
        handler: 'handler.updateList',
        events: [
            {
                http: {
                    method: 'POST',
                    path: 'list/update',
                    authorizer: {
                        name: 'jwtAuth'
                    },
                    cors: true
                }
            }
        ]
    },
    createTask: {
        handler: 'handler.createTask',
        events: [
            {
                http: {
                    method: 'POST',
                    path: 'task/create',
                    authorizer: {
                        name: 'jwtAuth'
                    },
                    cors: true
                }
            }
        ]
    },
    deleteTask: {
        handler: 'handler.deleteTask',
        events: [
            {
                http: {
                    method: 'POST',
                    path: 'task/delete',
                    authorizer: {
                        name: 'jwtAuth'
                    },
                    cors: true
                }
            }
        ]
    },
    getTask: {
        handler: 'handler.getTask',
        events: [
            {
                http: {
                    method: 'POST',
                    path: 'task',
                    authorizer: {
                        name: 'jwtAuth'
                    },
                    cors: true
                }
            }
        ]
    },
    updateTask: {
        handler: 'handler.updateTask',
        events: [
            {
                http: {
                    method: 'POST',
                    path: 'task/update',
                    authorizer: {
                        name: 'jwtAuth'
                    },
                    cors: true
                }
            }
        ]
    }
}
