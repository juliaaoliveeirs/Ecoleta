const express = require("express")
const server = express()

// pegar o banco de dados
const db = require("./database/db")

// configurar pasta publica
server.use(express.static("public"))

//habilitar o uso do req.body na nossa aplicação
server.use(express.urlencoded({ extended: true }))

// utilizando template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})

// configurar caminhos da minha aplicação
// req: Requisição
// res: Resposta
// página inicial
// Isso é uma ArrowFunction, somente com parametros. 
server.get("/", (req, res) => {
        res.render("index.html", { title: "Um Título" })
    })
    //Outras páginas
server.get("/create-point", (req, res) => {
    //req.query = Query Strings da nossa url
    res.render("create-point.html")
})

server.post("/savepoint", (req, res) => {
    //req.body = o corpo do nosso formulario
    //inserir dados no banco de dados
    const query = `
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) 
        VALUES (?,?,?,?,?,?,?);
    `
    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err) {
        if (err) {
            console.log(err)
            return res.send("Erro no cadastro!")
        }
        // console.log("Cadastrado com sucesso")
        // console.log(this)
        return res.render("create-point.html", { saved: true })
    }
    db.run(query, values, afterInsertData)
})

server.get("/search", (req, res) => {

    const search = req.query.search

    if (search == "") {
        // pesquisa vazia
        return res.render("search-results.html", { total: 0 })
    }

    //pegar os dados do banco de dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows) {
        if (err) {
            return Console.log(err)
        }

        // contando quantos elementos tem no array
        const total = rows.length

        // mostrando a página html com os dados do DB
        res.render("search-results.html", { places: rows, total })
    })
})

// ligar o servidor
server.listen(3000)