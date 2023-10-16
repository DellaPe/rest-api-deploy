import { validateMovie, validatePatchMovie } from '../movie-scheme.js'

export class MovieController {
  constructor ({ movieModel }) {
    this.movieModel = movieModel
  }

  getAll = async (req, res) => {
    const { genre } = req.query // query params
    const { movies } = await this.movieModel.getAll({ genre }) // No savemos si es sin
    res.json(movies)
  }

  getById = async (req, res) => { // path-to-regexp
    const { id } = req.params
    const { movie } = await this.movieModel.getById({ id })
    if (movie) return res.json(movie)
    res.status(404).json({ error: 'Movie not found' })
  }

  create = async (req, res) => {
    const result = validateMovie(req.body)
    if (result.error) return res.status(400).json({ errors: JSON.parse(result.error.message) }) // o 422
    const { newMovie } = await this.movieModel.create({ movie: result.data })
    res.status(201).json(newMovie) // Puede ser util devolver el recurso
  }

  update = async (req, res) => {
    const { id } = req.params
    const { hasError, updatedMovie } = await this.movieModel.update({ id, movie: req.body })
    if (hasError) return res.status(404).json({ error: 'Movie not found' })
    const result = validatePatchMovie(req.body)
    if (result.error) return res.status(400).json({ errors: JSON.parse(result.error.message) })
    res.json(updatedMovie)
  }

  delete = async (req, res) => {
    const { id } = req.params
    const { hasError } = await this.movieModel.delete({ id })
    if (hasError) return res.status(404).json({ error: 'Movie not found' })
    res.json('Movie deleted')
  }
}
