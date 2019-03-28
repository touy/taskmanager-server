
export const UserSchema = {
    "properties": {
        id: {
            type: String,
            required: 'Enter a first name'
        },
        userName: {
            type: String,
            required: 'Enter a first name'
        },
        password: {
            type: String,
            required: 'password'
        },
        confirmPassword: {
            type: String,
            required: 'confirm Password'
        },
        firstName: {
            type: String,
            required: 'Enter a first name'
        },
        lastName: {
            type: String,
            required: 'Enter a last name'
        },
        email: {
            type: String
        },
        company: {
            type: String
        },
        phone: {
            type: Number
        },
        createdDate: {
            type: Date,
            default: Date.now
        },
        permission: {
            type: String,
        },
        department: {
            type: String,
        },
        parent: {
            type: String,
        }
    }
};