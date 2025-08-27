import bcrypt from "bcrypt";
import { User } from "../models/user.js";
import { STATUS_CODES } from "../constants/httpStatusCode.js";
export async function login(req, res) {
    try {
        req.body.email = req.body.email.toLowerCase();
        const existingUser = await User.findOne({ email: req.body.email });
        if (!existingUser)
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json({ message: "Invalid email or password" });
        const validPassword = await bcrypt.compare(req.body.password, existingUser.password);
        if (!validPassword)
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json({ message: "Invalid email or password" });
        const token = existingUser.generateAuthToken();
        return res.status(STATUS_CODES.OK).json({
            id: existingUser.id,
            name: existingUser.name,
            jwt: token,
        });
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
