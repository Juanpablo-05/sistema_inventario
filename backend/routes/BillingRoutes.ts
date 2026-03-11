import { Router } from "express";
import { createBilling } from "../controllers/billing/CreateBilling";
import { getBilling } from "../controllers/billing/GetBilling";
import { editBilling } from "../controllers/billing/EditBiling";
import { deleteBilling } from "../controllers/billing/DeleteBilling";
import { issueBilling } from "../controllers/billing/IssueBilling";
import { createBillingDetails } from "../controllers/billing_details/CreateBillingDetails";
import { getBillingDetails } from "../controllers/billing_details/GetBillingDetails";
import { editBillingDetails } from "../controllers/billing_details/EditBillingDetails";
import { deleteBillingDetails } from "../controllers/billing_details/DeleteBillingDetails";

const router = Router();

router.post('/create', createBilling);
router.post('/issue', issueBilling);
router.get('/', getBilling);
router.put('/edit/:id', editBilling);
router.delete('/delete/:id', deleteBilling);
router.post('/details/create', createBillingDetails);
router.get('/details/:facturaId', getBillingDetails);
router.put('/details/edit/:id', editBillingDetails);
router.delete('/details/delete/:id', deleteBillingDetails);

export { router as BillingRoutes };
