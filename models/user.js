import mongoose from "mongoose"


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    verification_code: {
        type: String,
        default: "000000"
    },

    cbu: {
        type: String
    },

    alias: {
        type: String
    },

    special_diet: {
        type: Array,
        required: true,
        validate: {
            validator: function(v){
                const valid_diets = ["celíaco", "hipertenso", "vegano", "vegetariano"]
                if (!v) return false
                for (const diet of v){
                    if (!valid_diets.includes(diet.toLowerCase())){
                        return false
                    }
                }
                return true
            } 
        }
    },

    profile_picture: {
        type: String,
        required: true
    }

})

export default mongoose.model('User', userSchema)