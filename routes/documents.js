const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, permit } = require('../middleware/auth');
const { Document, Rating, User } = require('../models');
const fs = require('fs');
require('dotenv').config();

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req,file,cb) => cb(null, uploadDir),
  filename: (req,file,cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, fileFilter: (req,file,cb) => {
  if (file.mimetype !== 'application/pdf') return cb(new Error('Solo PDF'), false);
  cb(null,true);
}});

// subir (solo institutions)
router.post('/upload', auth, permit('institution'), upload.single('pdf'), async (req,res) => {
  const { title, description } = req.body;
  if (!req.file) return res.status(400).json({ message: 'Archivo faltante' });
  const doc = await Document.create({
    title,
    description,
    filename: req.file.filename,
    originalname: req.file.originalname,
    uploadedBy: req.user.id
  });
  res.json({ success:true, doc });
});

// listar documentos (todos)
router.get('/', auth, async (req,res) => {
  const docs = await Document.findAll({ include: [{ model: User, attributes: ['id','name','email'] }]});
  res.json(docs);
});

// descargar
router.get('/download/:id', auth, async (req,res) => {
  const doc = await Document.findByPk(req.params.id);
  if (!doc) return res.status(404).json({ message: 'No existe' });
  const p = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', doc.filename);
  res.download(p, doc.originalname);
});

// valorar (usuarios registrados)
router.post('/rate/:id', auth, permit('user','admin','institution'), async (req,res) => {
  const { score } = req.body;
  const docId = req.params.id;
  if (!score || score < 1 || score > 5) return res.status(400).json({ message: 'Score 1-5' });
  // upsert: si el usuario ya valoró, actualiza
  let rating = await Rating.findOne({ where: { userId: req.user.id, documentId: docId }});
  if (rating) {
    rating.score = score;
    await rating.save();
  } else {
    rating = await Rating.create({ userId: req.user.id, documentId: docId, score });
  }
  res.json({ success:true, rating });
});

// top 3 endpoint (media)
router.get('/top3', auth, async (req,res) => {
  // calcular promedio y contar
  const docs = await Document.findAll({
    include: [{ model: Rating }]
  });
  const withAvg = docs.map(d => {
    const ratings = d.Ratings || [];
    const avg = ratings.length ? (ratings.reduce((s,r)=>s+r.score,0)/ratings.length) : 0;
    return { id: d.id, title: d.title, originalname: d.originalname, avg, count: ratings.length };
  });
  withAvg.sort((a,b) => b.avg - a.avg);
  res.json(withAvg.slice(0,3));
});

module.exports = router;
