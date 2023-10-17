import mongoose from 'mongoose'
import { randomUUID } from 'node:crypto'
import { FAILD_CONNECT, MOVIE_EXISTS_TITLE, MOVIE_EXISTS_ID, MOVIE_NOT_FOUND } from '../../../../constansError.js'

const movieSchema = new mongoose.Schema({
  _id: String,
  title: String,
  year: Number,
  director: String,
  duration: Number,
  rate: Number,
  poster: String,
  genre: [String]
})

const MovieModelDB = mongoose.model('Movie', movieSchema)

export class MovieModel {
  static async getAll ({ genre }) {
    try {
      const movies = await MovieModelDB.find().exec()
      if (!genre) return { movies }

      const lowerCaseGenre = genre.toLocaleLowerCase()
      movies.filter(movie => movie.genre.some(g => g.toLocaleLowerCase() === lowerCaseGenre))
      return { hasError: false, movies }
    } catch (error) {
      return { hasError: true, error: FAILD_CONNECT }
    }
  }

  static async getById ({ id }) {
    try {
      const movie = await MovieModelDB.findById(id).exec()
      if (!movie) return { hasError: true, error: MOVIE_NOT_FOUND }
      return { movie }
    } catch (error) {
      return { hasError: true, error: FAILD_CONNECT }
    }
  }

  static async create ({ movie }) {
    try {
      // Validación nombre
      const lowerMovieTitle = movie.title.toLocaleLowerCase()
      const movies = await MovieModelDB.find().exec()
      const movieTitleExists = movies.some(movie => movie.title.toLocaleLowerCase() === lowerMovieTitle)
      if (movieTitleExists) return { hasError: true, error: MOVIE_EXISTS_TITLE }
      // Validación id
      const id = randomUUID()
      const movieIdExists = movies.some(movie => movie._id === id)
      if (movieIdExists) return { hasError: true, error: MOVIE_EXISTS_ID }
      // Crear pelicula
      const newMovie = { // Si esta bien filtado con zod
        _id: id,
        ...movie
      }
      const newMovieDB = new MovieModelDB(newMovie)
      await newMovieDB.save()
      return { newMovie }
    } catch (error) {
      return { hasError: true, error: FAILD_CONNECT }
    }
  }

  static async update ({ id, movie }) {
    try {
      const movieDB = await MovieModelDB.findById(id).exec()
      if (!movie) return { hasError: true, error: MOVIE_NOT_FOUND }
      // Se puede mejorar lo siguiente
      const { title, year, director, duration, rate, poster, genre } = movie
      if (title) movieDB.title = title
      if (year) movieDB.year = year
      if (director) movieDB.director = director
      if (duration) movieDB.duration = duration
      if (rate) movieDB.rate = rate
      if (poster) movieDB.poster = poster
      if (genre) movieDB.genre = genre
      await movieDB.save()
      return { hasError: false, movie: movieDB }
    } catch (error) {
      return { hasError: true, error: FAILD_CONNECT }
    }
  }

  static async delete ({ id }) {
    try {
      const movie = await MovieModelDB.findByIdAndDelete(id).exec()
      if (!movie) return { hasError: true, error: MOVIE_NOT_FOUND }

      await MovieModelDB.findOneAndDelete(id).exec()
      return { hasError: false }
    } catch (error) {
      return { hasError: true, error: FAILD_CONNECT }
    }
  }
}
