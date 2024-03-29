import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import UserModal from "../models/user.js";

const secret = 'test';

export const signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({error:"Plz Filled the data"})
}
  try {
    const oldUser = await UserModal.findOne({ email });

    if (!oldUser) return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, { expiresIn: "1h" });

    res.status(200).json({ result: oldUser, token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const signup = async (req, res) => {
  const { email, password, firstName, lastName , confirmPassword} = req.body;
  if (!firstName || !lastName || !email ||  !password || !confirmPassword ) {
    return res.status(422).json({ error: "Plz filled the field properly" });
}
  try {
    const oldUser = await UserModal.findOne({ email });

    if (oldUser) {return res.status(422).json({ message: "User already exists" });}
    else if (password != confirmPassword) {
      return res.status(422).json({ error: "passwords are not matching" });
 }
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await UserModal.create({ email, password: hashedPassword, name: `${firstName} ${lastName}` });

    const token =await jwt.sign( { email: result.email, id: result._id }, secret, { expiresIn: "1h" } );

    res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    
    // console.log(error);
  }
};
