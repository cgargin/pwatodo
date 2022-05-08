/* dependencies */
const express = require("express");
const admin = require("firebase-admin");
const busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
let UUID = require("uuid-v4");

/*   config - express  */
const app = express();

/* config firebase */
const serviceAccount = require("./pwatodo-sak.json");
const { request } = require("http");
const { response } = require("express");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // storageBucket: "tugcircles.appspot.com",
});
const db = admin.firestore();
// var bucket = admin.storage().bucket();

/*  endpoint  - posts */
app.get("/tasks", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");

  let tasks = [];
  db.collection("tasks")
    .orderBy("id", "asc")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          title: doc.data().title,
        });
      });
      response.send(tasks);
    });
});

/* endpoint - deletePost */
app.post("/deletePost", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const bb = busboy({ headers: request.headers });
  let fields = {};
  bb.on("field", (name, val, info) => {
    fields[name] = val;
  });
  bb.on("close", () => {
    let fName = fields.id + ".png";
    bucket
      .file(fName)
      .delete()
      .then((res) => {
        deleteDocument(fields.id);
      })
      .catch((err) => {
        console.log(err);
      });
    function deleteDocument(id) {
      db.collection("posts")
        .doc(id)
        .delete()
        .then(
          (res) => {
            console.log(res);
            response.send("Post Deleted:" + fields.id);
          },
          (err) => {
            console.log(err);
          }
        );
    }
  });
  request.pipe(bb);
});

/*  endpoint  - createTask */
app.post("/createTask", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const bb = busboy({ headers: request.headers });
  let fields = {};
  bb.on("field", (name, val, info) => {
    fields[name] = val;
  });
  bb.on("close", () => {
    db.collection("tasks")
      .doc(fields.id)
      .set(fields)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  });
  request.pipe(bb);
});

/* endpoint - update favCount */
app.post("/updatePost", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const bb = busboy({ headers: request.headers });
  let fields = {};
  bb.on("field", (name, val, info) => {
    fields[name] = val;
  });
  bb.on("close", () => {
    db.collection("posts")
      .doc(fields.id)
      .set(
        {
          favCount: fields.favCount,
        },
        { merge: true }
      )
      .then((res) => {
        console.log(res);
        response.send("FavCount Updated", fields.id, fields.favCount);
      })
      .catch((err) => {
        console.log(err);
      });
  });
  request.pipe(bb);
});

/* listen */
app.listen(process.env.PORT || 3000);
