import { Router } from 'express';
import multer from 'multer';
import { assetController } from '../controllers';
import { authMiddleware } from '../middleware';

const router: Router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/upload',
  authMiddleware,
  upload.single('file'),
  assetController.upload.bind(assetController)
);

router.get('/search', authMiddleware, assetController.search.bind(assetController));
router.get('/:id', authMiddleware, assetController.getById.bind(assetController));
router.delete('/:id', authMiddleware, assetController.delete.bind(assetController));
router.get('/:id/download', authMiddleware, assetController.download.bind(assetController));

export default router;
