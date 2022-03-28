const express = require("express")
const morgan = require("morgan")

const app = express()
const pagesRoutes = require("./routes/app")


app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(morgan('combined'))
app.use("/", pagesRoutes)

module.exports = app