import fetch from 'node-fetch';

const {
    BASE_URL,
    AUDIENCE,
    AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET,
    TOKEN_ISSUER
} = process.env


const post = (data = {}, url = '', authorized = true) => {
    return new Promise((resolve, reject) => {

        return fetch(`${TOKEN_ISSUER}oauth/token`, {
            method: 'post',
            body:    JSON.stringify({
                client_id: AUTH0_CLIENT_ID,
                client_secret: AUTH0_CLIENT_SECRET,
                audience: AUDIENCE,
                grant_type: "client_credentials",
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(async (response) => {

                const results = await response.json()
                const { token_type, access_token } = results;

                return fetch(`${BASE_URL}${url}`, {
                    method: 'post',
                    body:    JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authorized ? `${token_type} ${access_token}` : null,
                    },
                })
            })
            .then((res) => res.json())
            .then((json) => {
                resolve(json);
            })
            .catch((error) => {
                console.log("FETCH error: ", error);
                reject(error);
            })
    })
}

export default {
    createList: (data, authorized?) => post(data, 'list/create', authorized),
    getList: (data, authorized?) => post(data, 'list', authorized),
    updateList: (data, authorized?) => post(data, 'list/update', authorized),
    deleteList: (data, authorized?) => post(data, 'list/delete', authorized),
    createTask: (data, authorized?) => post(data, 'task/create', authorized),
    getTask: (data, authorized?) => post(data, 'task', authorized),
    updateTask: (data, authorized?) => post(data, 'task/update', authorized),
    deleteTask: (data, authorized?) => post(data, 'task/delete', authorized),
}
