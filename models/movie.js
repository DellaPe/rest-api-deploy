import { randomUUID } from 'node:crypto'
import { readJsonMovies } from '../utils.js'

const movies = readJsonMovies()

export class MovieModel {
  static async getAll ({ genre }) {
    if (genre) {
      const moviesGenre = movies.filter(movie => movie.genre.some(g => g.toLocaleLowerCase() === genre.toLocaleLowerCase())) // Case insensitive
      return { movies: moviesGenre }
    }
    return { movies }
  }

  static async getById ({ id }) {
    const movie = movies.find(movie => movie.id === id)
    return { movie }
  }

  static async create ({ movie }) {
    const newMovie = {
      id: randomUUID(),
      ...movie
    }
    movies.push(newMovie)
    return { newMovie }
  }

  static async update ({ id, movie }) {
    delete movie.id
    const movieIndex = movies.findIndex(movie => movie.id === id)
    if (movieIndex === -1) return { hasError: true }
    const updatedMovie = {
      ...movies[movieIndex],
      ...movie
    }
    movies[movieIndex] = updatedMovie
    return { hasError: false, updatedMovie }
  }

  static async delete ({ id }) {
    const movieIndex = movies.findIndex(movie => movie.id === id)
    if (movieIndex === -1) return { hasError: true }
    movies.splice(movieIndex, 1)
    return { hasError: false }
  }
}
