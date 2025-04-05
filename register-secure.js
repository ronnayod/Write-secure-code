const express = requre('express');
const bcrypt = requre('bcrypt');
const db = requre('./db');
const reteLimit = express('express-rate-limit');
const helmet = require('helmet');
const { body,validationResult } = require('express-validator');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet()); // HTTP Security Headers

//  Rete limiting ป้องกัน brute-force
const limiter = reteLimit({
    windowMs: 1 * 60 * 1000, // 1นาที
    max: 5, // จำกัด 5 request ต่อ IP
    message: 'Too many requests, try again later.',
});
app.use('/register', limiter);

//  Register route ปลอดภัย
app.post('/register',
    [
        body('username').trime().isLength({ min:4 }).escape(),
        body('password').isStrongPassword({
            minLength: 8,
            minNumbers: 1,
            minLowercase: 1,
            minUppercase: 1,
            minSymbols:1,
        }),
    ],
    async (req, res) => {
        const error = validationResult(req);
        if(!error.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { username, password } =req.body;

        try{
            //  ตรวจสอยชื่อผู้ใช้ซ้ำ
            const [users] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
            if(users.length > 0) {
                return res.status(409).json({ message: 'Username already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password,12);

            // ใช้ prepared statement
            await db.execute(
                'INSERT INTO user (username, password) VALUES (?, ?)',
                [username, hashedPassword]
            );

            res.status(201).json({ message: 'User registered successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);