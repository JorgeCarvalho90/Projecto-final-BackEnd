const db = require('../config/firebaseConfig')
const Joi = require("joi")
const jwt = require('jsonwebtoken')

async function createUser(req,res) {
    try{
        const validation = createUserValidation(req.body)
        if (validation.error) {
            return res.status(400).json(validation.error)
        }
        const { email, password, fullName, role} = req.body

        if (role){
            const newUser = {email: email, password: password, fullName: fullName, role: role}
            await db.collection("users").add(newUser)
            return res.status(201).send(`User ${fullName} created as ${role}`)
        } else{
            const newUser = {email: email, password: password, fullName: fullName, role: "user"}
            await db.collection("users").add(newUser)
            return res.status(201).send(`User ${fullName} created as user`)
        }

    }catch(error){
        return res.status(400).json("Something went wrong, try again later");
    }
}


async function loginUser(req,res) {
    const generateToken = (userId, userRole) => {
        const payload = {
          userId: userId,
          userRole: userRole
        };
      
        return jwt.sign(payload, 'edit2025', { expiresIn: '5000h' });
      };

    const { email, password } = req.body;
  
    try {
      // Find user by email in the 'users' collection
      const userDoc = await db.collection('users').where('email', '==', email).limit(1).get();
  
      if (userDoc.empty) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const user = userDoc.docs[0].data();
      const userId = userDoc.docs[0].id;
      const userRole = userDoc.docs[0].role
      
      if (!password){
        return res.status(404).json({ message: 'Input password' })
      }

      if (user.password !== password){
        return res.status(404).json({ message: 'Wrong password' })
      }

      const token = generateToken(userId, userRole);
  
      res.json({ token });
    } catch (error) {
        console.log(error)
      res.status(500).json({ message: 'Internal server error' });
    }
}

function createUserValidation(values){
    const userSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        fullName: Joi.string().required(),
        role: Joi.string().valid("admin", "user")
    })

    const { error } = userSchema.validate(values)
    if (error){
        return { error: error.message}
    } else{
        return { error: false}
    }
}

module.exports = {
    createUser,
    loginUser
}