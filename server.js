const express = require("express");
const con = require("./database");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const bodyParser = require("body-parser");
const uuId = uuidv4();
const app = express();

app.use((req, res, next) => {
  req.header["request_id"] = uuId;

  // if (!req.headers.hasOwnProperty("user_id")) {
  //   const log = `\n ${JSON.stringify({
  //     headers: req.headers,
  //     url: req.url,
  //     body: req.body,
  //     method: req.method,
  //     message: "User Id Not Found in headers",
  //     request_id: req.headers.request_id,
  //   })}`;
  //   fs.appendFile("log.txt", log, console.log);

  //   res.status(400).send({ msg: "User Id required" });
  // } else {
    next();
  
});

app.use(bodyParser.json());

//get all users
app.get("/users", async (req, res) => {
  // res.send('Hello World!')
  try {
    console.log(req.header);
    const result = await con.promise().query("select * from users");
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
    console.log(err);
  }
});

//get single user
app.get("/users/:id", async (req, res,next) => {
  // res.send('Hello World!')
  try {
    let user_id = req.params.id;
    if (!user_id) {
      res.status(400).send({ message: "user_id is required" });
    }
    console.log(user_id);

    con.query("select email,password,is_active from users where id = ?", [user_id], function (err, result) {
      console.log(result);
      res.send(result);
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
    console.log(err);
  }
});

//delete user
app.delete("/users", (req, res,next) => {
  try {
    const id = req.query.id;
    if (!id) {
      res.status(400).send({ message: "id is required" });
    }
    con.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
    console.log(err);
  }
});
//insert user
app.post("/users", async (req, res,next) => {
  try {
    let { email, password, is_active, created_at } = req.body;
    if (!email || !password) {
      res.status(400).send({ message: "email and password is required" });
    }

    let sql =
      "INSERT INTO users(email,password,is_active,created_at) values (?,?,?,?)";
    const result = await con
      .promise()
      .query(sql, [email, password, is_active, created_at]);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
    console.log(err);
  }
});
//update user
app.put("/users/:id/:email", async (req, res,next) => {
  try {
    const { id } = req.params;
    const { email,phone_no} = req.body;
    // const {email,password,is_active,created_at,updated_at} = req.body
    if (!email && !phone_no) {
      res.status(400).send({ message: "email is required" });
    }
    if(!id){
      res.status(400).send({message:"id is required"})
    }

    let setData = [];
    let querydata = [];

    if(email){
      setData.push("email=?");
      querydata.push(email);
    }

    if(phone_no){
      setData.push("phone_no");
      querydata.push(phone_no)
    }

    let setstring = setData.json(",")

    let querystring = `update users set ${setstring} where id =?`;
    const result = await con.promise().query(querystring, [...queryData, id]);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
    console.log(err);
  }
});

app.listen(3000, () => {
  console.log(`server started`);
});

const getUsers = async (req, res, next) => {
  console.log("ffffnode");
  try {
    const { id, limit, offset } = req.query;
    console.log(id, limit, offset);
    const queryData = req.query;
    // let phoneNo = queryData.id;
    // if (!phoneNo) {
    //   res.status(400).send({ message: "phone_no is required" });
    // }

    const queryString =
      "SELECT email, is_active, created_at FROM users WHERE id = ? LIMIT ? OFFSET ?";
    const [results] = await con
      .promise()
      .execute(queryString, [id, limit, offset]);
    const countQueryString = "SELECT COUNT(*) as count FROM users";
    const [countResults] = await con.promise().execute(countQueryString);

    const responseBody = {
      message: "Users list",
      list: results,
      count: countResults[0].count,
    };

    res.status(200).send(responseBody);
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error" });
    console.log(err);
  }
};

//get users
app.get("/use", getUsers);

app.get("/actors", async (req, res) => {
  // res.send('Hello World!')
  try {
    console.log(req.header);

    const [result] = await con.promise().query("select name, is_active, created_at from actors");

    const countQueryString = "SELECT COUNT(*) as count FROM actors";
    const [countResults] = await con.promise().execute(countQueryString);

    const responseBody = {
      message: "actors list",
      list: result,
      count: countResults[0].count,
    };

    res.status(200).send(responseBody);

  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
    console.log(err);
  }
});

app.get("/profiles", async (req, res) => {
  // res.send('Hello World!')
  try {
    console.log(req.header);
    const [result] = await con.promise().query("select id,name,is_active from profiles");
    

    const countQueryString = "SELECT COUNT(*) as count FROM profiles";
    const [countResults] = await con.promise().execute(countQueryString);

    const responseBody = {
      message: "profiles list",
      list: result,
      count: countResults[0].count,
    };

    res.status(200).send(responseBody);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
    console.log(err);
  }
});

app.get("/videos", async (req, res) => {
  try {
    console.log(req.header);
    const [result] = await con.promise().query("select id,title,description,cast,is_active from videos");
    // res.send(result);
    const countQueryString = "SELECT COUNT(*) as count FROM videos";
    const [countResults] = await con.promise().execute(countQueryString);

    const responseBody = {
      message: "videos list",
      list: result,
      count: countResults[0].count,
    };

    res.status(200).send(responseBody);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
    console.log(err);
  }
});

app.get("/actor_in_videos", async (req, res) => {
  try {
    console.log(req.header);
    const [result] = await con.promise().query("select id,actor_id,video_id,is_active from actor_in_videos");
    // res.send(result);
    const countQueryString = "SELECT COUNT(*) as count FROM actor_in_videos";
    const [countResults] = await con.promise().execute(countQueryString);

    const responseBody = {
      message: "actor_in_videos list",
      list: result,
      count: countResults[0].count,
    };

    res.status(200).send(responseBody);

  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
    console.log(err);
  }
});

app.get("/videostauts", async (req, res) => {
  try {
    console.log(req.header);
    const [result] = await con.promise().query("select id,profile_id,video_id,status,lastwatch,is_active from videostatus");
    const countQueryString = "SELECT COUNT(*) as count FROM videostatus";
    const [countResults] = await con.promise().execute(countQueryString);

    const responseBody = {
      message: "videostatus list",
      list: result,
      count: countResults[0].count,
    };

    res.status(200).send(responseBody);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
    console.log(err);
  }
});

// Get all profiles
app.get("/profiles", async (req, res) => {
  try {
    const result = await con.promise().query("SELECT id,user_id,name,type,is_active FROM profiles");
    const countQueryString = "SELECT COUNT(*) as count FROM profiles";
    const [countResults] = await con.promise().execute(countQueryString);

    const responseBody = {
      message: "profiles list",
      list: result,
      count: countResults[0].count,
    };

    res.status(200).send(responseBody);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get single profile
app.get("/profiles/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const result = await con
      .promise()
      .query("SELECT * FROM profiles WHERE id = ?", [id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Delete profile
app.delete("/profiles", async (req, res) => {
  try {
    const id = req.query.id;
    const result = await con
      .promise()
      .query("DELETE FROM profiles WHERE id = ?", [id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Insert profile
app.post("/profiles", async (req, res) => {
  try {
    let { user_id, name, type, is_active, created_at } = req.body;
    const result = await con
      .promise()
      .query(
        "INSERT INTO profiles(user_id, name, type, is_active, created_at) values (?, ?, ?, ?, ?)",
        [user_id, name, type, is_active, created_at]
      );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Update profile
app.put("/profiles/:id/:name", async (req, res) => {
  try {
    const { name, id } = req.params;
    const result = await con
      .promise()
      .query("UPDATE profiles SET name = ? WHERE id = ?", [name, id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get all videos
app.get("/videos", async (req, res) => {
  try {
    const result = await con.promise().query("SELECT * FROM videos");
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get single videos
app.get("/videos/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const result = await con
      .promise()
      .query("SELECT * FROM videos WHERE id = ?", [id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Delete videos
app.delete("/videos", async (req, res) => {
  try {
    const id = req.query.id;
    const result = await con
      .promise()
      .query("DELETE FROM videos WHERE id = ?", [id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Insert videos
app.post("/videos", async (req, res) => {
  try {
    let { id, title, description, cast, is_active, created_at } = req.body;
    const result = await con
      .promise()
      .query(
        "INSERT INTO videos(id, title, description,cast, is_active, created_at) values (?, ?, ?, ?,?, ?)",
        [id, title, description, cast, is_active, created_at]
      );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Update videos
app.put("/videos/:id/:title", async (req, res) => {
  try {
    const { name, id } = req.params;
    const result = await con
      .promise()
      .query("UPDATE profiles SET title = ? WHERE id = ?", [title, id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get single actor
app.get("/actors/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const result = await con
      .promise()
      .query("SELECT * FROM actors WHERE id = ?", [id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Delete actor
app.delete("/actors", async (req, res) => {
  try {
    const id = req.query.id;
    const result = await con
      .promise()
      .query("DELETE FROM actors WHERE id = ?", [id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Insert actor
app.post("/actors", async (req, res) => {
  try {
    let { name, is_active, created_at } = req.body;
    const result = await con
      .promise()
      .query(
        "INSERT INTO actors(name, is_active, created_at) values (?, ?, ?)",
        [name, is_active, created_at]
      );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Update actor
app.put("/actors/:id/:name", async (req, res) => {
  try {
    const { name, id } = req.params;
    const result = await con
      .promise()
      .query("UPDATE actors SET name = ? WHERE id = ?", [name, id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get single actor_in_videos
app.get("/actor_in_videos/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const result = await con
      .promise()
      .query("SELECT * FROM actor_in_videos WHERE id = ?", [id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Delete actor_in_videos
app.delete("/actor_in_videos", async (req, res) => {
  try {
    const id = req.query.id;
    const result = await con
      .promise()
      .query("DELETE FROM actor_in_videos WHERE id = ?", [id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Insert actor_in_videos
app.post("/actor_in_videos", async (req, res) => {
  try {
    let { actor_id, video_id, is_active, created_at } = req.body;
    const result = await con
      .promise()
      .query(
        "INSERT INTO actor_in_videos(actor_id, video_id, is_active, created_at) values (?, ?, ?, ?)",
        [actor_id, video_id, is_active, created_at]
      );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Update actor_in_videos
app.put("/actor_in_videos/:id/:actor_id", async (req, res) => {
  try {
    const { actor_id, id } = req.params;
    const result = await con
      .promise()
      .query("UPDATE actor_in_videos SET actor_id = ? WHERE id = ?", [
        actor_id,
        id,
      ]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get single videostatus
app.get("/videostatus/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const result = await con
      .promise()
      .query("SELECT * FROM videostatus WHERE id = ?", [id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Delete videostatus
app.delete("/videostatus", async (req, res) => {
  try {
    const id = req.query.id;
    const result = await con
      .promise()
      .query("DELETE FROM videostatus WHERE id = ?", [id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Insert videostatus
app.post("/videostatus", async (req, res) => {
  try {
    let { profile_id, video_id, status, lastwatch, is_active, created_at } =
      req.body;
    const result = await con
      .promise()
      .query(
        "INSERT INTO videostatus(profile_id, video_id, status, lastwatch, is_active, created_at) values (?, ?, ?, ?, ?, ?)",
        [profile_id, video_id, status, lastwatch, is_active, created_at]
      );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Update videostatus
app.put("/videostatus/:id/:status", async (req, res) => {
  try {
    const { status, id } = req.params;
    const result = await con
      .promise()
      .query("UPDATE videostatus SET status = ? WHERE id = ?", [status, id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.put("/users/:id/:email", async (req, res) => {
  const { email, id } = req.params;
  let setData = [];
  let queryData = [];

  if (!id || !email) {
    res.status(400).send({
      message: "Bad request",
    });
  }
  if (email) {
    setData.push("email = ?");
    queryData.push(email);
  }
  if (phone_no) {
    setData.push("phone_no=?");
    queryData.push(phone_no);
  }

  const setstring = setData.join(",");
  // const {email,password,is_active,created_at,updated_at} = req.body
  let querystring = `update users set ${setData} where id =?`;
  const [results] = await con.promise().query(querystring, [...queryData, id]);
  // res.send(result);

  res.status(201).send({
    message: "users added successfully",
    results,
  });
});




app.get("/users" ,async(req,res)=>{
  try{
   var sql ="SELECT * FROM Users";
   const result =await con.promise().query(sql);
   console.log(result[0])
   res.json(result[0]);
  }catch(err){
     return res.status(500).send({
       errr : err
     })
  }
});

//---------------------------login api ------------------------------//

const userlogin =  async (req, res , next) => {
  try{
   const { email } = req.body;
   const { password } = req.body;
 
   if (!email && !password) {
     res.status(400).send({
       message: "missing parameters",
     });

     

   }else{
    
   let string = `select email,password from users  where email=? and password=?`
   let [result] = await con.promise().execute(string,[email,password]);

   if (result.length === 0) {
    res.status(404).send({
      message: "User not found",
    });
  }else{

  res.status(200).send({
    message: "Successfully login user",
    result,
  });
  }
}}
  catch(error){
    console.log(error);
    res.status(500).send({
      message: "Error while getting user",
      error,
    });
  }}
 
  //  if (!password) {
  //    res.status(400).send({
  //      message: "Bad request",
  //    });
  //  }

  //  let string = `select email,password from users  where email=? and password=?`
  //  let [result] = await con.promise().execute(string,[email,password]);

  //  if (result.length === 0) {
  //   res.status(404).send({
  //     message: "User not found",
  //   });
  // }

  // res.status(200).send({
  //   message: "Successfully login user",
  //   result,
  // });
  // }

 

  app.post('/v1/login', userlogin)

//product pagination filter 
//add in wishlist product
//user product list price,sort by price,
//filter men/women