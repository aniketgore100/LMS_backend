const router = require('express').Router();
const multer = require('multer');
const ctrl = require('../controllers/member.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { memberValidator, memberUpdateValidator } = require('../validators/member.validator');
const { validate } = require('../middleware/validate.middleware');
const { AppError } = require('../middleware/error.middleware');

const allowedCsvMimes = new Set(['text/csv', 'application/csv', 'application/vnd.ms-excel']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isCsvExt = file.originalname?.toLowerCase().endsWith('.csv');
    const isCsvMime = allowedCsvMimes.has(file.mimetype);
    if (!isCsvExt || !isCsvMime) {
      return cb(new AppError('Only CSV files are allowed', 400));
    }
    return cb(null, true);
  },
});

router.use(authenticate);

router.get('/', ctrl.getMembers);
router.post('/', memberValidator, validate, ctrl.createMember);
router.get('/:id', ctrl.getMemberById);
router.put('/:id', memberUpdateValidator, validate, ctrl.updateMember);
router.delete('/:id', ctrl.deleteMember);
router.post('/csv/preview', upload.single('file'), ctrl.previewCSV);
router.post('/csv/import', upload.single('file'), ctrl.importCSV);

module.exports = router;
