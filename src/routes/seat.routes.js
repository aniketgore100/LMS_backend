const router = require('express').Router();
const ctrl = require('../controllers/seat.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { seatValidator } = require('../validators/seat.validator');
const { validate } = require('../middleware/validate.middleware');

router.use(authenticate);

router.get('/', ctrl.getSeats);
router.get('/stats', ctrl.getSeatStats);
router.post('/', seatValidator, validate, ctrl.createSeat);
router.get('/:id', ctrl.getSeatById);
router.put('/:id', ctrl.updateSeat);
router.delete('/:id', ctrl.deleteSeat);
router.post('/:id/assign', ctrl.assignMember);
router.post('/:id/release', ctrl.releaseSeat);
router.post('/:id/unassign', ctrl.releaseSeat);

module.exports = router;
