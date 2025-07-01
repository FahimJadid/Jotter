const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
}

async function loginWithGoogle(token) {
    const payload = await verifyGoogleToken(token);
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
        user = new User({
            email,
            username: name,
            profilePicture: picture,
            // Additional fields can be added here
        });
        await user.save();
    }

    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { user, authToken };
}

module.exports = {
    loginWithGoogle,
};