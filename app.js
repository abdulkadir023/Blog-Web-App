import express from 'express';
import bodyParser from 'body-parser';
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3001;

//static files


//Middleware
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'));
//In-memory storage for posts
let posts =[];

let date = new Date();    
let year = date.getFullYear();
//Routes
//Display all Blog posts
//HOME Page
app.get('/', (req, res) => {
    res.render("index", {posts, year});
});

//About page

app.get('/about', (req, res) => {
    res.render("about");
});

//Create Blog posts
app.get('/create', (req, res) => {
    res.render('create', {posts, year});
});


app.post('/create', (req, res) => {
    const newPost = {
        id: Date.now(), //Unique id for each post
        author : req.body.author,
        date: year,
        title: req.body.title,
        content: req.body.content
        
    };

    //push each post to the "posts" collection/array
    posts.push(newPost);
    //console.log(JSON.stringify(posts));
    res.redirect('/');
});


//View Posts(/posts/:id)

//Display an Individual post

app.get('/posts/:id', (req, res) => {
    const post = posts.find(post => post.id === parseInt(req.params.id));
    if(!post) return res.status(404).send('Post not found');

    res.render('post', { post, year});
});



//Edit Posts(/posts/:id/edit)

app.get('/posts/:id/edit', (req, res) =>{
    const post = posts.find(post => post.id === parseInt(req.params.id));
    if(!post) return res.status(404).send('Post not found');
    res.render('edit', { post, year });
});

app.post('/posts/:id/edit', (req, res) =>{
    const post = posts.find(post => post.id === parseInt(req.params.id));
    if(!post) return res.status(404).send('Post not found');

    post.title = req.body.title;
    post.content = req.body.content;
    post.author = req.body.author;
    post.date = req.body.date;

    res.redirect('/');
});


//Delete Posts(/posts/:id/delete)

app.post('/posts/:id/delete', (req, res) => {
    posts = posts.filter(post => post.id !== parseInt(req.params.id));
    res.redirect('/');
});



export default app;