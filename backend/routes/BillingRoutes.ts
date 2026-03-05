import { Router } from "express";
import { createBilling } from "../controllers/billing/CreateBilling";
import { getBilling } from "../controllers/billing/GetBilling";
import { createBillingDetails } from "../controllers/billing_details/CreateBillingDetails";
import { getBillingDetails } from "../controllers/billing_details/GetBillingDetails";
import { editBillingDetails } from "../controllers/billing_details/EditBillingDetails";
import { deleteBillingDetails } from "../controllers/billing_details/DeleteBillingDetails";

const router = Router();

router.post('/create', createBilling);
router.get('/', getBilling);
router.post('/details/create', createBillingDetails);
router.get('/details/:facturaId', getBillingDetails);
router.put('/details/edit/:id', editBillingDetails);
router.delete('/details/delete/:id', deleteBillingDetails);

export { router as BillingRoutes };
