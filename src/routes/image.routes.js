import express from 'express'
import multer from 'multer'
import bodyParser from 'body-parser'
import path from 'path'
import { isAuthorized } from '../auth.js'

export const imageRouter = express.Router()
imageRouter.use(bodyParser.json())

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    cb(null, path.parse(file.originalname).name + '-' + Date.now() + path.extname(file.originalname))
  },
})
const upload = multer({ storage: storage })

imageRouter.post('/upload', isAuthorized, upload.single('file'), function (req, res) {
  // req.file is the `profile-file` file
  //   console.log(req.file)
  let imageUrl = req.protocol + '://' + req.get('host') + 'public/images/'
  return res.status(200).send({
    photoURL: imageUrl + req.file.filename,
  })
})
