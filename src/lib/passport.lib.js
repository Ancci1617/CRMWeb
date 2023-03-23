const passport = require("passport");
const PassportLocal = require('passport-local').Strategy;
const pool = require("../model/connection-database")
const { getUserByPassword ,getUserById } = require("../model/auth/getUser")


passport.use(new PassportLocal(async (username, password, done) => {
    
    //Si el ID es distinto de -1 encontro al usuario
    const user = await getUserByPassword(username, password);

    if (user.ID !== -1) return done(null, user);


    //No encontro al usuario
    return done(null, false)
}))


//SEREALIZACION DE PASSPORT
passport.serializeUser(function (user, done) {
    done(null, user.ID);
})
passport.deserializeUser(async (id, done) => {

    const user = await getUserById(id);


    done(null, user)

})

