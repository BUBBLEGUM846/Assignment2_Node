import { admin as fb } from "../fb/firebase.js";

async function createSessionCookie(req, res, next) {
    const expiresIn = 1000 * 60 * 60 * 24 * 5; //5 day cookie
    const idToken = req.body.idToken;

    try {
        const sessionCookie = await fb.auth().createSessionCookie(idToken, { expiresIn });

        const options = { maxAge: expiresIn, httpOnly: true }; //enhances security, stoos clientside js 
        res.cookie("session", sessionCookie, options);
        next();
    } catch (error) {
        // unaithorisd error
        error.status = 401;
        next(error);
    }
}

//verify cookie with firebase
async function allowed(req, res, next) {
    const sessionCookie = req.cookies.session || "";

    try {
        res.locals.user = (await fb.auth().verifySessionCookie(sessionCookie, true)).uid;
        next();
        //if session expires, log user out to prevent errors
    } catch (error) {
        console.error("Session verification failed:", error);
        res.clearCookie("session");
        res.locals.user = null;
        next();
    }
}

export { createSessionCookie, allowed };