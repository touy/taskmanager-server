export const LoginSchema = {
    "properties": {
        userName: {
            type: String,
            required: 'Enter a username'
        },
        password: {
            type: String,
            required: 'password'
        },
    }
};