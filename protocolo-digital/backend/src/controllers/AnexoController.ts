import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { ProtocoloService } from '../services/ProtocoloService';

const router = express.Router() as express.Router;
const service = new ProtocoloService();

const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.match(/pdf|png|jpe?g/)) {
      return cb(new Error('Tipo de arquivo inválido'));
    }
    cb(null, true);
  }
});

router.post('/:id/anexos', upload.array('files'), async (req: Request, res: Response) => {
  try {
    const anexos = await service.adicionarAnexos(parseInt(req.params.id, 10), req.files as Express.Multer.File[], req.usuario);
    res.json(anexos);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/:id/anexos/:anexoId', async (req: Request, res: Response) => {
  try {
    await service.removerAnexo(parseInt(req.params.anexoId, 10), req.usuario);
    res.sendStatus(204);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
