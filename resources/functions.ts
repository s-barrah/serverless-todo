export default {
    hello: {
        handler: 'handler.hello',
        events: [
            {
                http: {
                    method: 'get',
                    path: 'hello',
                }
            }
        ]
    },
    createList: {
        handler: 'handler.createList',
        events: [
            {
                http: {
                    method: 'POST',
                    path: 'list/create',
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
                    cors: true
                }
            }
        ]
    }
}
