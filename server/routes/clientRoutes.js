import { Router } from 'express'
import auth from '../middleware/auth.js'
import { createClient, getClients, getClient, updateClient, deleteClient } from '../controllers/clientController.js'

const router = Router()

router.use(auth)
router.get('/', getClients)
router.get('/:id', getClient)
router.post('/', createClient)
router.put('/:id', updateClient)
router.delete('/:id', deleteClient)

export default router



