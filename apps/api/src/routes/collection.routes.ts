import { Router } from 'express';
import { collectionController } from '../controllers';
import { authMiddleware } from '../middleware';

const router: Router = Router();

router.post('/', authMiddleware, collectionController.create.bind(collectionController));
router.get('/', authMiddleware, collectionController.getAll.bind(collectionController));
router.post(
  '/:id/assets',
  authMiddleware,
  collectionController.addAsset.bind(collectionController)
);

export default router;
