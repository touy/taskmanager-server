export const UserSchema = {
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
    created_date: {
        type: Date,
        default: Date.now
    }
};