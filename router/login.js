import {Router} from 'express';
import bcrypt from 'bcrypt';
import {User} from '../models/user.js'

const router = Router();

router.post('/', async (req, res) => {

    const existingUser = await User.findOne({email: req.body.email});

    if (!existingUser) return res.status(400).send('Invalid email or password')

    const validPassword = await bcrypt.compare(req.body.password, existingUser.password)

    if (!validPassword) return res.status(400).send('Invalid email or password')

    const token = existingUser.generateAuthToken()

    

    res.send({
        name: existingUser.name,
        jwt: token,
        profilePicture: existingUser.profilePicture
    })

});



export default router;
