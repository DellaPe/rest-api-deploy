import 'dotenv/config'
import mongoose from 'mongoose'
import { createApp } from '../app.js'
// Models
import { MovieModel } from '../modules/movies/models/mongodb/movies.js'

const connectAndCreateApp = async () => {
  await mongoose.connect(process.env.MONGO_DB_URL)
  createApp({ movieModel: MovieModel })
} // Si hay error en la conexión, el servidor no se levanta

connectAndCreateApp()
