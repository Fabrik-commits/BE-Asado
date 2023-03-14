import mongoose from "mongoose";
import bcrypt from "bcrypt"


const userSchema = new mongoose.Schema({

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

    verificationCode: {
        type: String,
        default: "000000"
    },

    cbu: {
        type: String
    },

    alias: {
        type: String
    },

    specialDiet: {
        type: [String],
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

    profilePicture: {
        type: String,
        required: true
    }

});


userSchema.methods.isValidPassword = async function (password) {
	try {
		return await bcrypt.compare(password, this.password)
	} catch (error) {
		throw error
	}
}


const User = mongoose.model('User', userSchema);


export {userSchema as userSchema, User as User};
