import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import createError from '../utils/createError.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res, next) => {

    try {

        const hash = bcrypt.hashSync(req.body.password, 5);

        const newUser = new User({
            ...req.body,
            password: hash
        });

        await newUser.save();

        res.status(200).send('User has been created.');

    } catch (err) {
        next(err);
    }
}

export const login = async (req, res, next) => {

    try {

        const user = await User.findOne({ username: req.body.username });

        if (!user)
            next(createError(404, "User not found!"));

        const isCorrect = bcrypt.compareSync(req.body.password, user.password);

        if (!isCorrect)
            next(createError(400, "Wrong password or username!"));

        const token = jwt.sign({
            id: user._id,
            isSeller: user.isSeller
        }, process.env.JWT_KEY);

        const { password, ...info } = user._doc;

        res.cookie("accessToken", token, {
            httpsOnly: true,
        }).status(200).send(info);

    } catch (err) {
        next(err);
    }
}

export const logout = async (req, res) => {

    res.clearCookie("accessToken", {
        sameSite: 'none',
        secure: true,
    }).status(200).send("User has been logged out!");

}