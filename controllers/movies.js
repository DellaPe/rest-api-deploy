import { MovieModel } from '../models/movie.js'
import { validateMovie, validatePatchMovie } from '../schemas/movies.js'

export class MovieController {
  static async getAll (req, res) {
    const { genre } = req.query // query params
    const { movies } = await MovieModel.getAll({ genre }) // No savemos si es sin
    res.json(movies)
  }

  static async getById (req, res) { // path-to-regexp
    const { id } = req.params
    const { movie } = await MovieModel.getById({ id })
    if (movie) return res.json(movie)
    res.status(404).json({ error: 'Movie not found' })
  }

  static async create (req, res) {
    const result = validateMovie(req.body)
    if (result.error) return res.status(400).json({ errors: JSON.parse(result.error.message) }) // o 422
    const { newMovie } = await MovieModel.create({ movie: result.data })
    res.status(201).json(newMovie) // Puede ser util devolver el recurso
  }

  static async update (req, res) {
    const { id } = req.params
    const { hasError, updatedMovie } = await MovieModel.update({ id, movie: req.body })
    if (hasError) return res.status(404).json({ error: 'Movie not found' })
    const result = validatePatchMovie(req.body)
    if (result.error) return res.status(400).json({ errors: JSON.parse(result.error.message) })
    res.json(updatedMovie)
  }

  static async delete (req, res) {
    const { id } = req.params
    const { hasError } = await MovieModel.delete({ id })
    if (hasError) return res.status(404).json({ error: 'Movie not found' })
    res.json('Movie deleted')
  }
}
