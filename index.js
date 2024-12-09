import express from 'express';
import bodyParser from 'body-parser';
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

//static files


//Middleware
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'));
//In-memory storage for posts
let posts =[];

const db = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database:  'Blog_Posts',
    password: 'Admin',
    port: 5432
});

db.connect();


let date = new Date();    
let year = date.getFullYear();

//Routes
//Display all Blog posts
//HOME Page

app.get('/', async (req, res) => {

    const result = await db.query('SELECT * FROM posts');

    let posts = result.rows;
    //console.log("Result: ", result.rows);
    console.log("Posts: ", posts);

    res.render("index", {posts, year});
    
});

//About page

app.get('/about', (req, res) => {
    res.render("about");
});

//Create Blog posts
app.get('/create', (req, res) => {
    //After learning inserting data into the database implement the create method for creating new blog posts
    res.render('create', {posts, year});
});

app.post('/create', async(req, res) => {

    try {

         // Extract data from the request body
         const {author, title, content} = req.body;

         // Insert data into the database
        const newPost = await db.query("INSERT INTO posts (author, title, content) VALUES ($1, $2, $3) RETURNING * ",
            [author, title, content]
        );  

        console.log("Inserted the post Successfully into the database");
        console.log("New Post: ", newPost.rows[0]);  

        res.status(201).redirect('/');
        
    } catch (error) {
    console.error("Error inserting post:", error);
    res.status(500).send("An error occurred while creating the post");
        
    }
});

//View Posts(/posts/:id)

//Display an Individual post

app.get('/posts/:id', async(req, res) => {

    try {
        // Extract data from the request body
        const id = req.params.id;

        // Retreive the data from the database where the id from the request body matches the id from the database
        const result = await db.query(`SELECT * FROM posts WHERE id = ${id}`);
    
        //Retreive the row with the specified id
        const post = result.rows[0];
        //console.log(post);
        res.status(200).render('post', { post, year});
        
    } catch (error) {
        console.log("Error Retrieving Post",error);
        res.status(500);
        
    }
});

//Edit Posts(/posts/:id/edit)

app.get('/posts/:id/edit', async(req, res) =>{

    try {
        const id = req.params.id;
        const result = await db.query(`SELECT * FROM posts WHERE id = ${id} `);
        const post = result.rows[0];
        //console.log(post);
        res.render('edit', { post, year });
        
    } catch (error) {
        console.log("Error Editing Post", error);
        res.status(500);
        
    }
});

app.post('/posts/:id/edit', async(req, res) =>{

    try {
    // Retreive data from the req body AND parameters
    const {author, title, content } = req.body;
    const {id} = req.params;
    //console.log("Request Params (ID):", id);
    //console.log("Request Body:", { author, title, content });

    const query = `
    UPDATE posts
    SET author = $1, title = $2, content = $3
    WHERE id = $4
  `;
    
    // Execute the query
    const result = await db.query(query, [author, title, content, id]);

    // Check if any rows were updated
    if (result.rowCount === 0) {
      return res.status(404).send("Post not found");
    }

    res.redirect('/');
  
    } catch (error) {
        console.log("Error Updating Post", error);

        res.status(500).send("An Error Occured while Updating the Post");
        
    }

});


//Delete Posts(/posts/:id/delete)

app.post('/posts/:id/delete', async(req, res) => {

    try {
        const { id } = req.params;

        const result = await db.query(`DELETE FROM posts WHERE id = ${id}`);

            // Check if a row was deleted
         if (result.rowCount === 0) {
            console.log("No post found to delete with the given ID");
            return res.status(404).send("Post not found");
         }
      //console.log("Post deleted successfully");
      res.status(200).redirect('/');
        
    } catch (error) {
        console.error("Error deleting post", error);
        res.status(500).send("An error occurred while deleting the post");
        
    }

   
});

app.listen(port, () => {
    console.log(`listening on port http://localhost:${port}`);
})

