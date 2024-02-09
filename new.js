app.get("/users", async (req, res) => {
    // res.send('Hello World!')
    try {
      const result = await con.promise().query("select * from users");
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });