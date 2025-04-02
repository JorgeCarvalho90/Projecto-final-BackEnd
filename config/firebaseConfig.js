var admin = require("firebase-admin");
var serviceAccount = require("../config/projecto-final-backend-firebase-adminsdk-fbsvc-1c8969ef99.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore()

module.exports = db