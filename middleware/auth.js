import { admin as fb } from "../fb/firebase.js";

async function createSessionCookie(req, res, next) {
    const expiresIn = 1000 * 60 * 60 * 24 * 5;
    const idToken = req.body.idToken;
    console.log("recieved ID token: ", idToken);

    try {
        const sessionCookie = await fb.auth().createSessionCookie(idToken, { expiresIn });
        const options = { maxAge: expiresIn, httpOnly: true };
        res.cookie("session", sessionCookie, options);
        console.log("session cookie set")
        res.status(200).end();
    } catch (error) {
        error.status = 401;
        next(error);
    }
}

async function allowed(req, res, next) {
    const sessionCookie = req.cookies.session || "";

    try {
        res.locals.user = (await fb.auth().verifySessionCookie(sessionCookie, true)).uid;
        next();
    } catch (error) {
        error.status = 401;
        next(error);
    }
}

export { createSessionCookie, allowed };