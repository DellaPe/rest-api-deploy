const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies.json')
const { validateMovie, validatePatchMovie } = require('./schemas/movies')

const MOVIES = 'movies'

const URL_GET = {
  HOME: '/',
  MOVIES: `/${MOVIES}`, // Todos los recursos que sean Películas se identifican con /movies
  MOVIE_ID: `/${MOVIES}/:id`
}

const URL_POST = {
  MOVIES: `/${MOVIES}` // Siempre utilizar el mismo recurso (REST)
}

const URL_PATCH = {
  MOVIES_ID: `/${MOVIES}/:id`
}

const URL_DELETE = {
  MOVIES_ID: `/${MOVIES}/:id`
}

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:1234',
  'http://localhost:pedro.dev'
]

const app = express()
app.disable('x-powered-by')
app.use(express.json()) // Middleware para parsear el body de las peticiones

app.get(URL_GET.HOME, (req, res) => {
  res.send('Hola Mundo')
})

app.get(URL_GET.MOVIES, (req, res) => {
  const origen = req.headers.origin // No siempre manda el header origin, esto sucede cuando la peticion es del mismo origen.
  if (ACCEPTED_ORIGINS.includes(origen) || !origen) {
    // res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Origin', origen) // Fix CORS: todos los orignes que no sean nuestro propio origen, estan permitidos
  }

  const { genre } = req.query // query params
  if (genre) {
    // const moviesByGenre = movies.filter(movie => movie.genre.includes(genre)) // Case sensitive
    const moviesByGenre = movies.filter(movie => movie.genre.some(g => g.toLocaleLowerCase() === genre.toLocaleLowerCase())) // Case insensitive
    if (moviesByGenre) return res.json(moviesByGenre)
    return res.status(404).json({ error: 'Genre not found' })
  }
  res.json(movies)
})

app.get(URL_GET.MOVIE_ID, (req, res) => { // path-to-regexp
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)
  res.status(404).json({ error: 'Movie not found' })
})

app.post(URL_POST.MOVIES, (req, res) => {
  const result = validateMovie(req.body)
  if (result.error) return res.status(400).json({ errors: JSON.parse(result.error.message) }) // o 422
  const newMovie = {
    id: crypto.randomUUID(),
    ...result // solo si estan bien validados, si no, deberia ser destructurado
  }
  movies.push(newMovie) // Esto no seria REST!!!
  res.status(201).json(newMovie) // Puede ser util devolver el recurso
})

app.patch(URL_PATCH.MOVIES_ID, (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) return res.status(404).json({ error: 'Movie not found' })
  const result = validatePatchMovie(req.body)
  if (result.error) return res.status(400).json({ errors: JSON.parse(result.error.message) })
  const movie = movies[movieIndex]
  const updatedMovie = {
    ...movie,
    ...result.data
  }
  movies[movieIndex] = updatedMovie
  res.json(updatedMovie)
})

app.delete(URL_DELETE.MOVIES_ID, (req, res) => {
  const origen = req.headers.origin // No siempre manda el header origin, esto sucede cuando la peticion es del mismo origen.
  if (ACCEPTED_ORIGINS.includes(origen) || !origen) {
    res.header('Access-Control-Allow-Origin', origen) // Fix CORS: todos los orignes que no sean nuestro propio origen, estan permitidos
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) return res.status(404).json({ error: 'Movie not found' })
  movies.splice(movieIndex, 1)
  res.status(204).json('Movie deleted') // No content
})

app.options(URL_DELETE.MOVIES_ID, (req, res) => {
  const origen = req.headers.origin // No siempre manda el header origin, esto sucede cuando la peticion es del mismo origen.
  if (ACCEPTED_ORIGINS.includes(origen) || !origen) {
    res.header('Access-Control-Allow-Origin', origen)
    res.header('Access-Control-Allow-Methods', 'DELETE, GET, PATCH, POST, PUT')
  }
  res.send(200)
})

const PORT = process.env.PORT ?? 1234 // Es necesario para el deploy

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`)
})
