import { Router } from 'express'
import { MovieController } from '../controllers/movies.js'

export const createMovieRouter = ({ movieModel }) => {
  const movieController = new MovieController({ movieModel })

  const movieRouter = Router()

  movieRouter.get('/', movieController.getAll)
  movieRouter.get('/:id', movieController.getById)
  
  movieRouter.post('/', movieController.create)
  
  movieRouter.patch('/:id', movieController.update)
  
  movieRouter.delete('/:id', movieController.delete)

  return movieRouter
}

